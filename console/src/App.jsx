import { useState, useEffect, useCallback } from "react";
import CrazyBoard from "./tabs/CrazyBoard";
import MarkdownEditor from "./tabs/MarkdownEditor";
import VicSageTerminal from "./tabs/VicSageTerminal";

const TABS = ["crazyboard", "editor", "terminal"];

export default function App() {
  const [activeTab, setActiveTab] = useState("crazyboard");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [vaultPath, setVaultPath] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [boardPositions, setBoardPositions] = useState({});
  const [boardManualEdges, setBoardManualEdges] = useState([]);

  useEffect(() => {
    loadVault();
    window.electronAPI.onVaultChanged(() => loadVault());
    return () => window.electronAPI.removeListeners("vault:changed");
  }, []);

  useEffect(() => {
    window.electronAPI?.readBoard?.().then((saved) => {
      if (saved?.positions) setBoardPositions(saved.positions);
      if (saved?.manualEdges) setBoardManualEdges(saved.manualEdges);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.electronAPI?.writeBoard?.({
        positions: boardPositions,
        manualEdges: boardManualEdges,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [boardPositions, boardManualEdges]);

  const loadVault = useCallback(async () => {
    const result = await window.electronAPI.readVault();
    if (result?.nodes) {
      setNodes(result.nodes);
      setEdges(result.edges ?? []);
    }
  }, []);

  const handleOpenVault = useCallback(async () => {
    const result = await window.electronAPI.openVault();
    if (result?.path) {
      setVaultPath(result.path);
      await loadVault();
      await window.electronAPI.watchVault();
    }
  }, [loadVault]);

  const handleWriteFile = useCallback(async (fileName, content) => {
    await window.electronAPI.writeFile(fileName, content);
  }, []);

  const handleSelectFile = useCallback((fileName) => {
    setActiveFile(fileName);
  }, []);

  const handleOpenEditor = useCallback((fileName) => {
    setActiveFile(fileName);
    setActiveTab("editor");
  }, []);

  const activeNode = nodes.find((n) => n.fileName === activeFile) ?? null;

  const filteredNodes = searchTerm
    ? nodes.filter((n) =>
        n.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : nodes;

  const typeColor = {
    Case: "#f43f5e",
    Suspect: "#f59e0b",
    Source: "#06b6d4",
    Index: "#64748b",
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        backgroundColor: "#020617",
        overflow: "hidden",
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
          paddingTop: 12,
          paddingBottom: 12,
          backgroundColor: "#0f172a",
          borderBottomWidth: 1,
          borderBottomStyle: "solid",
          borderBottomColor: "#f43f5e30",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 36,
              height: 36,
              borderRadius: 4,
              backgroundColor: "#1c0a0d",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "#f43f5e",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                color: "#f43f5e",
                fontFamily: "monospace",
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              ?
            </div>
          </div>
          <div>
            <div
              style={{
                color: "#e2e8f0",
                fontFamily: "monospace",
                fontSize: 12,
                fontWeight: "bold",
                letterSpacing: 3,
              }}
            >
              THE QUESTION
            </div>
            <div
              style={{ color: "#475569", fontFamily: "monospace", fontSize: 9 }}
            >
              {vaultPath ?? "No vault open"}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
          }}
        >
          <button
            type="button"
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 7,
              paddingBottom: 7,
              borderRadius: 4,
              backgroundColor: showApiKeyInput ? "#4c0519" : "#1e293b",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: showApiKeyInput ? "#f43f5e" : "#334155",
              cursor: "pointer",
            }}
            onClick={() => setShowApiKeyInput((v) => !v)}
          >
            <div
              style={{
                color: apiKey ? "#22c55e" : "#f59e0b",
                fontFamily: "monospace",
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              {apiKey ? "KEY SET" : "SET API KEY"}
            </div>
          </button>
          <button
            type="button"
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 7,
              paddingBottom: 7,
              borderRadius: 4,
              backgroundColor: "#1e293b",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "#334155",
              cursor: "pointer",
            }}
            onClick={handleOpenVault}
          >
            <div
              style={{
                color: "#94a3b8",
                fontFamily: "monospace",
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              OPEN VAULT
            </div>
          </button>
        </div>
      </div>

      {/* API key input (shown when toggled) */}
      {showApiKeyInput && (
        <div
          style={{
            display: "flex",
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 10,
            paddingBottom: 10,
            backgroundColor: "#0f172a",
            borderBottomWidth: 1,
            borderBottomStyle: "solid",
            borderBottomColor: "#1e293b",
            flexDirection: "row",
            gap: 8,
          }}
        >
          <input
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: "#020617",
              borderRadius: 4,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "#334155",
              color: "#e2e8f0",
              fontFamily: "monospace",
              fontSize: 12,
            }}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            type="password"
          />
          <button
            type="button"
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 10,
              paddingBottom: 10,
              backgroundColor: "#052e16",
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setShowApiKeyInput(false)}
          >
            <div
              style={{
                color: "#86efac",
                fontFamily: "monospace",
                fontSize: 11,
                fontWeight: "bold",
              }}
            >
              SAVE
            </div>
          </button>
        </div>
      )}

      {/* Main layout: sidebar + content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 240,
            backgroundColor: "#0a0f1e",
            borderRight: "1px solid #1e293b",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {/* Tab navigation */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: 12,
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
              borderBottomColor: "#1e293b",
              gap: 4,
            }}
          >
            <div
              style={{
                color: "#475569",
                fontFamily: "monospace",
                fontSize: 9,
                fontWeight: "bold",
                letterSpacing: 2,
                paddingLeft: 4,
                paddingRight: 4,
                paddingBottom: 6,
              }}
            >
              VIEWS
            </div>
            {[
              { id: "crazyboard", label: "Crazy Wall" },
              { id: "editor", label: "File Editor" },
              { id: "terminal", label: "Vic Sage CLI" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 8,
                  paddingBottom: 8,
                  borderRadius: 4,
                  backgroundColor:
                    activeTab === tab.id ? "#1c0a0d" : "transparent",
                  borderWidth: activeTab === tab.id ? 1 : 0,
                  borderStyle: "solid",
                  borderColor: "#f43f5e30",
                  cursor: "pointer",
                  width: "100%",
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <div
                  style={{
                    color: activeTab === tab.id ? "#f43f5e" : "#64748b",
                    fontFamily: "monospace",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                >
                  {tab.label}
                </div>
                {activeTab === tab.id && (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#f43f5e",
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* File list */}
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 10,
                paddingBottom: 6,
              }}
            >
              <div
                style={{
                  color: "#475569",
                  fontFamily: "monospace",
                  fontSize: 9,
                  fontWeight: "bold",
                  letterSpacing: 2,
                  marginBottom: 8,
                }}
              >
                VAULT FILES
              </div>
              <input
                style={{
                  paddingLeft: 8,
                  paddingRight: 8,
                  paddingTop: 6,
                  paddingBottom: 6,
                  backgroundColor: "#020617",
                  borderRadius: 4,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "#1e293b",
                  color: "#94a3b8",
                  fontFamily: "monospace",
                  fontSize: 11,
                  width: "100%",
                  boxSizing: "border-box",
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
              />
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              <div
                style={{
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingBottom: 12,
                }}
              >
                {filteredNodes.length === 0 && (
                  <div
                    style={{
                      color: "#334155",
                      fontFamily: "monospace",
                      fontSize: 10,
                      textAlign: "center",
                      paddingTop: 20,
                    }}
                  >
                    {vaultPath ? "No files found" : "Open a vault to begin"}
                  </div>
                )}
                {filteredNodes.map((node) => (
                  <button
                    key={node.fileName}
                    type="button"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingLeft: 8,
                      paddingRight: 8,
                      paddingTop: 7,
                      paddingBottom: 7,
                      borderRadius: 4,
                      marginBottom: 2,
                      backgroundColor:
                        activeFile === node.fileName
                          ? "#1c0a0d"
                          : "transparent",
                      border: "none",
                      cursor: "pointer",
                      width: "100%",
                    }}
                    onClick={() => handleOpenEditor(node.fileName)}
                  >
                    <div
                      style={{
                        color: "#cbd5e1",
                        fontFamily: "monospace",
                        fontSize: 10,
                        flex: 1,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        textAlign: "left",
                      }}
                    >
                      {node.name}
                    </div>
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: typeColor[node.type] ?? "#475569",
                        flexShrink: 0,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div
          style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}
        >
          {activeTab === "crazyboard" && (
            <CrazyBoard
              nodes={nodes}
              edges={edges}
              activeFile={activeFile}
              onSelectFile={handleSelectFile}
              onOpenEditor={handleOpenEditor}
              onWriteFile={handleWriteFile}
              apiKey={apiKey}
              positions={boardPositions}
              setPositions={setBoardPositions}
              manualEdges={boardManualEdges}
              setManualEdges={setBoardManualEdges}
            />
          )}
          {activeTab === "editor" && (
            <MarkdownEditor
              node={activeNode}
              onSelectFile={handleSelectFile}
              onWriteFile={handleWriteFile}
            />
          )}
          {activeTab === "terminal" && (
            <VicSageTerminal
              nodes={nodes}
              apiKey={apiKey}
              onWriteFile={handleWriteFile}
              onVaultRefresh={loadVault}
            />
          )}
        </div>
      </div>
    </div>
  );
}
