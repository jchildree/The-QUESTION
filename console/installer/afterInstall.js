"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = async function afterInstall(context) {
  const isWindows =
    context.targets?.[0]?.name === "nsis" || process.platform === "win32";
  if (!isWindows) return;

  // Source: plugin files bundled inside the installer resources
  const pluginSrc = path.join(
    context.appOutDir ?? context.installPath ?? "",
    "..",
    "resources",
    "plugin"
  );

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
    console.error("[afterInstall] Plugin copy failed:", err.message);
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
