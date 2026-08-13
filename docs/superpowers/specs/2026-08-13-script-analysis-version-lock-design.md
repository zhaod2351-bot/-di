# Script Analysis and Version Lock Design

## Goal

Make episode script `1-1` the single source of truth for assets, shots, storyboards and the director workspace. A creator edits the source script, runs AI analysis, reviews a structured result, then locks the version before downstream production begins.

## Data model

The project gains `scriptVersion` data: `id`, `label`, `status` (`draft | analyzing | ready | locked`), source text, analysis timestamp and an immutable analysis result. The result contains detected characters, scenes, props, narrative summary, warnings and a generated Clip/shot draft.

Assets and shots retain `scriptVersionId`. Current director and asset pages show only items originating from the active locked version. This makes origin traceable and prevents hidden mismatches.

## Creator workflow

1. In draft status, the source script is editable and the primary control is **AI 剧本分析**.
2. Analysis opens a review panel showing identified characters, scenes, props, narrative breakdown and proposed clips/shots. In the prototype, the Agent provides deterministic simulated output; production will call a server-side Agent.
3. **确认并锁定剧本** writes the analysis result, creates or refreshes the version's assets and shot draft, and changes status to locked. The source editor becomes read-only and the status is visible at all times.
4. **解锁并创建新版本** never overwrites the locked source. It clones the source into the next version (for example `1-1 v2`), puts it in draft state, and warns that downstream data must be regenerated after the next lock. Older locked data remains recoverable.

## Guardrails

- Analysis cannot start on an empty script.
- Confirmation is required only for locking or creating a new version; routine editing does not require confirmation.
- Assets/shots are not partially updated while a proposal is merely previewed.
- A lock event is reversible with the app's undo control for the current session.

## Verification

Test script analysis state transitions, lock application creating linked resources, source immutability while locked, and new-version creation preserving prior version data. Run all tests and a production build before push; deploy with GitHub Pages.
