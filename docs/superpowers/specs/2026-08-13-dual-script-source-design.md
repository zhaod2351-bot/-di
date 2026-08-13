# Dual Script Source Design

## Goal

Offer two script creation routes under one expandable **故事与剧本** navigation group: **原创剧本** for writing inside SceneWeaver and **导入式剧本** for bringing structured ChatGPT Plus output back into SceneWeaver. Both routes produce exactly one active locked script version that drives assets, director shots and storyboards.

## Navigation

The sidebar replaces the single story page button with a parent item and two indented children. Selecting 原创剧本 opens the existing source editor. Selecting 导入式剧本 opens a three-step import workspace. The selected child is visually active, while the parent remains expanded during either workflow.

## Import workflow

1. The import workspace creates a version-specific prompt that includes the episode identifier, script text and the exact JSON schema.
2. **复制分析提示词** copies that prompt using the browser clipboard API, with a manual selectable fallback.
3. The user pastes JSON into a textarea. Client validation requires `summary`, `characters`, `scenes`, `props`, and `warnings`, with strings/string arrays only. Invalid JSON reports the broken field without changing project state.
4. Valid content opens the same analysis preview used by the original route. **确认并锁定剧本** calls the same lock transition, creating a shared version origin of `imported` rather than `original`.

## Shared production chain

`ScriptVersion` gains `sourceMode: original | imported`. It remains the canonical ID stored on assets, clips and shots. Director and asset screens show a compact source/version badge and filter production data to the active locked version when such version data exists. They do not have separate import-specific data structures.

Creating a new version from a locked script keeps the source mode but returns it to draft. Importing a replacement while locked creates a new draft import version and leaves the previous locked production set untouched.

## Security and future API

No API key is needed or accepted in this release. Import uses ChatGPT Plus manually. A later server Agent can populate the same validated import structure, replacing only the transport—not the editor, preview, lock or director contracts.

## Verification

Tests cover schema validation, generated prompt content, both source modes reaching the same lock transition, and locked director data carrying the active version ID. Run the full suite and production build before pushing to GitHub Pages.
