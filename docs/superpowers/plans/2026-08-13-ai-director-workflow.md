# AI 导演台工作流 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate an editable polished script, multiple dramatic Clips and action-rich shots from a locked script, with inline pencil editing and real-time storyboard updates.

**Architecture:** Expand the director generator into a pure `DirectorPlan` builder. It outputs polished text, story beats, clips and 3–6 shots per clip; applying the plan replaces only current-version director data. Extend shots with camera movement, actions and structured audio entries. React renders compact cards until their pencil is clicked, then reveals the full inline editor.

**Tech Stack:** React 18, TypeScript, Vitest, Vite.

## Global Constraints

- Keep original source, locked script version and asset reference images unchanged.
- Replace only current-version clips/shots; all generated output remains editable.
- Asset generation remains name-only/manual-completion; no image generation.
- Storyboard renders stored shot data and updates when a shot changes.

---

### Task 1: Create structured AI director plan generator

**Files:**
- Modify: `src/types.ts`
- Modify: `src/services/directorGeneration.ts`
- Modify: `src/services/directorGeneration.test.ts`

- [ ] Write failing tests expecting `createDirectorPlan` to output a polished script, at least three Clips, at least three shots per Clip, and each shot to include `cameraMove`, `action`, and non-empty structured `audioItems`.
- [ ] Run `& 'E:\新建文件夹 (2)\npm.cmd' test -- src/services/directorGeneration.test.ts --run` and verify the missing function failure.
- [ ] Add `AudioItem`, `DirectorPlan`, shot fields, deterministic beat rules, and `applyDirectorPlan` preserving existing asset metadata/reference images.
- [ ] Re-run focused tests and commit with `feat: generate AI director plan`.

### Task 2: Add immutable shot/audio editing mutations

**Files:**
- Modify: `src/services/projectMutations.ts`
- Modify: `src/services/projectMutations.test.ts`

- [ ] Write failing tests for adding/removing audio items and patching action/camera fields without modifying unrelated shots.
- [ ] Run focused mutation test and verify failures.
- [ ] Implement `patchShot`, `addAudioItem`, and `removeAudioItem`.
- [ ] Re-run tests and commit with `feat: support structured shot editing`.

### Task 3: Replace director UI with compact and inline-expanded cards

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] Add card-local pencil state. Compact cards show summary; pencil opens the same card’s scene, camera movement, action, duration, audio-item, and asset-binding editor.
- [ ] Add `AI 润色并生成导演台` that calls `createDirectorPlan` and immediately applies it to the current locked version.
- [ ] Render polished script and beat summary in the Clip list; render camera/action/audio in storyboard cards.
- [ ] Run full test suite and production build, then commit with `feat: add inline director shot editor`.
