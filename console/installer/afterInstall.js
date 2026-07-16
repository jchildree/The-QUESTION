"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = async function afterInstall(_context) {
  if (process.platform !== "win32") return;

  // Source: bundled inside the installer at resources/plugin (relative to this hook file)
  // __dirname is <installDir>/resources/app.asar.unpacked/installer or similar;
  // the extraFiles entry places plugin at <installDir>/resources/plugin.
  const pluginSrc = path.join(__dirname, "..", "plugin");

  // Target: user's Claude Code plugins directory
  // Claude Code on Windows stores plugins at %USERPROFILE%\.claude\plugins\
  const claudePluginsDir = path.join(
    os.homedir(),
    ".claude",
    "plugins",
    "the-question"
  );

  // Ensure source exists (graceful skip if bundle was not included)
  if (!fs.existsSync(pluginSrc)) {
    console.log(
      "[afterInstall] Plugin source not found at:",
      pluginSrc,
      "-- skipping plugin copy"
    );
    return;
  }

  // Copy plugin tree
  try {
    fs.mkdirSync(claudePluginsDir, { recursive: true });
    copyDirSync(pluginSrc, claudePluginsDir);
    console.log(
      "[afterInstall] The Question plugin installed to:",
      claudePluginsDir
    );
  } catch (err) {
    // Non-fatal: installer succeeds even if plugin copy fails
    console.error("[afterInstall] Plugin copy failed:", err);
  }
};

function copyDirSync(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
