import { useState, useEffect, useCallback } from "react";
import { parseMarkdownLines, getConfidenceColor } from "../lib/vaultParser";

export default function MarkdownEditor({ node, onSelectFile, onWriteFile }) {
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (node) {
      setEditContent(node.content);
      setEditMode(false);
    }
  }, [node?.fileName]);

  const handleSave = useCallback(async () => {
    if (!node || !onWriteFile) return;
    await onWriteFile(node.fileName, editContent);
    setEditMode(false);
  }, [node, editContent, onWriteFile]);

  if (!node) {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#020617",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <div
          style={{ color: "#475569", fontFamily: "monospace", fontSize: 12 }}
        >
          Select a card to view its file.
        </div>
      </div>
    );
  }

  const confidenceColor = getConfidenceColor(node.confidence);
  const lines = parseMarkdownLines(node.content);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        backgroundColor: "#020617",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      {/* Header */}
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
            flex: 1,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 4,
              height: 16,
              backgroundColor: confidenceColor,
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          <div
            style={{
              color: "#e2e8f0",
              fontFamily: "monospace",
              fontSize: 11,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {node.fileName}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 6,
              paddingBottom: 6,
              borderRadius: 4,
              backgroundColor: !editMode ? "#4c0519" : "#1e293b",
              border: `1px solid ${!editMode ? "#f43f5e" : "#334155"}`,
              cursor: "pointer",
            }}
            onClick={() => setEditMode(false)}
          >
            <div
              style={{
                color: !editMode ? "#f43f5e" : "#94a3b8",
                fontSize: 10,
                fontFamily: "monospace",
              }}
            >
              PREVIEW
            </div>
          </button>
          <button
            type="button"
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 6,
              paddingBottom: 6,
              borderRadius: 4,
              backgroundColor: editMode ? "#4c0519" : "#1e293b",
              border: `1px solid ${editMode ? "#f43f5e" : "#334155"}`,
              cursor: "pointer",
            }}
            onClick={() => setEditMode(true)}
          >
            <div
              style={{
                color: editMode ? "#f43f5e" : "#94a3b8",
                fontSize: 10,
                fontFamily: "monospace",
              }}
            >
              EDIT MD
            </div>
          </button>
          {editMode && (
            <button
              type="button"
              style={{
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 6,
                paddingBottom: 6,
                borderRadius: 4,
                backgroundColor: "#14532d",
                border: "none",
                cursor: "pointer",
              }}
              onClick={handleSave}
            >
              <div
                style={{
                  color: "#86efac",
                  fontSize: 10,
                  fontFamily: "monospace",
                  fontWeight: "bold",
                }}
              >
                SAVE
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      {editMode ? (
        <textarea
          style={{
            flex: 1,
            width: "100%",
            minHeight: 0,
            padding: 20,
            color: "#e2e8f0",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: "22px",
            backgroundColor: "#020617",
            border: "none",
            outline: "none",
            resize: "none",
            overflow: "auto",
            boxSizing: "border-box",
          }}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="# Case: Title..."
        />
      ) : (
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          <div
            style={{
              padding: 32,
              maxWidth: 720,
              margin: "0 auto",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {lines.map((line, idx) => renderLine(line, idx, onSelectFile))}
            <div style={{ height: 80 }} />
          </div>
        </div>
      )}

      {/* Footer: char count */}
      <div
        style={{
          display: "flex",
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: "#0f172a",
          borderTop: "1px solid #1e293b",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{ color: "#475569", fontFamily: "monospace", fontSize: 10 }}
        >
          {node.content.length} chars
        </div>
        <div
          style={{
            color: confidenceColor,
            fontFamily: "monospace",
            fontSize: 10,
          }}
        >
          {(node.confidence ?? "unknown").toUpperCase()}
        </div>
      </div>
    </div>
  );
}

function renderLine(line, idx, onSelectFile) {
  const key = `line-${idx}`;

  if (line.type === "frontmatter" || line.type === "empty") {
    return <div key={key} style={{ height: 8 }} />;
  }

  if (line.type === "h1") {
    return (
      <div
        key={key}
        style={{
          color: "#f43f5e",
          fontFamily: "monospace",
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 16,
          paddingBottom: 8,
          borderBottom: "1px solid #1e293b",
        }}
      >
        {line.text}
      </div>
    );
  }

  if (line.type === "h2") {
    return (
      <div
        key={key}
        style={{
          color: "#e2e8f0",
          fontFamily: "monospace",
          fontSize: 16,
          fontWeight: "bold",
          marginTop: 24,
          marginBottom: 8,
          paddingBottom: 4,
          borderBottom: "1px solid #0f172a",
        }}
      >
        {line.text}
      </div>
    );
  }

  if (line.type === "h3") {
    return (
      <div
        key={key}
        style={{
          color: "#cbd5e1",
          fontFamily: "monospace",
          fontSize: 14,
          fontWeight: "bold",
          marginTop: 16,
          marginBottom: 6,
        }}
      >
        {line.text}
      </div>
    );
  }

  if (line.type === "status") {
    const isOpen = line.value?.trim() === "Open";
    return (
      <div
        key={key}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginTop: 8,
          marginBottom: 8,
          padding: 8,
          backgroundColor: "#0f172a",
          borderRadius: 4,
        }}
      >
        <div
          style={{ color: "#64748b", fontFamily: "monospace", fontSize: 10 }}
        >
          STATUS
        </div>
        <div
          style={{
            color: isOpen ? "#f43f5e" : "#64748b",
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: "bold",
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 3,
            paddingBottom: 3,
            borderRadius: 3,
            backgroundColor: isOpen ? "#4c0519" : "#1e293b",
          }}
        >
          {(line.value ?? "").trim().toUpperCase()}
        </div>
      </div>
    );
  }

  if (line.type === "verdict") {
    const verdictColors = {
      Confirmed: { bg: "#052e16", text: "#86efac" },
      Testing: { bg: "#451a03", text: "#fcd34d" },
      "Ruled Out": { bg: "#4c0519", text: "#fda4af" },
    };
    const vc = verdictColors[line.value?.trim()] ?? {
      bg: "#1e293b",
      text: "#94a3b8",
    };
    return (
      <div
        key={key}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginTop: 8,
          marginBottom: 8,
          padding: 8,
          backgroundColor: "#0f172a",
          borderRadius: 4,
        }}
      >
        <div
          style={{ color: "#64748b", fontFamily: "monospace", fontSize: 10 }}
        >
          VERDICT
        </div>
        <div
          style={{
            color: vc.text,
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: "bold",
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 3,
            paddingBottom: 3,
            borderRadius: 3,
            backgroundColor: vc.bg,
          }}
        >
          {(line.value ?? "").trim().toUpperCase()}
        </div>
      </div>
    );
  }

  if (line.type === "list" || line.type === "paragraph") {
    return (
      <div
        key={key}
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 6,
          alignItems: "flex-start",
          paddingLeft: line.type === "list" ? 16 : 0,
        }}
      >
        {line.type === "list" && (
          <span
            style={{ color: "#64748b", fontFamily: "monospace", fontSize: 13 }}
          >
            -{" "}
          </span>
        )}
        {renderInlineText(line.text, line.links ?? [], onSelectFile)}
      </div>
    );
  }

  if (line.type === "code") {
    return (
      <div
        key={key}
        style={{
          backgroundColor: "#0f172a",
          borderRadius: 4,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 8,
          paddingBottom: 8,
          marginTop: 4,
          marginBottom: 4,
        }}
      >
        <div
          style={{ color: "#67e8f9", fontFamily: "monospace", fontSize: 12 }}
        >
          {line.text}
        </div>
      </div>
    );
  }

  return null;
}

