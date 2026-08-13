# Assets and Director Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a linked, editable asset library and AniKuku-inspired director workspace without claiming image/video generation before external APIs are configured.

**Architecture:** Extend the existing pure project mutation layer first, then render those mutations in the existing React page. Assets remain the shared source for shot bindings; the story board derives from the selected Clip's shots in real time.

**Tech Stack:** React, TypeScript, Vitest, Vite, lucide-react.

## Global Constraints

- Preserve original/imported locked-script flows and existing reference-image metadata.
- Every visible modification control writes project state and local storage.
- Do not call external image/video APIs; expose honest queued states only.
- Do not copy AniKuku brand assets, images, source code, or private API behavior.

---

### Task 1: Complete project mutation APIs

**Files:**
- Modify: `src/types.ts`
- Modify: `src/services/projectMutations.ts`
- Modify: `src/services/projectMutations.test.ts`

**Interfaces:**
- Produces `createClip`, `patchClip`, `removeClip`, `duplicateShot`, `moveShot`, `createShot`, and `setShotRenderStatus`.
- All returned projects keep version IDs and use `Shot.assetIds` as asset linkage.

- [ ] Write failing tests for clip creation/removal, shot duplication/reorder, and render status.
- [ ] Run `npm test -- projectMutations.test.ts` and observe missing mutation failures.
- [ ] Implement the smallest pure mutations, including deterministic IDs and safe unbinding on clip deletion.
- [ ] Run the focused tests and commit `feat: add studio project mutations`.

### Task 2: Build the editable asset workspace

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `npm test`

**Interfaces:**
- Consumes `Asset`, reference library, and `project.shots`.
- Produces interactive list/detail layout with create, edit, status, tags, reference image history, and linked-shot navigation.

- [ ] Add a failing service regression test that asset changes remain visible to linked shots.
- [ ] Implement asset filters, metadata form, generated-state button, linked-shot list, and reference image controls.
- [ ] Run tests and production build; commit `feat: complete linked asset workspace`.

### Task 3: Build Clip and shot operations in the director workspace

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/services/projectMutations.test.ts`

**Interfaces:**
- Consumes clip/shot mutations from Task 1 and current assets.
- Produces editable left Clip column, central shot cards, and structured shot editor matching the existing asset data types.

- [ ] Write a failing test for duplicate-shot and move-shot behavior.
- [ ] Implement add, rename, delete, duplicate, move, and inline edit controls.
- [ ] Verify with `npm test` and `npm run build`; commit `feat: add editable director studio`.

### Task 4: Add live storyboard and video request states

**Files:**
- Modify: `src/types.ts`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/services/projectMutations.test.ts`

**Interfaces:**
- Consumes selected Clip shots and their render state.
- Produces live storyboard cards plus honest queued image/video request buttons.

- [ ] Write failing test for per-shot render state mutation.
- [ ] Implement storyboard status cards and queued/needs-API buttons; no external request is sent.
- [ ] Run `npm test`, `npm run build`, and inspect the deployed-style local page; commit `feat: add live storyboard render states`.

### Task 5: Integrate and ship

**Files:**
- Modify: `README.md`

- [ ] Document which functions are local and which API hooks await configuration.
- [ ] Run final tests and production build.
- [ ] Merge to main, push to GitHub Pages, and verify deployed UI.

## Self-Review

- Tasks 1 and 3 cover every mutation control; Task 2 preserves manual assets; Task 4 treats image/video generation honestly; Task 5 provides deployment verification.
- No external API is required to validate or operate the workflow.
