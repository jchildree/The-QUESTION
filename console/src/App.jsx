import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
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

  // Load vault on mount + watch for changes
  useEffect(() => {
    loadVault();
    window.electronAPI.onVaultChanged(() => loadVault());
    return () => window.electronAPI.removeListeners("vault:changed");
  }, []);

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
    setActiveTab("editor");
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
    <View
      style={{ flex: 1, flexDirection: "column", backgroundColor: "#020617" }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#0f172a",
          borderBottomWidth: 1,
          borderBottomColor: "#f43f5e30",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 4,
              backgroundColor: "#1c0a0d",
              borderWidth: 1,
              borderColor: "#f43f5e",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#f43f5e",
                fontFamily: "monospace",
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              ?
            </Text>
          </View>
          <View>
            <Text
              style={{
                color: "#e2e8f0",
                fontFamily: "monospace",
                fontSize: 12,
                fontWeight: "bold",
                letterSpacing: 3,
              }}
            >
              THE QUESTION
            </Text>
            <Text
              style={{ color: "#475569", fontFamily: "monospace", fontSize: 9 }}
            >
              {vaultPath ?? "No vault open"}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <TouchableOpacity
            style={{
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 4,
              backgroundColor: showApiKeyInput ? "#4c0519" : "#1e293b",
              borderWidth: 1,
              borderColor: showApiKeyInput ? "#f43f5e" : "#334155",
            }}
            onPress={() => setShowApiKeyInput((v) => !v)}
          >
            <Text
              style={{
                color: apiKey ? "#22c55e" : "#f59e0b",
                fontFamily: "monospace",
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              {apiKey ? "KEY SET" : "SET API KEY"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 4,
              backgroundColor: "#1e293b",
              borderWidth: 1,
              borderColor: "#334155",
            }}
            onPress={handleOpenVault}
          >
            <Text
              style={{
                color: "#94a3b8",
                fontFamily: "monospace",
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              OPEN VAULT
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* API key input (shown when toggled) */}
      {showApiKeyInput && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: "#0f172a",
            borderBottomWidth: 1,
            borderBottomColor: "#1e293b",
            flexDirection: "row",
            gap: 8,
          }}
        >
          <TextInput
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: "#020617",
              borderRadius: 4,
              borderWidth: 1,
              borderColor: "#334155",
              color: "#e2e8f0",
              fontFamily: "monospace",
              fontSize: 12,
            }}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-ant-..."
            placeholderTextColor="#334155"
            secureTextEntry
          />
          <TouchableOpacity
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: "#052e16",
              borderRadius: 4,
            }}
            onPress={() => setShowApiKeyInput(false)}
          >
            <Text
              style={{
                color: "#86efac",
                fontFamily: "monospace",
                fontSize: 11,
                fontWeight: "bold",
              }}
            >
              SAVE
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main layout: sidebar + content */}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Sidebar */}
        <View
          style={{
            width: 240,
            backgroundColor: "#0a0f1e",
            borderRightWidth: 1,
            borderRightColor: "#1e293b",
            flexDirection: "column",
          }}
        >
          {/* Tab navigation */}
          <View
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#1e293b",
              gap: 4,
            }}
          >
            <Text
              style={{
                color: "#475569",
                fontFamily: "monospace",
                fontSize: 9,
                fontWeight: "bold",
                letterSpacing: 2,
                paddingHorizontal: 4,
                paddingBottom: 6,
              }}
            >
              VIEWS
            </Text>
            {[
              { id: "crazyboard", label: "Crazy Wall" },
              { id: "editor", label: "File Editor" },
              { id: "terminal", label: "Vic Sage CLI" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 4,
                  backgroundColor:
                    activeTab === tab.id ? "#1c0a0d" : "transparent",
                  borderWidth: activeTab === tab.id ? 1 : 0,
                  borderColor: "#f43f5e30",
                }}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text
                  style={{
                    color: activeTab === tab.id ? "#f43f5e" : "#64748b",
                    fontFamily: "monospace",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                >
                  {tab.label}
                </Text>
                {activeTab === tab.id && (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#f43f5e",
                    }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* File list */}
          <View style={{ flex: 1, overflow: "hidden" }}>
            <View
              style={{
                paddingHorizontal: 12,
                paddingTop: 10,
                paddingBottom: 6,
              }}
            >
              <Text
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
              </Text>
              <TextInput
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  backgroundColor: "#020617",
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: "#1e293b",
                  color: "#94a3b8",
                  fontFamily: "monospace",
                  fontSize: 11,
                }}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Search..."
                placeholderTextColor="#334155"
              />
            </View>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 12,
                paddingBottom: 12,
              }}
            >
              {filteredNodes.length === 0 && (
                <Text
                  style={{
                    color: "#334155",
                    fontFamily: "monospace",
                    fontSize: 10,
                    textAlign: "center",
                    paddingTop: 20,
                  }}
                >
                  {vaultPath ? "No files found" : "Open a vault to begin"}
                </Text>
              )}
              {filteredNodes.map((node) => (
                <TouchableOpacity
                  key={node.fileName}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 8,
                    paddingVertical: 7,
                    borderRadius: 4,
                    marginBottom: 2,
                    backgroundColor:
                      activeFile === node.fileName ? "#1c0a0d" : "transparent",
                  }}
                  onPress={() => handleSelectFile(node.fileName)}
                >
                  <Text
                    style={{
                      color: "#cbd5e1",
                      fontFamily: "monospace",
                      fontSize: 10,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {node.name}
                  </Text>
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: typeColor[node.type] ?? "#475569",
                    }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Tab content */}
        <View style={{ flex: 1 }}>
          {activeTab === "crazyboard" && (
            <CrazyBoard
              nodes={nodes}
              edges={edges}
              activeFile={activeFile}
              onSelectFile={handleSelectFile}
              onOpenEditor={handleOpenEditor}
              onWriteFile={handleWriteFile}
              apiKey={apiKey}
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
        </View>
      </View>
    </View>
  );
}
