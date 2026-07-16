/**
 * claudeClient.js
 * Renderer-side wrapper for window.electronAPI Claude IPC methods.
 */

/**
 * Formats the current board state as a string for the Claude system prompt context.
 * @param {Array} nodes - VaultNode objects from vault:read IPC
 * @returns {string}
 */
export function buildBoardContext(nodes) {
  return nodes
    .map((node) => {
      const lines = [
        `${node.type}: ${node.name} (${node.confidence ?? "unknown"})`,
      ];
      if (node.status) lines.push(`  Status: ${node.status}`);
      if (node.verdict) lines.push(`  Verdict: ${node.verdict}`);
      if (node.links.length) lines.push(`  Links: ${node.links.join(", ")}`);
      return lines.join("\n");
    })
    .join("\n\n");
}

/**
 * Streams a Claude query via the Electron IPC bridge.
 * Registers chunk/done/error listeners before firing the query to avoid missing early chunks.
 *
 * @param {object} opts
 * @param {Array}    opts.messages  - Conversation history (OpenAI format)
 * @param {Array}    opts.nodes     - VaultNode array for board context
 * @param {string}   opts.apiKey   - Claude API key
 * @param {Function} [opts.onChunk] - Called with each streamed text chunk
 * @param {Function} [opts.onDone]  - Called with the full completed text
 * @param {Function} [opts.onError] - Called with an error message string
 * @returns {Function} cleanup - Call to remove all IPC listeners early (e.g. on unmount)
 */
export function queryClaude({
  messages,
  nodes,
  apiKey,
  onChunk,
  onDone,
  onError,
}) {
  const boardContext = buildBoardContext(nodes);

  // Clear any leftover listeners from a previous call before registering new ones
  window.electronAPI.removeListeners("claude:chunk");
  window.electronAPI.removeListeners("claude:done");
  window.electronAPI.removeListeners("claude:error");

  window.electronAPI.onClaudeChunk((data) => onChunk?.(data.text));

  window.electronAPI.onClaudeDone((data) => {
    window.electronAPI.removeListeners("claude:chunk");
    window.electronAPI.removeListeners("claude:done");
    window.electronAPI.removeListeners("claude:error");
    onDone?.(data.fullText);
  });

  window.electronAPI.onClaudeError((data) => {
    window.electronAPI.removeListeners("claude:chunk");
    window.electronAPI.removeListeners("claude:done");
    window.electronAPI.removeListeners("claude:error");
    onError?.(data.message);
  });

  // Fire the query (non-blocking -- streaming events come back async)
  window.electronAPI.queryClaude(messages, boardContext, apiKey);

  // Return cleanup in case component unmounts before done
  return () => {
    window.electronAPI.removeListeners("claude:chunk");
    window.electronAPI.removeListeners("claude:done");
    window.electronAPI.removeListeners("claude:error");
  };
}
