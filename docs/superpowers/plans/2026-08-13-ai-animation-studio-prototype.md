# AI Animation Studio Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clickable React prototype that links script writing, reusable assets, and a director’s shot workspace.

**Architecture:** A Vite React TypeScript SPA holds one project state in a React context and persists it to localStorage. Page modules render the three workspaces while a mock Agent service returns explicit structured updates that use the same client-side application path a future server API will use.

**Tech Stack:** Vite, React, TypeScript, lucide-react, CSS variables, Vitest, React Testing Library.

## Global Constraints

- Use original branding, copy, CSS and generated placeholders; do not copy AniKuku assets, logo, or text.
- Keep project data local-only for this prototype and provide a reset-to-demo action.
- Do not expose model credentials in browser code; represent future model integration through a service boundary only.
- Verify the production build with `npm run build` before delivery.

---

## File Structure

- `package.json`: development, test and production scripts.
- `src/types.ts`: shared project, asset, clip, shot and Agent result interfaces.
- `src/data/demoProject.ts`: original demo project content.
- `src/store/ProjectContext.tsx`: persistent project state and mutation actions.
- `src/services/mockAgent.ts`: deterministic Agent suggestions returning state patches.
- `src/components/AppShell.tsx`: sidebar, project header and global status.
- `src/components/AgentPanel.tsx`: conversational Agent actions and apply flow.
- `src/pages/ScriptPage.tsx`: editable script and generated shot manuscript.
- `src/pages/AssetsPage.tsx`: resource library, editing and related-shot details.
- `src/pages/DirectorPage.tsx`: clip list, editable shot cards and live storyboard.
- `src/styles.css`: the original visual system and responsive layout.
- `src/App.tsx`, `src/main.tsx`: routing and application bootstrap.
- `src/store/ProjectContext.test.tsx`, `src/services/mockAgent.test.ts`: state and Agent behavior coverage.

### Task 1: Scaffold and shared domain model

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/types.ts`, `src/data/demoProject.ts`
- Test: `src/services/mockAgent.test.ts`

**Interfaces:**
- Produces `Project`, `Asset`, `Clip`, `Shot`, `AssetType`, and `AgentAction` exported by `src/types.ts`.

- [ ] **Step 1: Add a failing mock Agent test**

```ts
import { describe, expect, it } from 'vitest';
import { proposeAgentChange } from './mockAgent';
import { demoProject } from '../data/demoProject';

describe('proposeAgentChange', () => {
  it('returns a script storyboard proposal with at least one change', () => {
    expect(proposeAgentChange('storyboard', demoProject).changes.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run `npm test -- --run` and verify it fails because the module does not exist.**
- [ ] **Step 3: Create the Vite application and domain types with a complete demo project.**
- [ ] **Step 4: Run `npm run build` and confirm TypeScript compiles.**

### Task 2: Persistent project state and deterministic Agent service

**Files:**
- Create: `src/store/ProjectContext.tsx`, `src/services/mockAgent.ts`
- Modify: `src/App.tsx`, `src/services/mockAgent.test.ts`
- Test: `src/store/ProjectContext.test.tsx`, `src/services/mockAgent.test.ts`

**Interfaces:**
- Consumes `Project` from `src/types.ts` and `demoProject` from `src/data/demoProject.ts`.
- Produces `useProject(): { project, updateScript, updateAsset, updateShot, applyAgentChange, resetDemo }`.

- [ ] **Step 1: Add a failing provider test that updates one shot and asserts its new duration appears in state.**
- [ ] **Step 2: Run `npm test -- --run` and verify the provider test fails.**
- [ ] **Step 3: Implement the immutable state actions and localStorage hydration/persistence.**
- [ ] **Step 4: Implement `proposeAgentChange` for storyboard, asset extraction, character consistency and prompt enhancement actions.**
- [ ] **Step 5: Run `npm test -- --run` and confirm all state and service tests pass.**

### Task 3: Shared shell and script workspace

**Files:**
- Create: `src/components/AppShell.tsx`, `src/pages/ScriptPage.tsx`
- Modify: `src/App.tsx`, `src/styles.css`

**Interfaces:**
- Consumes `useProject()` and page identifier `script | assets | director`.
- Produces sidebar navigation and editable script view.

- [ ] **Step 1: Add a failing DOM test that renders the shell and finds “故事与剧本”.**
- [ ] **Step 2: Run `npm test -- --run` and verify the test fails.**
- [ ] **Step 3: Implement navigation, project breadcrumbs, save indicator, original project branding and the script view.**
- [ ] **Step 4: Run `npm test -- --run` and confirm the test passes.**

### Task 4: Linked asset library

**Files:**
- Create: `src/pages/AssetsPage.tsx`
- Modify: `src/App.tsx`, `src/styles.css`

**Interfaces:**
- Consumes `project.assets`, `project.shots`, `updateAsset()`.
- Produces editable asset cards and a detail panel with computed related-shot count.

- [ ] **Step 1: Add a failing DOM test that selects an asset and asserts its related-shot count.**
- [ ] **Step 2: Run `npm test -- --run` and verify the test fails.**
- [ ] **Step 3: Implement asset-type filtering, search, selection, editable description/tags and related shot list.**
- [ ] **Step 4: Run `npm test -- --run` and confirm the test passes.**

### Task 5: Director workspace and live storyboard

**Files:**
- Create: `src/pages/DirectorPage.tsx`
- Modify: `src/App.tsx`, `src/styles.css`

**Interfaces:**
- Consumes `project.clips`, `project.shots`, `project.assets`, `updateShot()`.
- Produces three-column clip/shot/storyboard editor.

- [ ] **Step 1: Add a failing DOM test that edits a shot duration and checks the storyboard duration updates.**
- [ ] **Step 2: Run `npm test -- --run` and verify the test fails.**
- [ ] **Step 3: Implement clip selection, shot cards, asset chips, shot controls, computed storyboard cards and empty states.**
- [ ] **Step 4: Run `npm test -- --run` and confirm the test passes.**

### Task 6: Agent panel, visual QA and delivery preparation

**Files:**
- Create: `src/components/AgentPanel.tsx`, `README.md`
- Modify: `src/App.tsx`, `src/styles.css`

**Interfaces:**
- Consumes `proposeAgentChange()` and `applyAgentChange()`.
- Produces a processing, preview and apply experience that updates linked project state.

- [ ] **Step 1: Add a failing DOM test that runs “强化故事板” and shows a change preview.**
- [ ] **Step 2: Run `npm test -- --run` and verify the test fails.**
- [ ] **Step 3: Implement the Agent prompt drawer, action chips, loading state, proposal preview and apply button.**
- [ ] **Step 4: Add README run instructions and API integration boundary notes.**
- [ ] **Step 5: Run `npm test -- --run` and `npm run build`; inspect the rendered application at desktop width; fix visual or runtime issues found.**

## Plan Self-Review

- Spec coverage: Tasks 1–2 provide demo data, persistence and Agent boundary; Tasks 3–5 implement the three linked workspaces; Task 6 covers the Agent interaction, documentation and final verification.
- Placeholder scan: no deferred implementation markers or unspecified interfaces are present.
- Type consistency: all page work consumes the project actions introduced by Task 2, and Agent changes flow through `applyAgentChange` in Task 6.
