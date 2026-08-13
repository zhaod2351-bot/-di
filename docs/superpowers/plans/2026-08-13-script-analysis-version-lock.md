# Script Analysis and Version Lock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement AI analysis preview and version locking for the episode source script.

**Architecture:** Add typed script version and analysis result fields to the browser-local project. A pure service returns deterministic analysis and applies lock/new-version transitions; the script screen renders draft, analysis review and locked states.

**Tech Stack:** React, TypeScript, Vitest, Vite.

## Global Constraints

- The source script is editable only while draft.
- Locking creates downstream project data only after explicit confirmation.
- Production Agent access remains server-side; this release only simulates its structured response.
- Run all tests and a production build before push.

---

### Task 1: Version domain and analysis service

**Files:**
- Modify: `src/types.ts`, `src/data/demoProject.ts`
- Create: `src/services/scriptAnalysis.ts`, `src/services/scriptAnalysis.test.ts`

- [ ] Add failing tests that analyze non-empty text, reject empty text, lock a result and create a new draft version.
- [ ] Run `npm test -- --run` and verify missing-service failure.
- [ ] Implement typed version data, simulated extraction and immutable lock/new-version transitions.
- [ ] Run tests and verify transitions pass.

### Task 2: Script screen states

**Files:**
- Modify: `src/App.tsx`, `src/styles.css`

- [ ] Add a failing DOM test for the draft analysis button and locked read-only source state.
- [ ] Run tests and verify failure before UI work.
- [ ] Implement analysis launch, review drawer, confirm lock dialog, lock badge, disabled source editor and create-new-version path.
- [ ] Run all tests and verify the script screen behavior.

### Task 3: Integration and deployment

**Files:**
- Modify: `README.md`

- [ ] Run `npm test -- --run` and `npm run build`.
- [ ] Commit and push the implementation; confirm the Pages workflow is triggered.

## Plan Self-Review

The three tasks cover typed data, state transitions, user confirmation, locked immutability and deployed verification without including credentials or real model calls.
