import { useState } from "react";

const COLORS = {
  yellow: { bg: "#fef08a", text: "#713f12", border: "#fde047" },
  pink: { bg: "#fbcfe8", text: "#831843", border: "#f9a8d4" },
  green: { bg: "#bbf7d0", text: "#14532d", border: "#86efac" },
  blue: { bg: "#bae6fd", text: "#0c4a6e", border: "#7dd3fc" },
};

export default function PostIt({ note, onDragStart, onRemove, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.text);
  const colors = COLORS[note.color] ?? COLORS.yellow;

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== note.text) onUpdate(trimmed);
    else setDraft(note.text);
    setEditing(false);
  };

  return (
    <div
      onMouseDown={editing ? undefined : onDragStart}
      style={{
        position: "absolute",
        left: note.x,
        top: note.y,
        minWidth: 200,
        maxWidth: 320,
        transform: `rotate(${note.rotate ?? 0}deg)`,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        padding: 14,
        cursor: editing ? "default" : "grab",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -8,
          left: "50%",
          marginLeft: -24,
          width: 48,
          height: 16,
          backgroundColor: "rgba(255,255,255,0.5)",
          border: "1px solid rgba(200,200,200,0.4)",
        }}
      />

      {editing ? (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commitEdit();
            }
            if (e.key === "Escape") {
              setDraft(note.text);
              setEditing(false);
            }
          }}
          style={{
            width: "100%",
            minHeight: 60,
            marginTop: 8,
            background: "none",
            border: "none",
            outline: "1px solid rgba(0,0,0,0.2)",
            borderRadius: 2,
            color: colors.text,
            fontFamily: "serif",
            fontStyle: "italic",
            fontSize: 13,
            lineHeight: "1.5",
            resize: "none",
            padding: 2,
            boxSizing: "border-box",
          }}
        />
      ) : (
        <div
          onDoubleClick={() => {
            setDraft(note.text);
            setEditing(true);
          }}
          style={{
            color: colors.text,
            fontFamily: "serif",
            fontStyle: "italic",
            fontSize: 13,
            lineHeight: "1.5",
            wordBreak: "break-word",
            marginTop: 8,
          }}
        >
          "{note.text}"
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
          paddingTop: 8,
          borderTop: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            color: colors.text,
            fontFamily: "monospace",
            fontSize: 9,
            opacity: 0.7,
          }}
        >
          CLUE
        </div>
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onRemove}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <div
            style={{
              color: colors.text,
              fontFamily: "monospace",
              fontSize: 9,
              fontWeight: "bold",
            }}
          >
            remove
          </div>
        </button>
      </div>
    </div>
  );
}
