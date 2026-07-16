import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { queryClaude } from "../lib/claudeClient";

const INITIAL_MESSAGE = {
  sender: "vic",
  text: "The board holds the secrets. Put up your files, connect them, or ask me to investigate. I don't believe stories here -- only traces.",
  time: new Date().toLocaleTimeString(),
};

export default function VicSageTerminal({
  nodes, // VaultNode[]
  apiKey, // string: Claude API key (user sets in Settings)
  onWriteFile, // (fileName, content) => Promise<void>
  onVaultRefresh, // () => void: called after writing new files to trigger vault re-read
}) {
  const [history, setHistory] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const scrollRef = useRef(null);
  const cleanupRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [history, streamBuffer]);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => cleanupRef.current?.();
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    const userMsg = {
      sender: "user",
      text: trimmed,
      time: new Date().toLocaleTimeString(),
    };
    setHistory((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    setStreamBuffer("");

    const messages = [
      ...history
        .filter((m) => m.sender !== "vic" || history.indexOf(m) > 0) // skip initial greeting
        .map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        })),
      { role: "user", content: trimmed },
    ];

    cleanupRef.current = queryClaude({
      messages,
      nodes,
      apiKey,
      onChunk: (text) => {
        setStreamBuffer((prev) => prev + text);
      },
      onDone: async (fullText) => {
        setStreaming(false);
        setStreamBuffer("");

        // Parse JSON response from Claude
        let investigatorText = fullText;
        let newFiles = [];

        try {
          const parsed = JSON.parse(fullText);
          investigatorText = parsed.investigatorText ?? fullText;
          newFiles = parsed.newFiles ?? [];
        } catch {
          // Not JSON -- treat as plain text response
        }

        // Add Vic Sage message to history
        setHistory((prev) => [
          ...prev,
          {
            sender: "vic",
            text: investigatorText,
            time: new Date().toLocaleTimeString(),
          },
        ]);

        // Write any new files to vault
        for (const file of newFiles) {
          if (file.name && file.content) {
            await onWriteFile?.(file.name, file.content);
          }
        }

        // Trigger vault refresh if new files were written
        if (newFiles.length > 0) {
          onVaultRefresh?.();
        }

        cleanupRef.current = null;
      },
      onError: (message) => {
        setStreaming(false);
        setStreamBuffer("");
        setHistory((prev) => [
          ...prev,
          {
            sender: "error",
            text: `Connection error: ${message}`,
            time: new Date().toLocaleTimeString(),
          },
        ]);
        cleanupRef.current = null;
      },
    });
  }, [input, streaming, history, nodes, apiKey, onWriteFile, onVaultRefresh]);

  return (
    <View style={{ flex: 1, backgroundColor: "#020617" }}>
      {/* Terminal banner */}
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
              backgroundColor: streaming ? "#f43f5e" : "#22c55e",
            }}
          />
          <Text
            style={{
              color: "#f43f5e",
              fontFamily: "monospace",
              fontSize: 11,
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            THE QUESTION [CLI]
          </Text>
        </View>
        <Text
          style={{ color: "#475569", fontFamily: "monospace", fontSize: 9 }}
        >
          {streaming ? "SCANNING..." : "READY"}
        </Text>
      </View>

      {/* Message history */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
        {history.map((msg, idx) => (
          <View
            key={idx}
            style={{
              padding: 14,
              borderRadius: 6,
              backgroundColor:
                msg.sender === "vic"
                  ? "#0f172a"
                  : msg.sender === "error"
                    ? "#1c0a0d"
                    : "#020617",
              borderWidth: 1,
              borderColor:
                msg.sender === "vic"
                  ? "#1e293b"
                  : msg.sender === "error"
                    ? "#f43f5e"
                    : "#0f172a",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  fontWeight: "bold",
                  color:
                    msg.sender === "vic"
                      ? "#f43f5e"
                      : msg.sender === "error"
                        ? "#f43f5e"
                        : "#94a3b8",
                }}
              >
                {msg.sender === "vic"
                  ? "THE QUESTION (VIC SAGE)"
                  : msg.sender === "error"
                    ? "ERROR"
                    : "YOU"}
              </Text>
              <Text
                style={{
                  color: "#475569",
                  fontFamily: "monospace",
                  fontSize: 9,
                }}
              >
                {msg.time}
              </Text>
            </View>
            <Text
              style={{
                color: "#cbd5e1",
                fontFamily: "monospace",
                fontSize: 13,
                lineHeight: 22,
              }}
            >
              {msg.text}
            </Text>
          </View>
        ))}

        {/* Streaming indicator */}
        {streaming && (
          <View
            style={{
              padding: 14,
              borderRadius: 6,
              backgroundColor: "#0f172a",
              borderWidth: 1,
              borderColor: "#f43f5e40",
            }}
          >
            <Text
              style={{
                color: "#f43f5e",
                fontFamily: "monospace",
                fontSize: 9,
                fontWeight: "bold",
                marginBottom: 6,
              }}
            >
              THE QUESTION (VIC SAGE)
            </Text>
            <Text
              style={{
                color: "#cbd5e1",
                fontFamily: "monospace",
                fontSize: 13,
                lineHeight: 22,
              }}
            >
              {streamBuffer || "..."}
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Quick actions */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          flexDirection: "row",
          gap: 8,
          flexWrap: "wrap",
          backgroundColor: "#0f172a",
          borderTopWidth: 1,
          borderTopColor: "#1e293b",
        }}
      >
        <Text
          style={{
            color: "#475569",
            fontFamily: "monospace",
            fontSize: 10,
            alignSelf: "center",
          }}
        >
          Quick:
        </Text>
        {[
          "/investigate memory leak in API pool",
          "/interrogate-spec auth token caching",
        ].map((cmd) => (
          <TouchableOpacity
            key={cmd}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              backgroundColor: "#1e293b",
              borderRadius: 4,
            }}
            onPress={() => setInput(cmd)}
          >
            <Text
              style={{
                color: "#94a3b8",
                fontFamily: "monospace",
                fontSize: 10,
              }}
            >
              {cmd}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input area */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          padding: 12,
          backgroundColor: "#020617",
          borderTopWidth: 1,
          borderTopColor: "#0f172a",
        }}
      >
        <TextInput
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: "#0f172a",
            borderWidth: 1,
            borderColor: "#1e293b",
            borderRadius: 6,
            color: "#e2e8f0",
            fontFamily: "monospace",
            fontSize: 13,
          }}
          value={input}
          onChangeText={setInput}
          placeholder="Type command or question..."
          placeholderTextColor="#334155"
          onSubmitEditing={handleSend}
          editable={!streaming}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 6,
            backgroundColor: streaming ? "#1e293b" : "#9f1239",
          }}
          onPress={handleSend}
          disabled={streaming}
        >
          <Text
            style={{
              color: streaming ? "#475569" : "#fda4af",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            {streaming ? "WAIT" : "SEND"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
