"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Vault operations
  openVault: () => ipcRenderer.invoke("vault:open"),
  readVault: () => ipcRenderer.invoke("vault:read"),
  writeFile: (fileName, content) =>
    ipcRenderer.invoke("vault:write", { fileName, content }),
  watchVault: () => ipcRenderer.invoke("vault:watch"),
  onVaultChanged: (callback) => {
    ipcRenderer.on("vault:changed", (_event, data) => callback(data));
  },

  // Claude operations
  queryClaude: (messages, boardContext, apiKey) =>
    ipcRenderer.invoke("claude:query", { messages, boardContext, apiKey }),
  onClaudeChunk: (callback) => {
    ipcRenderer.on("claude:chunk", (_event, data) => callback(data));
  },
  onClaudeDone: (callback) => {
    ipcRenderer.on("claude:done", (_event, data) => callback(data));
  },
  onClaudeError: (callback) => {
    ipcRenderer.on("claude:error", (_event, data) => callback(data));
  },

  // Cleanup - remove all listeners for a channel
  removeListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
