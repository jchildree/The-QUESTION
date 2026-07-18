<!-- SEED: re-run /impeccable document once there is code to capture the actual tokens and components. -->

---

name: The Question
description: Cold, precise, relentless investigative discipline for Claude Code.
colors:
near-black: "oklch(12% 0.012 55)"
surface: "oklch(17% 0.012 55)"
ink: "oklch(93% 0.006 55)"
muted: "oklch(52% 0.008 55)"
amber-accent: "oklch(70% 0.15 65)"
redline: "oklch(58% 0.18 30)"
typography:
display:
fontFamily: "[Instrument Serif or GT Sectra -- to be resolved at implementation]"
fontSize: "clamp(2rem, 5vw, 3.5rem)"
fontWeight: 400
lineHeight: 1.05
letterSpacing: "-0.02em"
body:
fontFamily: "[Crimson Pro or iA Writer Quattro -- to be resolved at implementation]"
fontSize: "clamp(1rem, 1.5vw, 1.125rem)"
fontWeight: 400
lineHeight: 1.6
mono:
fontFamily: "Berkeley Mono, JetBrains Mono, monospace"
fontSize: "0.9em"
fontWeight: 400
lineHeight: 1.5

---

# Design System: The Question

## 1. Overview

**Creative North Star: "The Conspiracy Board Under Lamplight"**

The Question's visual identity starts from a single image: a detective's board
at 2am, pinned evidence under a single amber bulb, near-black everywhere else.
Nothing decorative. Nothing warm by default. The surface is dark not as an
aesthetic choice but as an environmental fact -- this is where investigations
happen, not where products are sold.

The editorial references are Daring Fireball (precision in prose, typographic
restraint, no visual noise), Tufte (information density as respect for the
reader, the fewest marks that carry the most meaning), and Le Carre (cold
procedural intelligence; warmth earned only by stakes, never by styling). The
system borrows the patience of long-form investigative writing and the density
of technical documentation. It rejects the AI-assistant aesthetic entirely:
no friendly blues, no rounded softness, no reassuring copy.

The voice follows the same rule as the investigation: function over costume.
If the persona layer is stripped, the system still works and still looks right.
Brand identity is carried by restraint and precision, not by decoration.

**Key Characteristics:**

- Drenched near-black: the surface dominates; color appears only to signal meaning
- Single amber accent: reserved for findings, evidence, active investigation state
- Editorial typographic hierarchy: serif display + readable body + mono for data
- Flat by default: depth through tonal layering, not shadows
- No warmth by default: tinted neutrals trend toward cool, never cream or sand

## 2. Colors: The Lamplight Palette

The strategy is drenched noir. Near-black covers 60-80% of any rendered
surface. Amber-accent appears in under 10% of any screen -- its rarity is
the point. Redline is reserved for errors and critical-severity findings only.

### Primary

- **Deep Lamp Amber** (oklch(70% 0.15 65)): Active findings, evidence
  highlights, current investigation state. The one warm tone in the system.
  Used on text, borders, and glows that signal "this matters." Never decorative.

### Secondary

- **Caseline Red** (oklch(58% 0.18 30)): Errors, critical-confidence findings,
  blocked states. Distinct from amber; never used interchangeably. One role only.

### Neutral

- **Near-Black** (oklch(12% 0.012 55)): The body background. Dominant surface.
  Slightly warm-tinted to avoid pure terminal black; reads as "room" not "void."
- **Raised Surface** (oklch(17% 0.012 55)): Cards, containers, elevated panels.
  Tonal separation from near-black without a shadow.
- **Investigation Ink** (oklch(93% 0.006 55)): Primary text. Near-white with
  negligible warm tint. High contrast against near-black (>12:1).
- **Muted Evidence** (oklch(52% 0.008 55)): Secondary text, metadata, timestamps,
  closed-case labels. Never used for body copy that must be read.

### Named Rules

**The Lamplight Rule.** Amber appears only when something has earned attention:
a finding, an active state, a verified claim. Apply it to fewer than 10% of
any screen. The moment it decorates, it stops signaling.

**The No-Warmth Rule.** Tinted neutrals track toward cool, never warm. The
warm-neutral band (cream, sand, paper, linen) is the AI-assistant default of 2026. Any near-white background that reads as cream has broken this rule.

## 3. Typography

**Display Font:** [Instrument Serif or GT Sectra -- to be resolved at implementation]
**Body Font:** [Crimson Pro or iA Writer Quattro -- to be resolved at implementation]
**Mono Font:** Berkeley Mono (fallback: JetBrains Mono, monospace)

**Character:** The pairing should read like a case file from a serious
publication -- editorial gravitas in the headings, clean readability in the
body, unambiguous mono for evidence and code. Neither the display nor the body
font should feel "friendly." Instrument Serif's sharp angles or GT Sectra's
editorial authority both satisfy this. iA Writer Quattro is acceptable for a
mono-forward body; Crimson Pro for a more traditional serif approach.

