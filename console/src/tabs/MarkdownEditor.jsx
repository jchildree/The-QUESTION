import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#020617",
        }}
      >
        <Text
          style={{ color: "#475569", fontFamily: "monospace", fontSize: 12 }}
        >
          Select a card to view its file.
        </Text>
      </View>
    );
  }

  const confidenceColor = getConfidenceColor(node.confidence);
  const lines = parseMarkdownLines(node.content);

  return (
    <View style={{ flex: 1, backgroundColor: "#020617" }}>
      {/* Header */}
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            flex: 1,
          }}
        >
          <View
            style={{
              width: 4,
              height: 16,
              backgroundColor: confidenceColor,
              borderRadius: 2,
            }}
          />
          <Text
            style={{ color: "#e2e8f0", fontFamily: "monospace", fontSize: 11 }}
            numberOfLines={1}
          >
            {node.fileName}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 4,
              backgroundColor: !editMode ? "#4c0519" : "#1e293b",
              borderWidth: 1,
              borderColor: !editMode ? "#f43f5e" : "#334155",
            }}
            onPress={() => setEditMode(false)}
          >
            <Text
              style={{
                color: !editMode ? "#f43f5e" : "#94a3b8",
                fontSize: 10,
                fontFamily: "monospace",
              }}
            >
              PREVIEW
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 4,
              backgroundColor: editMode ? "#4c0519" : "#1e293b",
              borderWidth: 1,
              borderColor: editMode ? "#f43f5e" : "#334155",
            }}
            onPress={() => setEditMode(true)}
          >
            <Text
              style={{
                color: editMode ? "#f43f5e" : "#94a3b8",
                fontSize: 10,
                fontFamily: "monospace",
              }}
            >
              EDIT MD
            </Text>
          </TouchableOpacity>
          {editMode && (
            <TouchableOpacity
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 4,
                backgroundColor: "#14532d",
              }}
              onPress={handleSave}
            >
              <Text
                style={{
                  color: "#86efac",
                  fontSize: 10,
                  fontFamily: "monospace",
                  fontWeight: "bold",
                }}
              >
                SAVE
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content area */}
      {editMode ? (
        <TextInput
          style={{
            flex: 1,
            padding: 20,
            color: "#e2e8f0",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 22,
            backgroundColor: "#020617",
            textAlignVertical: "top",
          }}
          multiline
          value={editContent}
          onChangeText={setEditContent}
          placeholder="# Case: Title..."
          placeholderTextColor="#334155"
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 32,
            maxWidth: 720,
            alignSelf: "center",
            width: "100%",
          }}
        >
          {lines.map((line, idx) => renderLine(line, idx, onSelectFile))}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {/* Footer: char count */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: "#0f172a",
          borderTopWidth: 1,
          borderTopColor: "#1e293b",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{ color: "#475569", fontFamily: "monospace", fontSize: 10 }}
        >
          {node.content.length} chars
        </Text>
        <Text
          style={{
            color: confidenceColor,
            fontFamily: "monospace",
            fontSize: 10,
          }}
        >
          {(node.confidence ?? "unknown").toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

function renderLine(line, idx, onSelectFile) {
  const key = `line-${idx}`;

  if (line.type === "frontmatter" || line.type === "empty") {
    return <View key={key} style={{ height: 8 }} />;
  }

  if (line.type === "h1") {
    return (
      <Text
        key={key}
        style={{
          color: "#f43f5e",
          fontFamily: "monospace",
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 16,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: "#1e293b",
        }}
      >
        {line.text}
      </Text>
    );
  }

  if (line.type === "h2") {
    return (
      <Text
        key={key}
        style={{
          color: "#e2e8f0",
          fontFamily: "monospace",
          fontSize: 16,
          fontWeight: "bold",
          marginTop: 24,
          marginBottom: 8,
          paddingBottom: 4,
          borderBottomWidth: 1,
          borderBottomColor: "#0f172a",
        }}
      >
        {line.text}
      </Text>
    );
  }

  if (line.type === "h3") {
    return (
      <Text
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
      </Text>
    );
  }

  if (line.type === "status") {
    const isOpen = line.value?.trim() === "Open";
    return (
      <View
        key={key}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginVertical: 8,
          padding: 8,
          backgroundColor: "#0f172a",
          borderRadius: 4,
        }}
      >
        <Text
          style={{ color: "#64748b", fontFamily: "monospace", fontSize: 10 }}
        >
          STATUS
        </Text>
        <Text
          style={{
            color: isOpen ? "#f43f5e" : "#64748b",
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: "bold",
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 3,
            backgroundColor: isOpen ? "#4c0519" : "#1e293b",
          }}
        >
          {(line.value ?? "").trim().toUpperCase()}
        </Text>
      </View>
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
      <View
        key={key}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginVertical: 8,
          padding: 8,
          backgroundColor: "#0f172a",
          borderRadius: 4,
        }}
      >
        <Text
          style={{ color: "#64748b", fontFamily: "monospace", fontSize: 10 }}
        >
          VERDICT
        </Text>
        <Text
          style={{
            color: vc.text,
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: "bold",
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 3,
            backgroundColor: vc.bg,
          }}
        >
          {(line.value ?? "").trim().toUpperCase()}
        </Text>
      </View>
    );
  }

  if (line.type === "list" || line.type === "paragraph") {
    return (
      <View
        key={key}
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 6,
          alignItems: "flex-start",
          paddingLeft: line.type === "list" ? 16 : 0,
        }}
      >
        {line.type === "list" && (
          <Text
            style={{ color: "#64748b", fontFamily: "monospace", fontSize: 13 }}
          >
            -{" "}
          </Text>
        )}
        {renderInlineText(line.text, line.links ?? [], onSelectFile)}
      </View>
    );
  }

  if (line.type === "code") {
    return (
      <View
        key={key}
        style={{
          backgroundColor: "#0f172a",
          borderRadius: 4,
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginVertical: 4,
        }}
      >
        <Text
          style={{ color: "#67e8f9", fontFamily: "monospace", fontSize: 12 }}
        >
          {line.text}
        </Text>
      </View>
    );
  }

  return null;
}

function renderInlineText(text, links, onSelectFile) {
  if (!links || links.length === 0) {
    return (
      <Text
        style={{
          color: "#cbd5e1",
          fontFamily: "monospace",
          fontSize: 13,
          lineHeight: 22,
        }}
      >
        {text}
      </Text>
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
        <Text
          key={`t-${partIdx++}`}
          style={{
            color: "#cbd5e1",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 22,
          }}
        >
          {remaining.slice(0, splitAt)}
        </Text>
      );
    }
    parts.push(
      <TouchableOpacity
        key={`l-${partIdx++}`}
        onPress={() => {
          const targetWithMd = link.target.endsWith(".md")
            ? link.target
            : `${link.target}.md`;
          onSelectFile?.(targetWithMd);
        }}
      >
        <Text
          style={{
            color: "#f43f5e",
            fontFamily: "monospace",
            fontSize: 13,
            lineHeight: 22,
            fontWeight: "bold",
          }}
        >
          [[{link.target}]]
        </Text>
      </TouchableOpacity>
    );
    remaining = remaining.slice(splitAt + link.text.length);
  }

  if (remaining) {
    parts.push(
      <Text
        key={`t-${partIdx++}`}
        style={{
          color: "#cbd5e1",
          fontFamily: "monospace",
          fontSize: 13,
          lineHeight: 22,
        }}
      >
        {remaining}
      </Text>
    );
  }

  return parts;
}
