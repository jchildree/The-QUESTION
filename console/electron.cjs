"use strict";

const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

const Store = require("electron-store").default;
const store = new Store();

let mainWindow = null;
let vaultWatcher = null;

// ---------------------------------------------------------------------------
// Vault parse logic (inline -- vaultParser.js does not exist yet)
// ---------------------------------------------------------------------------

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const block = match[1];
  const result = {};
  for (const line of block.split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) result[kv[1].trim()] = kv[2].trim();
  }
  return result;
}

function inferType(fileName) {
  if (fileName.startsWith("Case:") || fileName.startsWith("Case -"))
    return "Case";
  if (fileName.startsWith("Suspect:") || fileName.startsWith("Suspect -"))
    return "Suspect";
  if (fileName.startsWith("Source:") || fileName.startsWith("Source -"))
    return "Source";
  return "Index";
}

function extractBodyField(body, label) {
  const m = body.match(new RegExp(`\\*\\*${label}\\*\\*:\\s*(.+)`));
  return m ? m[1].trim() : null;
}

function extractWikilinks(body) {
  const targets = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    targets.push(m[1].trim());
  }
  return targets;
}

function parseVaultFile(fileName, content) {
  const fm = parseFrontmatter(content);
  // Strip frontmatter to get body
  const body = content.replace(/^---[\s\S]*?---\r?\n/, "");
  const baseName = fileName.replace(/\.md$/, "");
  const links = extractWikilinks(body);

  const node = {
    name: baseName,
    fileName,
    content,
    type: inferType(baseName),
    confidence: fm.confidence || null,
    id: fm.id || null,
    asserted: fm.asserted || null,
    method: fm.method || null,
    status: extractBodyField(body, "Status"),
    verdict: extractBodyField(body, "Verdict"),
    links,
  };

  const edges = links.map((link) => ({
    from: fileName,
    to: link.endsWith(".md") ? link : link + ".md",
    label: "LINK",
  }));

  return { node, edges };
}

// ---------------------------------------------------------------------------
// Window setup
// ---------------------------------------------------------------------------

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "dist-electron", "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ---------------------------------------------------------------------------
// IPC handlers
// ---------------------------------------------------------------------------

ipcMain.handle("vault:open", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (result.canceled || result.filePaths.length === 0) return { path: null };
  const chosen = result.filePaths[0];
  store.set("vaultPath", chosen);
  return { path: chosen };
});

ipcMain.handle("vault:read", async () => {
  const vaultPath = store.get("vaultPath");
  if (!vaultPath) return { nodes: [], edges: [] };

  const files = fs.readdirSync(vaultPath).filter((f) => f.endsWith(".md"));
  const nodes = [];
  const edges = [];

  for (const fileName of files) {
    try {
      const content = fs.readFileSync(path.join(vaultPath, fileName), "utf8");
      const parsed = parseVaultFile(fileName, content);
      nodes.push(parsed.node);
      edges.push(...parsed.edges);
    } catch (err) {
      console.error("vault:read error on", fileName, err.message);
    }
  }

  return { nodes, edges };
});

ipcMain.handle("vault:write", async (_event, { fileName, content }) => {
  const vaultPath = store.get("vaultPath");
  if (!vaultPath) return { ok: false };
  try {
    fs.writeFileSync(path.join(vaultPath, fileName), content, "utf8");
    return { ok: true };
  } catch (err) {
    console.error("vault:write error:", err.message);
    return { ok: false };
  }
});

ipcMain.handle("vault:watch", async () => {
  const vaultPath = store.get("vaultPath");
  if (!vaultPath) return { ok: false };

  if (vaultWatcher) {
    vaultWatcher.close();
    vaultWatcher = null;
  }

  try {
    vaultWatcher = fs.watch(
      vaultPath,
      { recursive: false },
      (_eventType, fileName) => {
        if (fileName && mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("vault:changed", { fileName });
        }
      }
    );
    return { ok: true };
  } catch (err) {
    console.error("vault:watch error:", err.message);
    return { ok: false };
  }
});

ipcMain.handle(
  "claude:query",
  async (_event, { messages, boardContext, apiKey }) => {
    let Anthropic;
    try {
      Anthropic = require("@anthropic-ai/sdk");
      // Handle both default export shapes
      if (Anthropic.default) Anthropic = Anthropic.default;
    } catch (err) {
      console.error("claude:query - Anthropic SDK not found:", err.message);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("claude:error", {
          message: "Anthropic SDK not installed.",
        });
      }
      return { ok: false };
    }

    const anthropic = new Anthropic({ apiKey });

    // Load QUESTION.md for system prompt
    let systemPrompt = "";
    const devPath = path.join(
      process.cwd(),
      "..",
      "the-question",
      "the-question",
      "QUESTION.md"
    );
    const prodPath = process.resourcesPath
      ? path.join(process.resourcesPath, "question.md")
      : null;

    for (const candidate of [devPath, prodPath].filter(Boolean)) {
      try {
        systemPrompt = fs.readFileSync(candidate, "utf8");
        break;
      } catch {
        // try next
      }
    }

    if (boardContext) {
      systemPrompt += "\n\n## Board Context\n" + boardContext;
    }
    systemPrompt +=
      '\n\nRespond in JSON: {"investigatorText": string, "newFiles": [{name: string, content: string}]}';

    // Kick off streaming async -- return ok immediately
    (async () => {
      let fullText = "";
      try {
        const stream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          system: systemPrompt,
          messages,
        });

        stream.on("text", (text) => {
          fullText += text;
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("claude:chunk", { text });
          }
        });

        await stream.finalMessage();

        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("claude:done", { fullText });
        }
      } catch (err) {
        console.error("claude:query stream error:", err.message);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("claude:error", { message: err.message });
        }
      }
    })();

    return { ok: true };
  }
);

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
