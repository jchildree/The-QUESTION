import { useState, useEffect, useRef, useCallback } from "react";
import { queryClaude } from "../lib/claudeClient";

const INITIAL_MESSAGE = {
  sender: "vic",
  text: "The board holds the secrets. Put up your files, connect them, or ask me to investigate. I don't believe stories here -- only traces.",
  time: new Date().toLocaleTimeString(),
};

export default function VicSageTerminal({
  nodes,
  apiKey,
  onWriteFile,
  onVaultRefresh,
}) {
  const [history, setHistory] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const scrollRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, streamBuffer]);

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
        .filter((m) => m.sender !== "vic" || history.indexOf(m) > 0)
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

        let investigatorText = fullText;
        let newFiles = [];

        try {
          const parsed = JSON.parse(fullText);
          investigatorText = parsed.investigatorText ?? fullText;
          newFiles = parsed.newFiles ?? [];
        } catch {
          // ponytail: plain text response, not JSON
        }

        setHistory((prev) => [
          ...prev,
          {
            sender: "vic",
            text: investigatorText,
            time: new Date().toLocaleTimeString(),
          },
        ]);

        for (const file of newFiles) {
          if (file.name && file.content) {
            await onWriteFile?.(file.name, file.content);
          }
        }

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
      {/* Terminal banner */}
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
              backgroundColor: streaming ? "#f43f5e" : "#22c55e",
            }}
          />
          <div
            style={{
              color: "#f43f5e",
              fontFamily: "monospace",
              fontSize: 11,
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            THE QUESTION [CLI]
          </div>
        </div>
        <div style={{ color: "#475569", fontFamily: "monospace", fontSize: 9 }}>
          {streaming ? "SCANNING..." : "READY"}
        </div>
      </div>

      {/* Message history */}
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        <div
          style={{
            padding: 16,
            gap: 12,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {history.map((msg, idx) => (
            <div
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
                border: `1px solid ${
                  msg.sender === "vic"
                    ? "#1e293b"
                    : msg.sender === "error"
                      ? "#f43f5e"
                      : "#0f172a"
                }`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <div
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
                </div>
                <div
                  style={{
                    color: "#475569",
                    fontFamily: "monospace",
                    fontSize: 9,
                  }}
                >
                  {msg.time}
                </div>
              </div>
              <div
                style={{
                  color: "#cbd5e1",
                  fontFamily: "monospace",
                  fontSize: 13,
                  lineHeight: 22,
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {streaming && (
            <div
              style={{
                padding: 14,
                borderRadius: 6,
                backgroundColor: "#0f172a",
                border: "1px solid #f43f5e40",
              }}
            >
              <div
                style={{
                  color: "#f43f5e",
                  fontFamily: "monospace",
                  fontSize: 9,
                  fontWeight: "bold",
                  marginBottom: 6,
                }}
              >
                THE QUESTION (VIC SAGE)
              </div>
              <div
                style={{
                  color: "#cbd5e1",
                  fontFamily: "monospace",
                  fontSize: 13,
                  lineHeight: 22,
                }}
              >
                {streamBuffer || "..."}
              </div>
            </div>
          )}

          <div style={{ height: 20 }} />
        </div>
      </div>

      {/* Quick actions */}
      <div
        style={{
          display: "flex",
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 8,
          paddingBottom: 8,
          flexDirection: "row",
          gap: 8,
          flexWrap: "wrap",
          backgroundColor: "#0f172a",
          borderTop: "1px solid #1e293b",
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: "#475569",
            fontFamily: "monospace",
            fontSize: 10,
          }}
        >
          Quick:
        </div>
        {[
          "/investigate memory leak in API pool",
          "/interrogate-spec auth token caching",
        ].map((cmd) => (
          <button
            key={cmd}
            type="button"
            style={{
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 5,
              paddingBottom: 5,
              backgroundColor: "#1e293b",
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setInput(cmd)}
          >
            <div
              style={{
                color: "#94a3b8",
                fontFamily: "monospace",
                fontSize: 10,
              }}
            >
              {cmd}
            </div>
          </button>
        ))}
      </div>

      {/* Input area */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 8,
          padding: 12,
          flexShrink: 0,
          backgroundColor: "#020617",
          borderTop: "1px solid #0f172a",
        }}
      >
        <input
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 6,
            color: "#e2e8f0",
            fontFamily: "monospace",
            fontSize: 13,
            outline: "none",
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type command or question..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !streaming) handleSend();
          }}
          disabled={streaming}
        />
        <button
          type="button"
          style={{
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 12,
            paddingBottom: 12,
            borderRadius: 6,
            backgroundColor: streaming ? "#1e293b" : "#9f1239",
            border: "none",
            cursor: streaming ? "default" : "pointer",
          }}
          onClick={handleSend}
          disabled={streaming}
        >
          <div
            style={{
              color: streaming ? "#475569" : "#fda4af",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            {streaming ? "WAIT" : "SEND"}
          </div>
        </button>
      </div>
    </div>
  );
}
