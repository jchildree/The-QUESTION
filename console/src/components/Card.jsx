import { View, Text, TouchableOpacity } from "react-native";
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

  const cardStyle = {
    position: "absolute",
    left: position.x,
    top: position.y,
    width: 280,
    transform: [{ rotate: `${position.rotate ?? 0}deg` }],
    backgroundColor: "#0f172a",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: isSelected ? "#f43f5e" : colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: confidenceColor,
  };

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={1}>
      {/* Pushpin */}
      <View
        style={{
          position: "absolute",
          top: -14,
          left: "50%",
          marginLeft: -7,
          alignItems: "center",
          zIndex: 30,
        }}
      >
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: colors.pin,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.2)",
          }}
        />
        <View style={{ width: 2, height: 12, backgroundColor: "#475569" }} />
      </View>

      {/* Header drag handle */}
      <View
        style={{
          padding: 10,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          backgroundColor: colors.header,
          borderBottomWidth: 1,
          borderBottomColor: `${colors.border}40`,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onStartShouldSetResponder={() => true}
        onResponderGrant={onDragStart}
      >
        <Text
          style={{
            color: colors.headerText,
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: "bold",
            flex: 1,
          }}
          numberOfLines={1}
        >
          {node.name}
        </Text>
        <Text
          style={{
            color: colors.headerText,
            fontFamily: "monospace",
            fontSize: 9,
            backgroundColor: "#0f172a",
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 3,
          }}
        >
          {node.type.toUpperCase()}
        </Text>
      </View>

      {/* Body */}
      <View style={{ padding: 12, gap: 8 }}>
        {node.type === "Case" && (
          <View>
            <Text
              style={{
                color: "#94a3b8",
                fontSize: 10,
                fontFamily: "monospace",
              }}
            >
              STATUS
            </Text>
            <Text
              style={{
                color: "#fda4af",
                fontSize: 11,
                fontFamily: "monospace",
                fontStyle: "italic",
                marginTop: 4,
              }}
            >
              {node.status ?? "Open"}
            </Text>
          </View>
        )}
        {node.type === "Suspect" && (
          <View>
            <Text
              style={{
                color: "#94a3b8",
                fontSize: 10,
                fontFamily: "monospace",
              }}
            >
              VERDICT
            </Text>
            <Text
              style={{
                color: "#fcd34d",
                fontSize: 11,
                fontFamily: "monospace",
                marginTop: 4,
              }}
            >
              {node.verdict ?? "Untested"}
            </Text>
          </View>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: confidenceColor,
            }}
          />
          <Text
            style={{ color: "#64748b", fontSize: 9, fontFamily: "monospace" }}
          >
            {(node.confidence ?? "unknown").toUpperCase()}
          </Text>
        </View>
        <Text
          style={{ color: "#475569", fontSize: 9, fontFamily: "monospace" }}
        >
          {node.links?.length ?? 0} links
        </Text>
      </View>

      {/* Footer actions */}
      <View
        style={{
          flexDirection: "row",
          padding: 8,
          gap: 6,
          borderTopWidth: 1,
          borderTopColor: "#1e293b",
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 6,
            alignItems: "center",
            backgroundColor: isLinking ? "#4c0519" : "#1e293b",
            borderRadius: 4,
            borderWidth: 1,
            borderColor: isLinking ? "#f43f5e" : "#334155",
          }}
          onPress={isLinkTarget ? onCompleteLink : onStartLink}
        >
          <Text
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
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            alignItems: "center",
            backgroundColor: "#1e293b",
            borderRadius: 4,
            borderWidth: 1,
            borderColor: "#334155",
          }}
          onPress={onOpenEditor}
        >
          <Text
            style={{ color: "#94a3b8", fontSize: 9, fontFamily: "monospace" }}
          >
            EDIT
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
