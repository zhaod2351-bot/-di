# 剧本到导演工作室 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Locking a script generates version-linked placeholder assets and editable director clips/shots, with a preview-and-confirm reanalysis flow.

**Architecture:** A dedicated `directorGeneration` service transforms `ScriptAnalysis` into manual-completion assets, clips, and shots for exactly one locked `ScriptVersion`. The lock action uses this service; the Director UI shows its generated data and permits explicit reanalysis replacement without changing the locked script.

**Tech Stack:** React 18, TypeScript, Vitest, Vite.

## Global Constraints

- Do not generate images, three-view sheets, reference images, or visual descriptions.
- Generated asset cards are `待完善`, with an empty description and locked script version ID.
- Original and imported flows use the same generation service.
- Reanalysis only replaces the current version's assets, clips and shots; it preserves the script and analysis.

---

### Task 1: Generate manual-completion assets and director data

**Files:**
- Create: `src/services/directorGeneration.ts`
- Create: `src/services/directorGeneration.test.ts`
- Modify: `src/types.ts`

- [ ] Write a failing Vitest case that calls `generateDirectorData` using one character, one scene and one prop, and expects three `待完善` assets with empty descriptions plus version-linked, asset-bound shots.
- [ ] Run `& 'E:\新建文件夹 (2)\npm.cmd' test -- src/services/directorGeneration.test.ts --run` and verify the missing-module failure.
- [ ] Implement `generateDirectorData(analysis, version)` and `applyDirectorGeneration(project, data)` with deterministic placeholder assets, at least two clips/shots, and safe current-version replacement.
- [ ] Re-run the focused test and commit the service and types with `feat: generate director data from locked script`.

### Task 2: Generate data when the script is locked

**Files:**
- Modify: `src/services/scriptAnalysis.ts`
- Modify: `src/services/scriptAnalysis.test.ts`

- [ ] Write a failing test that locks an analysis and expects all generated assets and shots to reference the resulting script version.
- [ ] Run the focused test and verify the current lock implementation only relabels demo data.
- [ ] Make `lockVersion` construct the version, generate its data and apply it to the project.
- [ ] Re-run the focused test and commit with `feat: populate director studio when locking script`.

### Task 3: Surface generated data and safe reanalysis in the UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] Extend the service test with a failing case proving `applyDirectorGeneration` preserves the locked source while replacing current-version downstream data.
- [ ] Add `待完善` labels in Assets and a Director `重新分析镜头` preview showing generated counts, with a separate `确认覆盖导演台` action.
- [ ] Keep storyboards derived from the stored shot list so edits remain immediate.
- [ ] Run `& 'E:\新建文件夹 (2)\npm.cmd' test -- --run` and `& 'E:\新建文件夹 (2)\npm.cmd' run build`; commit UI work with `feat: add director reanalysis preview`.
