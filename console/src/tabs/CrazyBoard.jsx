import { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Card from "../components/Card";
import YarnCanvas from "../components/YarnCanvas";
import PostIt from "../components/PostIt";

const BOARD_WIDTH = 2200;
const BOARD_HEIGHT = 1200;

export default function CrazyBoard({
  nodes, // VaultNode[] from vault:read IPC
  edges, // Edge[] from vault:read IPC (auto-derived from wikilinks)
  activeFile, // string: currently selected filename
  onSelectFile, // (fileName) => void
  onOpenEditor, // (fileName) => void
  onWriteFile, // (fileName, content) => Promise<void>: write wikilink to vault
  apiKey, // string: for Vic Sage terminal (passed through, not used here)
}) {
  // Positions: { [fileName]: { x, y, rotate } }
  const [positions, setPositions] = useState({});

  // Manual yarn edges (stored separately from auto-derived wikilink edges)
  const [manualEdges, setManualEdges] = useState([]);

  // Post-it notes
  const [postIts, setPostIts] = useState([]);

  // Drag state
  const [dragging, setDragging] = useState(null); // { id, type, offsetX, offsetY }
  const boardRef = useRef(null);

  // Linking mode
  const [linkingSource, setLinkingSource] = useState(null); // fileName

  // Initialize positions for new nodes (nodes that have no position yet)
  useEffect(() => {
    setPositions((prev) => {
      const updated = { ...prev };
      let changed = false;
      nodes.forEach((node, i) => {
        if (!updated[node.fileName]) {
          updated[node.fileName] = {
            x: 150 + (i % 4) * 320,
            y: 100 + Math.floor(i / 4) * 280,
            rotate: i % 3 === 0 ? -1 : i % 3 === 1 ? 1 : -2,
          };
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [nodes]);

  // Merge auto-derived edges with manual edges for rendering
  const allEdges = [
    ...edges.map((e) => ({
      ...e,
      id: `auto-${e.from}-${e.to}`,
      manual: false,
    })),
    ...manualEdges,
  ];

  // Drag handlers (mouse-based for desktop)
  const handleDragStart = useCallback(
    (e, id, type) => {
      const rect = boardRef.current?.getBoundingClientRect();
      const scrollLeft = boardRef.current?.scrollLeft ?? 0;
      const scrollTop = boardRef.current?.scrollTop ?? 0;
      const pos = positions[id];
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
    [positions]
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
          BOARD_WIDTH - 290,
          e.clientX - (rect?.left ?? 0) + scrollLeft - dragging.offsetX
        )
      );
      const y = Math.max(
        10,
        Math.min(
          BOARD_HEIGHT - 200,
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
    [dragging]
  );

  const handleMouseUp = useCallback(() => setDragging(null), []);

  // Yarn linking
  const handleStartLink = useCallback((fileName) => {
    setLinkingSource(fileName);
  }, []);

  const handleCompleteLink = useCallback(
    async (targetFileName) => {
      if (!linkingSource || linkingSource === targetFileName) {
        setLinkingSource(null);
        return;
      }
      // Check if edge already exists
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

      // Write wikilink to source file
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

  // Post-it operations
  const handleAddPostIt = useCallback(() => {
    const text = window.prompt("Write a clue for the post-it:");
    if (!text) return;
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
  }, []);

  const handleRemovePostIt = useCallback((id) => {
    setPostIts((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Stats
  const caseCount = nodes.filter((n) => n.type === "Case").length;
  const suspectCount = nodes.filter((n) => n.type === "Suspect").length;
  const sourceCount = nodes.filter((n) => n.type === "Source").length;

  return (
    <View style={{ flex: 1, backgroundColor: "#020617" }}>
      {/* Board toolbar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: "#0f172a",
          borderBottomWidth: 1,
          borderBottomColor: "#1e293b",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#f43f5e",
            }}
          />
          <Text
            style={{
              color: "#e2e8f0",
              fontFamily: "monospace",
              fontSize: 11,
              fontWeight: "bold",
              letterSpacing: 2,
            }}
          >
            CRAZY WALL
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {linkingSource && (
            <TouchableOpacity
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: "#4c0519",
                borderRadius: 4,
                borderWidth: 1,
                borderColor: "#f43f5e",
              }}
              onPress={() => setLinkingSource(null)}
            >
              <Text
                style={{
                  color: "#f43f5e",
                  fontSize: 10,
                  fontFamily: "monospace",
                  fontWeight: "bold",
                }}
              >
                CANCEL LINK
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: "#fef08a",
              borderRadius: 4,
            }}
            onPress={handleAddPostIt}
          >
            <Text
              style={{
                color: "#713f12",
                fontSize: 10,
                fontFamily: "monospace",
                fontWeight: "bold",
              }}
            >
              + STICKY
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable corkboard */}
      <View
        ref={boardRef}
        style={{ flex: 1, overflow: "auto", position: "relative" }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <View
          style={{
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
            position: "relative",
            backgroundImage:
              "radial-gradient(rgba(244,63,94,0.06) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
          }}
        >
          {/* Yarn strings (SVG overlay, z-index 0) */}
          <YarnCanvas
            edges={allEdges}
            positions={positions}
            onRemoveEdge={handleRemoveEdge}
            boardWidth={BOARD_WIDTH}
            boardHeight={BOARD_HEIGHT}
          />

          {/* Cards */}
          {nodes.map((node) => {
            const pos = positions[node.fileName] ?? {
              x: 100,
              y: 100,
              rotate: 0,
            };
            return (
              <Card
                key={node.fileName}
                node={node}
                position={pos}
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

          {/* Post-its */}
          {postIts.map((note) => (
            <PostIt
              key={note.id}
              note={note}
              onDragStart={(e) => handleDragStart(e, note.id, "postit")}
              onRemove={() => handleRemovePostIt(note.id)}
            />
          ))}
        </View>
      </View>

      {/* Stats bar */}
      <View
        style={{
          flexDirection: "row",
          paddingVertical: 10,
          paddingHorizontal: 16,
          gap: 12,
          backgroundColor: "#020617",
          borderTopWidth: 1,
          borderTopColor: "#0f172a",
        }}
      >
        {[
          { count: caseCount, label: "CASES", color: "#f43f5e", bg: "#1c0a0d" },
          {
            count: suspectCount,
            label: "SUSPECTS",
            color: "#f59e0b",
            bg: "#1c1008",
          },
          {
            count: sourceCount,
            label: "SOURCES",
            color: "#06b6d4",
            bg: "#041214",
          },
          {
            count: allEdges.length,
            label: "YARN STRINGS",
            color: "#f43f5e",
            bg: "#1c0a0d",
          },
          {
            count: postIts.length,
            label: "STICKIES",
            color: "#fef08a",
            bg: "#1c1a08",
          },
        ].map(({ count, label, color, bg }) => (
          <View
            key={label}
            style={{
              flex: 1,
              padding: 8,
              backgroundColor: bg,
              borderRadius: 4,
              alignItems: "center",
              borderWidth: 1,
              borderColor: `${color}20`,
            }}
          >
            <Text
              style={{
                color,
                fontFamily: "monospace",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {count}
            </Text>
            <Text
              style={{
                color: "#475569",
                fontFamily: "monospace",
                fontSize: 9,
                marginTop: 2,
              }}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
