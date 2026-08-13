# Studio Workflow Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the deployed animation studio prototype into a persistent, linked, and editable project workspace.

**Architecture:** Extract project mutations into a pure project service with undo snapshots, then connect focused page components to that state. Keep agent output as a structured project proposal so a future server API can replace the mock service.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, CSS.

## Global Constraints

- Retain original UI assets and visual language; do not copy the reference platform's brand or media.
- Keep data browser-local and preserve explicit reset-to-demo.
- Keep model credentials out of client code.
- Verify `npm test -- --run` and `npm run build` before deployment.

---

### Task 1: Project mutation service

**Files:**
- Create: `src/services/projectMutations.ts`, `src/services/projectMutations.test.ts`
- Modify: `src/types.ts`, `src/App.tsx`

- [ ] Write failing tests for `createShot(project, clipId)`, `removeAsset(project, assetId)`, and `bindAsset(project, shotId, assetId)`.
- [ ] Run `npm test -- --run`; confirm imports fail before implementation.
- [ ] Implement immutable mutations and typed `ProjectSnapshot` undo state.
- [ ] Run the test suite; confirm all mutation tests pass.

### Task 2: Script manuscript and Clip controls

**Files:**
- Modify: `src/App.tsx`, `src/styles.css`

- [ ] Add a failing DOM test proving a creator can switch to the manuscript and add a Clip.
- [ ] Run the test suite; confirm failure before UI work.
- [ ] Implement source/manuscript tabs, Clip add/rename/delete/reorder controls and shot list grouped by Clip.
- [ ] Run all tests; confirm the manuscript interaction passes.

### Task 3: Asset library operations

**Files:**
- Modify: `src/App.tsx`, `src/styles.css`

- [ ] Add a failing DOM test that creates an asset, binds it to a shot, then verifies the computed related count.
- [ ] Run the test suite; confirm failure before UI work.
- [ ] Implement asset creation modal, edit controls, delete confirmation, visible missing links and related-shot navigation state.
- [ ] Run all tests; confirm the asset behavior passes.

### Task 4: Director controls and live storyboard

**Files:**
- Modify: `src/App.tsx`, `src/styles.css`

- [ ] Add a failing DOM test that adds a shot and verifies a derived storyboard card appears.
- [ ] Run the test suite; confirm failure before UI work.
- [ ] Implement add/delete shot, framing selector, duration editing, asset multi-select binding and shot navigation.
- [ ] Run all tests; confirm director interaction passes.

### Task 5: Agent apply/undo and deployment

**Files:**
- Modify: `src/App.tsx`, `src/services/mockAgent.ts`, `src/styles.css`, `README.md`

- [ ] Add a failing test that applies an Agent proposal and restores the original project via undo.
- [ ] Run the test suite; confirm failure before implementation.
- [ ] Implement proposal impact view, apply action, one-level undo and saved toast.
- [ ] Run `npm test -- --run` and `npm run build`.
- [ ] Commit and push the verified update; confirm the GitHub Pages workflow starts.

## Plan Self-Review

Tasks 1–5 cover all approved script, asset, director, Agent, persistence and deployment requirements. The plan has no placeholders and uses the same project mutation interfaces from state through UI.
