# Asset Detail Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add derived asset readiness, production status controls, complete related-shot statistics, and director deep links.

**Architecture:** Put readiness and safe asset deletion in project mutations so UI and tests use the same behavior. Pass a director navigation target from App to Assets and consume it in Director state.

**Tech Stack:** React, TypeScript, Vitest, Vite.

## Global Constraints

- Preserve existing browser-stored project data.
- Do not add external dependencies.
- Keep original-platform labels “已完成” and “关联镜头”.

---

### Task 1: Asset readiness domain behavior

**Files:**
- Modify: `src/types.ts`
- Modify: `src/services/projectMutations.ts`
- Test: `src/services/projectMutations.test.ts`

- [ ] Add failing readiness and delete-unbind tests.
- [ ] Implement readiness derivation and safe removal.
- [ ] Run focused Vitest tests.

### Task 2: Asset detail and director handoff

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] Render status/summary/related-shot cards and manual status control.
- [ ] Send selected clip/shot navigation target to Director.
- [ ] Run full test suite and production build.
