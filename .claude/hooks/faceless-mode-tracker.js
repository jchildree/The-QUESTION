#!/usr/bin/env node
// faceless -- UserPromptSubmit bridge hook.
//
// Faceless is a re-voice of caveman: same compression engine, colder face.
// The engine's flag file and stats only recognize "caveman" tokens, so a
// faceless activation (/faceless, "faceless mode", "talk faceless") would
// never set the flag and the stats hook would go blind. This hook is the
// handshake: it maps a faceless activation to the SAME .caveman-active flag
// using the engine's own caveman-config helpers, then stays out of the way.
//
// The engine (caveman-mode-tracker.js, caveman-stats.js) is untouched. This
// hook only writes/clears the flag; per-turn reinforcement is left to the
// caveman tracker, which must run AFTER this one in the UserPromptSubmit
// chain so it reads the freshly-written flag the same turn.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { getDefaultMode, safeWriteFlag, VALID_MODES } = require('./caveman-config');

// Levels selectable via /faceless <level> -- the caveman level vocabulary.
const FACELESS_LEVELS = new Set([
  'lite', 'full', 'ultra', 'wenyan-lite', 'wenyan', 'wenyan-full', 'wenyan-ultra'
]);

const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const flagPath = path.join(claudeDir, '.caveman-active');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const prompt = (data.prompt || '').trim().toLowerCase();

    // Deactivation first -- "stop/disable/turn off/deactivate faceless".
    // "normal mode" is already handled by the caveman tracker; don't double up.
    if (/\b(stop|disable|deactivate|turn off)\b.*\bfaceless\b/i.test(prompt) ||
        /\bfaceless\b.*\b(stop|disable|deactivate|turn off)\b/i.test(prompt)) {
      try { fs.unlinkSync(flagPath); } catch (e) {}
      return;
    }

    let mode = null;

    // Slash command: /faceless [level]
    if (prompt.startsWith('/faceless')) {
      const parts = prompt.split(/\s+/);
      const arg = parts[1] || '';
      if (!arg) {
        mode = getDefaultMode();
      } else if (arg === 'off' || arg === 'stop' || arg === 'disable') {
        try { fs.unlinkSync(flagPath); } catch (e) {}
        return;
      } else if (arg === 'wenyan-full') {
        mode = 'wenyan'; // canonical alias -- config stores as 'wenyan'
      } else if (FACELESS_LEVELS.has(arg)) {
        mode = arg;
      }
      // Unknown arg -> mode stays null, flag untouched (no silent overwrite).
    } else if (
      // Natural-language activation. Mirror the caveman tracker's shape, plus
      // the faceless-specific triggers from the skill's description.
      /\b(activate|enable|turn on|start|talk)\b.*\bfaceless\b/i.test(prompt) ||
      /\bfaceless\b.*\b(mode|activate|enable|turn on|start)\b/i.test(prompt) ||
      /\bbe brief\b/i.test(prompt) ||
      /\bless tokens\b/i.test(prompt)
    ) {
      mode = getDefaultMode();
    }

    if (mode && mode !== 'off' && VALID_MODES.includes(mode)) {
      safeWriteFlag(flagPath, mode);
    }
  } catch (e) {
    // Silent fail -- the flag is best-effort.
  }
});