function renderInlineText(text, links, onSelectFile) {
  if (!links || links.length === 0) {
    return (
      <span
        style={{
          color: "#cbd5e1",
          fontFamily: "monospace",
          fontSize: 13,
          lineHeight: "22px",
        }}
      >
        {text}
      </span>
    );
  }

  const parts = [];
  let remaining = text;
  let partIdx = 0;

  for (const link of links) {
    const splitAt = remaining.indexOf(link.text);
    if (splitAt === -1) continue;
    if (splitAt > 0) {
      parts.push(
        <span
          key={`t-${partIdx++}`}
          style={{
            color: "#cbd5e1",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: "22px",
          }}
        >
          {remaining.slice(0, splitAt)}
        </span>
      );
    }
    parts.push(
      <span
        key={`l-${partIdx++}`}
        style={{
          color: "#f43f5e",
          fontFamily: "monospace",
          fontSize: 13,
          lineHeight: "22px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
        onClick={() => {
          const targetWithMd = link.target.endsWith(".md")
            ? link.target
            : `${link.target}.md`;
          onSelectFile?.(targetWithMd);
        }}
      >
        [[{link.target}]]
      </span>
    );
    remaining = remaining.slice(splitAt + link.text.length);
  }

  if (remaining) {
    parts.push(
      <span
        key={`t-${partIdx++}`}
        style={{
          color: "#cbd5e1",
          fontFamily: "monospace",
          fontSize: 13,
          lineHeight: "22px",
        }}
      >
        {remaining}
      </span>
    );
  }

  return parts;
}