### Hierarchy

- **Display** (400 weight, clamp(2rem, 5vw, 3.5rem), line-height 1.05,
  letter-spacing -0.02em): Case titles, report headings, investigation
  board headers. One per view. Never use for section labels.
- **Headline** (500-600 weight, ~1.5rem, line-height 1.2): Section
  titles within a case. Used when the section represents a distinct
  investigative phase.
- **Body** (400 weight, clamp(1rem, 1.5vw, 1.125rem), line-height 1.6,
  max-width 65-72ch): Skill output text, finding narratives, report prose.
  Line length cap is non-negotiable; long lines break reading under pressure.
- **Mono** (400 weight, 0.9em, line-height 1.5): Code, error strings,
  provenance IDs, timestamps, SPIFFE URIs, verify commands. Always
  Berkeley Mono or fallback; never substitute a proportional font for mono roles.
- **Label** (500 weight, 0.75rem, letter-spacing 0.06em, uppercase):
  Confidence badges (UNVERIFIED / CORROBORATED / VERIFIED), severity tags,
  phase markers. Uppercase with tracking only in this role.

### Named Rules

**The Mono Contract.** Provenance IDs, SPIFFE URIs, error strings, and verify
commands must always render in mono. Substituting a sans-serif for readability
breaks the evidence chain visually: the reader can no longer distinguish
"data to be run" from "prose to be read."

**The No-Eyebrow Rule.** No small-caps tracked labels above section headings
as structural scaffolding. Labels earn their place only when they signal
investigation state (VERIFIED, BLOCKED, CRITICAL). Decorative kickers are
the AI-scaffold tell.

## 4. Elevation

The system is flat by default. Near-black and Raised Surface provide all
needed depth through tonal contrast alone -- no box-shadow in the resting state
of any element. Shadows are a response to state, not a decoration.

### Shadow Vocabulary

- **Evidence Glow** (0 0 0 1px oklch(70% 0.15 65 / 0.6), 0 0 12px oklch(70%
  0.15 65 / 0.15)): Applied to the active finding or currently-pinned board
  node. Amber ring + ambient diffuse. One element at a time.
- **Raised Panel** (0 4px 16px oklch(0% 0 0 / 0.4)): Applied on hover to
  Raised Surface containers when they are interactive. Structural, not ambient.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. A shadow or glow
appears only as a direct response to state: active, hover, pinned. Any
decorative shadow that appears without user interaction has broken this rule.

## 5. Components

No components exist yet. Re-run `/impeccable document` once a UI surface is
implemented to capture the actual button, input, navigation, and board-node
patterns in this section.

## 6. Do's and Don'ts

### Do:

- **Do** use amber-accent exclusively to signal meaning: active findings,
  verified claims, current investigation focus. One amber element per screen
  at most.
- **Do** use Raised Surface (oklch(17% 0.012 55)) for container separation.
  No border, no shadow -- tonal contrast only at rest.
- **Do** render all provenance IDs, SPIFFE URIs, error strings, and verify
  commands in Berkeley Mono or fallback mono. The Mono Contract is non-negotiable.
- **Do** cap body text at 65-72ch. Investigation prose read under pressure
  demands tight line length.
- **Do** default to high-contrast dark mode (near-black body, ink text).
  WCAG 2.1 AA is the floor; aim for AAA on primary reading surfaces.
- **Do** treat the persona, board, and provenance as enhancements. If a UI
  layer is unavailable, the underlying skill output must still be readable
  and correctly structured.

### Don't:

- **Don't** use GitHub Copilot UI aesthetic: no warm blues, no rounded softness,
  no reassuring copy, no friendly AI-assistant tone in visual design choices.
- **Don't** accept lazy first-pass design answers. The first color or layout
  that comes to mind is the training-data reflex; question it.
- **Don't** use Obsidian-style glassmorphism or neon dark modes: no purple
  glows, no backdrop-filter cards used decoratively, no neon accent colors.
- **Don't** use SaaS landing-page warmth: no cream or sand backgrounds, no
  gradient CTAs, no identical card-grid layouts.
- **Don't** present a design decision as a finding without a re-runnable check.
  Every named rule in this system should be testable by inspection.
- **Don't** use border-left greater than 1px as a colored stripe on cards,
  alerts, or list items.
- **Don't** use gradient text (background-clip: text). One solid color only.
- **Don't** apply the amber accent decoratively. The Lamplight Rule is the
  entire point of the color system.
- **Don't** use warm-tinted near-white (the cream/sand/paper/linen band) as
  a background. The No-Warmth Rule applies to every surface including modals,
  drawers, and tooltips.
- **Don't** add uppercase tracked eyebrows above every section heading as
  scaffolding. The No-Eyebrow Rule prohibits it except for investigation-state
  labels.
