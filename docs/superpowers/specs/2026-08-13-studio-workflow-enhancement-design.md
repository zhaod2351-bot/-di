# Studio Workflow Enhancement Design

## Goal

Upgrade the deployed SceneWeaver prototype into a fully clickable, locally persistent production workspace. The user can create and edit Clips, shots, and assets; bind them across pages; inspect the storyboard; and apply or undo simulated Agent proposals.

## Workflow

The script page has a true source/manuscript switch. Its manuscript view groups editable shots by Clip. Creators can create, rename, reorder, and delete Clips, and create or delete shots within a Clip.

The asset page supports type filters, search, creation, selection, editing, tag updates, and deletion. A resource details view computes the shots that use it and supports jumping into the linked clip/shot in the director workspace. Removing an asset leaves a visible missing-reference chip in shots rather than deleting those links silently.

The director workspace is the main production surface. It supports clip selection, shot creation/deletion, inline edits to visual, audio, duration and framing, and multi-select asset binding. The storyboard is always derived from its selected Clip's current shots.

## State and safety

All mutable project data remains in localStorage. State mutations write an undo snapshot before applying. The shell exposes undo and a clear saved-state indicator; destructive actions use a local confirmation dialog. A reset-to-demo action stays available.

Agent actions generate a structured proposal and show its exact affected items. Applying uses the same mutation path as editing; undo restores the pre-application snapshot. The future server-side Agent API continues to return the same proposal shape, so browser code never receives model credentials.

## Visual language

Retain the current original warm-paper studio style, fixed production sidebar and editor cards. Increase information density only in director/manuscript views, while preserving strong section hierarchy and responsive fallback.

## Verification

Automated tests cover clip/shot creation, asset binding/deletion behavior, Agent proposal apply/undo and persistence helpers. Final verification runs all tests and a production build, then deploys through the existing GitHub Pages workflow.
