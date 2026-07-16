import { View, Text, TouchableOpacity } from "react-native";

const COLORS = {
  yellow: { bg: "#fef08a", text: "#713f12", border: "#fde047" },
  pink: { bg: "#fbcfe8", text: "#831843", border: "#f9a8d4" },
  green: { bg: "#bbf7d0", text: "#14532d", border: "#86efac" },
  blue: { bg: "#bae6fd", text: "#0c4a6e", border: "#7dd3fc" },
};

export default function PostIt({ note, onDragStart, onRemove }) {
  const colors = COLORS[note.color] ?? COLORS.yellow;

  return (
    <View
      style={{
        position: "absolute",
        left: note.x,
        top: note.y,
        width: 200,
        transform: [{ rotate: `${note.rotate ?? 0}deg` }],
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        padding: 14,
      }}
    >
      {/* Tape strip -- semi-transparent so bg shows through */}
      <View
        style={{
          position: "absolute",
          top: -8,
          left: "50%",
          marginLeft: -24,
          width: 48,
          height: 16,
          backgroundColor: "rgba(255,255,255,0.5)",
          borderWidth: 1,
          borderColor: "rgba(200,200,200,0.4)",
        }}
      />

      <View
        onStartShouldSetResponder={() => true}
        onResponderGrant={onDragStart}
      >
        <Text
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
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.1)",
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontFamily: "monospace",
            fontSize: 9,
            opacity: 0.7,
          }}
        >
          CLUE
        </Text>
        <TouchableOpacity onPress={onRemove}>
          <Text
            style={{
              color: colors.text,
              fontFamily: "monospace",
              fontSize: 9,
              fontWeight: "bold",
            }}
          >
            remove
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
