import { useState, useEffect, useCallback, useRef } from "react";
import Card from "../components/Card";
import YarnCanvas from "../components/YarnCanvas";
import PostIt from "../components/PostIt";

const BOARD_MIN_WIDTH = 2200;
const BOARD_MIN_HEIGHT = 1200;

const TYPE_META = {
  Case: { color: "#f43f5e", bg: "#1c0a0d" },
  Suspect: { color: "#f59e0b", bg: "#1c1008" },
  Source: { color: "#06b6d4", bg: "#041214" },
  ADR: { color: "#a78bfa", bg: "#0e0b1a" },
  REQ: { color: "#34d399", bg: "#041a0e" },
  Index: { color: "#94a3b8", bg: "#0d1117" },
  README: { color: "#94a3b8", bg: "#0d1117" },
};

export default function CrazyBoard({
  nodes,
  edges,
  activeFile,
  onSelectFile,
  onOpenEditor,
  onWriteFile,
  apiKey,
  positions,
  setPositions,
  manualEdges,
  setManualEdges,
  vaultPath,
}) {
  const [postIts, setPostIts] = useState([]);
  const [dragging, setDragging] = useState(null);
  const boardRef = useRef(null);
  const [linkingSource, setLinkingSource] = useState(null);
  const [postItInput, setPostItInput] = useState(null);
  const [hiddenTypes, setHiddenTypes] = useState(new Set());

  useEffect(() => {
    setPostIts([]);
    if (!vaultPath) return;
    window.electronAPI?.readPostIts?.().then((saved) => {
      if (saved?.length) setPostIts(saved);
    });
  }, [vaultPath]);

  // ponytail: debounce prevents a store write on every mousemove during drag
  useEffect(() => {
    const timer = setTimeout(() => {
      window.electronAPI?.writePostIts?.(postIts);
    }, 400);
    return () => clearTimeout(timer);
  }, [postIts]);

  useEffect(() => {
    setPositions((prev) => {
      const updated = { ...prev };
      let changed = false;
      nodes.forEach((node) => {
        if (!updated[node.fileName]) {
          updated[node.fileName] = {
            x: 80 + Math.random() * (BOARD_MIN_WIDTH - 420),
            y: 60 + Math.random() * (BOARD_MIN_HEIGHT - 280),
            rotate: (Math.random() - 0.5) * 18,
          };
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [nodes]);

  const allEdges = [
    ...edges.map((e) => ({
      ...e,
      id: `auto-${e.from}-${e.to}`,
      manual: false,
    })),
    ...manualEdges,
  ];

  const posValues = Object.values(positions);
  const boardWidth = Math.max(
    BOARD_MIN_WIDTH,
    ...posValues.map((p) => p.x + 420)
  );
  const boardHeight = Math.max(
    BOARD_MIN_HEIGHT,
    ...posValues.map((p) => p.y + 300)
  );

  const visibleNodes = nodes.filter((n) => !hiddenTypes.has(n.type));
  const visibleFileNames = new Set(visibleNodes.map((n) => n.fileName));
  const visibleEdges = allEdges.filter(
    (e) => visibleFileNames.has(e.from) && visibleFileNames.has(e.to)
  );

  const presentTypes = [...new Set(nodes.map((n) => n.type))].filter(
    (t) => TYPE_META[t]
  );

  const toggleType = useCallback((type) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const handleDragStart = useCallback(
    (e, id, type) => {
      const rect = boardRef.current?.getBoundingClientRect();
      const scrollLeft = boardRef.current?.scrollLeft ?? 0;
      const scrollTop = boardRef.current?.scrollTop ?? 0;
      const pos =
        type === "postit"
          ? (() => {
              const n = postIts.find((p) => p.id === id);
              return n ? { x: n.x, y: n.y } : { x: 0, y: 0 };
            })()
          : positions[id];
      setDragging({
        id,
        type,
        offsetX:
          (e.nativeEvent?.clientX ?? e.clientX) -
          (rect?.left ?? 0) +
          scrollLeft -
          (pos?.x ?? 0),
        offsetY:
          (e.nativeEvent?.clientY ?? e.clientY) -
          (rect?.top ?? 0) +
          scrollTop -
          (pos?.y ?? 0),
      });
    },
    [positions, postIts]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragging) return;
      const rect = boardRef.current?.getBoundingClientRect();
      const scrollLeft = boardRef.current?.scrollLeft ?? 0;
      const scrollTop = boardRef.current?.scrollTop ?? 0;
      const x = Math.max(
        10,
        Math.min(
          boardWidth - 290,
          e.clientX - (rect?.left ?? 0) + scrollLeft - dragging.offsetX
        )
      );
      const y = Math.max(
        10,
        Math.min(
          boardHeight - 200,
          e.clientY - (rect?.top ?? 0) + scrollTop - dragging.offsetY
        )
      );

      if (dragging.type === "card") {
        setPositions((prev) => ({
          ...prev,
          [dragging.id]: { ...prev[dragging.id], x, y },
        }));
      } else if (dragging.type === "postit") {
        setPostIts((prev) =>
          prev.map((n) => (n.id === dragging.id ? { ...n, x, y } : n))
        );
      }
    },
    [dragging, boardWidth, boardHeight]
  );

  const handleMouseUp = useCallback(() => setDragging(null), []);

  const handleStartLink = useCallback((fileName) => {
    setLinkingSource(fileName);
  }, []);

  const handleCompleteLink = useCallback(
    async (targetFileName) => {
      if (!linkingSource || linkingSource === targetFileName) {
        setLinkingSource(null);
        return;
      }
      const exists = allEdges.some(
        (e) =>
          (e.from === linkingSource && e.to === targetFileName) ||
          (e.from === targetFileName && e.to === linkingSource)
      );
      if (exists) {
        setLinkingSource(null);
        return;
      }

      const newEdge = {
        id: `manual-${Date.now()}`,
        from: linkingSource,
        to: targetFileName,
        label: "LEAD",
        manual: true,
      };
      setManualEdges((prev) => [...prev, newEdge]);

      const sourceNode = nodes.find((n) => n.fileName === linkingSource);
      if (sourceNode && onWriteFile) {
        const updatedContent =
          sourceNode.content + `\n\n[[${targetFileName.replace(".md", "")}]]`;
        await onWriteFile(linkingSource, updatedContent);
      }

      setLinkingSource(null);
    },
    [linkingSource, allEdges, nodes, onWriteFile]
  );

  const handleRemoveEdge = useCallback((edgeId) => {
    setManualEdges((prev) => prev.filter((e) => e.id !== edgeId));
  }, []);

  const handleAddPostIt = useCallback(() => {
    setPostItInput("");
  }, []);

  const handleSubmitPostIt = useCallback(() => {
    const text = postItInput?.trim();
    if (!text) {
      setPostItInput(null);
      return;
    }
    const colors = ["yellow", "pink", "green", "blue"];
    setPostIts((prev) => [
      ...prev,
      {
        id: `postit-${Date.now()}`,
        text,
        x: 300 + Math.random() * 400,
        y: 200 + Math.random() * 300,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotate: (Math.random() - 0.5) * 8,
      },
    ]);
    setPostItInput(null);
  }, [postItInput]);

  const handleRemovePostIt = useCallback((id) => {
    setPostIts((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleUpdatePostIt = useCallback((id, text) => {
    setPostIts((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  }, []);

  const cardScale = Math.max(0.55, 1 - Math.max(0, nodes.length - 8) * 0.025);

  const statItems = [
    {
      count: nodes.filter((n) => n.type === "Case").length,
      label: "CASES",
      color: "#f43f5e",
      bg: "#1c0a0d",
    },
    {
      count: nodes.filter((n) => n.type === "Suspect").length,
      label: "SUSPECTS",
      color: "#f59e0b",
      bg: "#1c1008",
    },
    {
      count: nodes.filter((n) => n.type === "Source").length,
      label: "SOURCES",
      color: "#06b6d4",
      bg: "#041214",
    },
    {
      count: nodes.filter((n) => n.type === "ADR").length,
      label: "ADR",
      color: "#a78bfa",
      bg: "#0e0b1a",
    },
    {
      count: nodes.filter((n) => n.type === "REQ").length,
      label: "REQ",
      color: "#34d399",
      bg: "#041a0e",
    },
    {
      count: nodes.filter((n) => n.type === "Index").length,
      label: "INDEX",
      color: "#94a3b8",
      bg: "#0d1117",
    },
    {
      count: postIts.length,
      label: "STICKIES",
      color: "#fef08a",
      bg: "#1c1a08",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
        backgroundColor: "#020617",
      }}
    >
      {/* Board toolbar */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: "#0f172a",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#f43f5e",
            }}
          />
          <div
            style={{
              color: "#e2e8f0",
              fontFamily: "monospace",
              fontSize: 11,
              fontWeight: "bold",
              letterSpacing: 2,
            }}
          >
            CRAZY WALL
          </div>
          <div
            style={{
              background: "#020617",
              border: "1px solid #f43f5e",
              color: "#f43f5e",
              fontFamily: "monospace",
              fontSize: 9,
              fontWeight: "bold",
              padding: "2px 8px",
              borderRadius: 3,
              letterSpacing: 1,
            }}
          >
            {visibleEdges.length} STRINGS
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
          {linkingSource && (
            <button
              type="button"
              style={{
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 6,
                paddingBottom: 6,
                backgroundColor: "#4c0519",
                borderRadius: 4,
                border: "1px solid #f43f5e",
                cursor: "pointer",
              }}
              onClick={() => setLinkingSource(null)}
            >
              <div
                style={{
                  color: "#f43f5e",
                  fontSize: 10,
                  fontFamily: "monospace",
                  fontWeight: "bold",
                }}
              >
                CANCEL LINK
              </div>
            </button>
          )}
          {postItInput !== null ? (
            <>
              <input
                autoFocus
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#020617",
                  borderRadius: 4,
                  border: "1px solid #fef08a",
                  color: "#fef08a",
                  fontFamily: "monospace",
                  fontSize: 11,
                  width: 200,
                  outline: "none",
                }}
                value={postItInput}
                onChange={(e) => setPostItInput(e.target.value)}
                placeholder="Write a clue..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmitPostIt();
                  if (e.key === "Escape") setPostItInput(null);
                }}
              />
              <button
                type="button"
                style={{
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 6,
                  paddingBottom: 6,
                  backgroundColor: "#fef08a",
                  borderRadius: 4,
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={handleSubmitPostIt}
              >
                <div
                  style={{
                    color: "#713f12",
                    fontSize: 10,
                    fontFamily: "monospace",
                    fontWeight: "bold",
                  }}
                >
                  ADD
                </div>
              </button>
              <button
                type="button"
                style={{
                  paddingLeft: 8,
                  paddingRight: 8,
                  paddingTop: 6,
                  paddingBottom: 6,
                  backgroundColor: "transparent",
                  borderRadius: 4,
                  border: "1px solid #334155",
                  cursor: "pointer",
                }}
                onClick={() => setPostItInput(null)}
              >
                <div
                  style={{
                    color: "#64748b",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                >
                  ESC
                </div>
              </button>
            </>
          ) : (
            <button
              type="button"
              style={{
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 6,
                paddingBottom: 6,
                backgroundColor: "#fef08a",
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
              }}
              onClick={handleAddPostIt}
            >
              <div
                style={{
                  color: "#713f12",
                  fontSize: 10,
                  fontFamily: "monospace",
                  fontWeight: "bold",
                }}
              >
                + STICKY
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Type filter row */}
      {presentTypes.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 6,
            paddingBottom: 6,
            backgroundColor: "#0a0f1e",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <div
            style={{
              color: "#334155",
              fontFamily: "monospace",
              fontSize: 9,
              fontWeight: "bold",
              letterSpacing: 1,
              marginRight: 4,
              whiteSpace: "nowrap",
            }}
          >
            SHOW
          </div>
          {presentTypes.map((type) => {
            const meta = TYPE_META[type];
            const active = !hiddenTypes.has(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                style={{
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 3,
                  paddingBottom: 3,
                  borderRadius: 12,
                  border: `1px solid ${active ? meta.color : "#1e293b"}`,
                  backgroundColor: active ? meta.bg : "transparent",
                  color: active ? meta.color : "#334155",
                  fontFamily: "monospace",
                  fontSize: 9,
                  fontWeight: "bold",
                  letterSpacing: 1,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {type.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}

      {/* Scrollable corkboard */}
      <div
        ref={boardRef}
        style={{
          flex: 1,
          overflow: "auto",
          position: "relative",
          minHeight: 0,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            width: boardWidth,
            height: boardHeight,
            position: "relative",
            backgroundImage:
              "radial-gradient(rgba(244,63,94,0.06) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        >
          <YarnCanvas
            edges={visibleEdges}
            positions={positions}
            onRemoveEdge={handleRemoveEdge}
            boardWidth={boardWidth}
            boardHeight={boardHeight}
          />

          {visibleNodes.map((node) => {
            const pos = positions[node.fileName] ?? {
              x: 100,
              y: 100,
              rotate: 0,
            };
            return (
              <Card
                key={node.fileName}
                node={node}
                position={{ ...pos, scale: cardScale }}
                isSelected={activeFile === node.fileName}
                isLinking={linkingSource === node.fileName}
                isLinkTarget={
                  !!linkingSource && linkingSource !== node.fileName
                }
                onPress={() => onSelectFile(node.fileName)}
                onStartLink={() => handleStartLink(node.fileName)}
                onCompleteLink={() => handleCompleteLink(node.fileName)}
                onDragStart={(e) => handleDragStart(e, node.fileName, "card")}
                onOpenEditor={() => onOpenEditor(node.fileName)}
              />
            );
          })}

          {postIts.map((note) => (
            <PostIt
              key={note.id}
              note={note}
              onDragStart={(e) => handleDragStart(e, note.id, "postit")}
              onRemove={() => handleRemovePostIt(note.id)}
              onUpdate={(text) => handleUpdatePostIt(note.id, text)}
            />
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 16,
          paddingRight: 16,
          gap: 8,
          backgroundColor: "#020617",
          borderTop: "1px solid #0f172a",
        }}
      >
        {statItems.map(({ count, label, color, bg }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: 8,
              backgroundColor: bg,
              borderRadius: 4,
              alignItems: "center",
              border: `1px solid ${color}20`,
            }}
          >
            <div
              style={{
                color,
                fontFamily: "monospace",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {count}
            </div>
            <div
              style={{
                color: "#475569",
                fontFamily: "monospace",
                fontSize: 9,
                marginTop: 2,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
