import { getConfidenceColor } from "../lib/vaultParser";

const CARD_TYPES = {
  Case: {
    border: "#f43f5e",
    header: "#4c0519",
    headerText: "#fda4af",
    pin: "#dc2626",
  },
  Suspect: {
    border: "#f59e0b",
    header: "#451a03",
    headerText: "#fcd34d",
    pin: "#d97706",
  },
  Source: {
    border: "#06b6d4",
    header: "#083344",
    headerText: "#67e8f9",
    pin: "#0891b2",
  },
  Index: {
    border: "#64748b",
    header: "#1e293b",
    headerText: "#94a3b8",
    pin: "#475569",
  },
};

export default function Card({
  node,
  position,
  isSelected,
  isLinking,
  isLinkTarget,
  onPress,
  onStartLink,
  onCompleteLink,
  onDragStart,
  onOpenEditor,
}) {
  const colors = CARD_TYPES[node.type] ?? CARD_TYPES.Index;
  const confidenceColor = getConfidenceColor(node.confidence);

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: 280,
        transform: `rotate(${position.rotate ?? 0}deg)`,
        backgroundColor: "#0f172a",
        borderRadius: 8,
        border: `2px solid ${isSelected ? "#f43f5e" : colors.border}`,
        borderLeft: `4px solid ${confidenceColor}`,
        boxShadow: "0 8px 16px rgba(0,0,0,0.5)",
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={onPress}
    >
      {/* Pushpin */}
      <div
        style={{
          position: "absolute",
          top: -14,
          left: "50%",
          marginLeft: -7,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 30,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: colors.pin,
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        />
        <div style={{ width: 2, height: 12, backgroundColor: "#475569" }} />
      </div>

      {/* Header drag handle */}
      <div
        style={{
          display: "flex",
          padding: 10,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          backgroundColor: colors.header,
          borderBottom: `1px solid ${colors.border}40`,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onMouseDown={onDragStart}
      >
        <div
          style={{
            color: colors.headerText,
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: "bold",
            flex: 1,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {node.name}
        </div>
        <div
          style={{
            color: colors.headerText,
            fontFamily: "monospace",
            fontSize: 9,
            backgroundColor: "#0f172a",
            paddingLeft: 4,
            paddingRight: 4,
            paddingTop: 2,
            paddingBottom: 2,
            borderRadius: 3,
          }}
        >
          {node.type.toUpperCase()}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 12,
          gap: 8,
        }}
      >
        {node.type === "Case" && (
          <div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: 10,
                fontFamily: "monospace",
              }}
            >
              STATUS
            </div>
            <div
              style={{
                color: "#fda4af",
                fontSize: 11,
                fontFamily: "monospace",
                fontStyle: "italic",
                marginTop: 4,
              }}
            >
              {node.status ?? "Open"}
            </div>
          </div>
        )}
        {node.type === "Suspect" && (
          <div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: 10,
                fontFamily: "monospace",
              }}
            >
              VERDICT
            </div>
            <div
              style={{
                color: "#fcd34d",
                fontSize: 11,
                fontFamily: "monospace",
                marginTop: 4,
              }}
            >
              {node.verdict ?? "Untested"}
            </div>
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: confidenceColor,
            }}
          />
          <div
            style={{ color: "#64748b", fontSize: 9, fontFamily: "monospace" }}
          >
            {(node.confidence ?? "unknown").toUpperCase()}
          </div>
        </div>
        <div style={{ color: "#475569", fontSize: 9, fontFamily: "monospace" }}>
          {node.links?.length ?? 0} links
        </div>
      </div>

      {/* Footer actions */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          padding: 8,
          gap: 6,
          borderTop: "1px solid #1e293b",
        }}
      >
        <button
          type="button"
          style={{
            flex: 1,
            paddingTop: 6,
            paddingBottom: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isLinking ? "#4c0519" : "#1e293b",
            borderRadius: 4,
            border: `1px solid ${isLinking ? "#f43f5e" : "#334155"}`,
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
            isLinkTarget ? onCompleteLink() : onStartLink();
          }}
        >
          <div
            style={{
              color: isLinking ? "#f43f5e" : "#94a3b8",
              fontSize: 9,
              fontFamily: "monospace",
              fontWeight: "bold",
            }}
          >
            {isLinkTarget
              ? "LINK HERE"
              : isLinking
                ? "LINKING..."
                : "YARN CORD"}
          </div>
        </button>
        <button
          type="button"
          style={{
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 6,
            paddingBottom: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1e293b",
            borderRadius: 4,
            border: "1px solid #334155",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onOpenEditor();
          }}
        >
          <div
            style={{ color: "#94a3b8", fontSize: 9, fontFamily: "monospace" }}
          >
            EDIT
          </div>
        </button>
      </div>
    </div>
  );
}
