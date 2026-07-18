const COLORS = {
  yellow: { bg: "#fef08a", text: "#713f12", border: "#fde047" },
  pink: { bg: "#fbcfe8", text: "#831843", border: "#f9a8d4" },
  green: { bg: "#bbf7d0", text: "#14532d", border: "#86efac" },
  blue: { bg: "#bae6fd", text: "#0c4a6e", border: "#7dd3fc" },
};

export default function PostIt({ note, onDragStart, onRemove }) {
  const colors = COLORS[note.color] ?? COLORS.yellow;

  return (
    <div
      style={{
        position: "absolute",
        left: note.x,
        top: note.y,
        width: 200,
        transform: `rotate(${note.rotate ?? 0}deg)`,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        padding: 14,
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

      <div onMouseDown={onDragStart}>
        <div
          style={{
            color: colors.text,
            fontFamily: "serif",
            fontStyle: "italic",
            fontSize: 13,
            lineHeight: 20,
            marginTop: 8,
          }}
        >
          "{note.text}"
        </div>
      </div>

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
