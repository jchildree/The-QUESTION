/**
 * vaultParser.js - renderer-side display helpers for The Question Console.
 *
 * Handles ONLY display-layer concerns: color mapping, markdown line parsing,
 * wikilink extraction, new-node templates, and node-type inference.
 *
 * File I/O and YAML frontmatter parsing live in the main process (electron.cjs).
 */

// ---------------------------------------------------------------------------
// 1. Confidence color map
// ---------------------------------------------------------------------------

export const CONFIDENCE_COLORS = {
  verified: "#22c55e", // green-500
  corroborated: "#f59e0b", // amber-500
  unverified: "#ef4444", // rose-500
  null: "#64748b", // slate-500 (fallback)
};

// ---------------------------------------------------------------------------
// 2. getConfidenceColor
// ---------------------------------------------------------------------------

export function getConfidenceColor(confidence) {
  return CONFIDENCE_COLORS[confidence] ?? CONFIDENCE_COLORS.null;
}

// ---------------------------------------------------------------------------
// 3. parseMarkdownLines
// ---------------------------------------------------------------------------

/**
 * Parses raw markdown content into an array of typed line objects.
 * Skips the frontmatter block (first --- ... ---).
 *
 * @param {string} content - raw markdown string
 * @returns {Array<Object>} typed line objects
 */
export function parseMarkdownLines(content) {
  if (!content) return [];

  const rawLines = content.split("\n");
  const result = [];

  let inFrontmatter = false;
  let frontmatterDone = false;
  let inCode = false;

  for (const raw of rawLines) {
    const line = raw;

    // -- Frontmatter handling --
    if (!frontmatterDone) {
      if (!inFrontmatter && line.trim() === "---") {
        inFrontmatter = true;
        continue;
      }
      if (inFrontmatter) {
        if (line.trim() === "---") {
          inFrontmatter = false;
          frontmatterDone = true;
        }
        continue;
      }
      // No opening --- found yet -- treat as regular content
      frontmatterDone = true;
    }

    // -- Code block toggle --
    if (line.trim().startsWith("```")) {
      inCode = !inCode;
      // Emit the fence line as code type so the renderer can style it
      result.push({ type: "code", text: line });
      continue;
    }

    if (inCode) {
      result.push({ type: "code", text: line });
      continue;
    }

    // -- Headings --
    if (line.startsWith("### ")) {
      result.push({ type: "h3", text: line.slice(4) });
      continue;
    }
    if (line.startsWith("## ")) {
      result.push({ type: "h2", text: line.slice(3) });
      continue;
    }
    if (line.startsWith("# ")) {
      result.push({ type: "h1", text: line.slice(2) });
      continue;
    }

    // -- Bold Status / Verdict --
    if (/^\*\*Status\*\*:/.test(line)) {
      const value = line.replace(/^\*\*Status\*\*:\s*/, "").trim();
      result.push({ type: "status", value });
      continue;
    }
    if (/^\*\*Verdict\*\*:/.test(line)) {
      const value = line.replace(/^\*\*Verdict\*\*:\s*/, "").trim();
      result.push({ type: "verdict", value });
      continue;
    }

    // -- List items --
    if (line.startsWith("* ") || line.startsWith("- ")) {
      const text = line.slice(2);
      result.push({ type: "list", text, links: extractInlineLinks(text) });
      continue;
    }

    // -- Empty lines --
    if (line.trim() === "") {
      result.push({ type: "empty" });
      continue;
    }

    // -- Paragraph (catch-all) --
    result.push({
      type: "paragraph",
      text: line,
      links: extractInlineLinks(line),
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// 4. extractInlineLinks
// ---------------------------------------------------------------------------

/**
 * Parses [[wikilink]] targets from a text string.
 *
 * @param {string} text
 * @returns {Array<{text: string, target: string}>}
 */
export function extractInlineLinks(text) {
  const regex = /\[\[([^\]]+)\]\]/g;
  const links = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    links.push({ text: match[0], target: match[1].trim() });
  }
  return links;
}

// ---------------------------------------------------------------------------
// 5. formatNewNodeContent
// ---------------------------------------------------------------------------

/**
 * Generates the initial markdown content for a new vault node.
 *
 * @param {string} type - 'Case' | 'Suspect' | 'Source'
 * @param {string} title
 * @param {string} timestamp - ISO-8601 string
 * @returns {string}
 */
export function formatNewNodeContent(type, title, timestamp) {
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  const id = `spiffe://the-question/${type.toLowerCase()}-${Date.now()}/case/${slug}`;
  const frontmatter = `---\nid: ${id}\nasserted: ${timestamp}\nsource: ""\nmethod: observed\nconfidence: unverified\nverify: ""\n---\n`;

  if (type === "Case") {
    return `${frontmatter}# Case: ${title}\n\n**Status**: Open\n**Symptom**: \n\n## Timeline & Repro\n\n## Links\n`;
  }
  if (type === "Suspect") {
    return `${frontmatter}# Suspect: ${title}\n\n**Verdict**: Untested\n**Falsifiable Prediction**: \n\n## Evidence Gathered\n`;
  }
  // Source
  return `${frontmatter}# Source: ${title}\n\n**Claim**: \n**Confidence**: Medium\n\n## Artifact Payload\n\`\`\`\n\n\`\`\`\n`;
}

// ---------------------------------------------------------------------------
// 6. inferNodeType
// ---------------------------------------------------------------------------

/**
 * Infers the board node type from a vault file name.
 *
 * @param {string} fileName
 * @returns {'Case' | 'Suspect' | 'Source' | 'Index'}
 */
export function inferNodeType(fileName) {
  if (fileName.startsWith("Case:") || fileName.startsWith("Case -"))
    return "Case";
  if (fileName.startsWith("Suspect:") || fileName.startsWith("Suspect -"))
    return "Suspect";
  if (fileName.startsWith("Source:") || fileName.startsWith("Source -"))
    return "Source";
  return "Index";
}
