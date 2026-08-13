# Imported Director Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let creators paste a complete ChatGPT-produced director-plan JSON into the imported-script page and use it verbatim to create an editable locked script version, assets, clips, shots, audio, and storyboard.

**Architecture:** Add a focused parser/validator for the complete import payload and a pure projector that translates its validated data into the existing project model. The imported path creates a locked version without invoking the local mock shot-splitting rules, while reusing matching asset reference-image metadata. The React import screen will copy a complete prompt, preview the plan, and only apply it after confirmation.

**Tech Stack:** React, TypeScript, Vitest, Vite.

## Global Constraints

- The original text in `project.script` must remain unchanged.
- Imported clips, shots, camera moves, actions, audio, and asset bindings must be preserved; no secondary automatic splitting is allowed.
- Imported content remains editable through the existing director-studio editors.
- Matching existing asset reference images and user-entered metadata must not be overwritten.
- Accept only raw JSON, not Markdown code fences.
- Keep the existing local AI director-generation workflow unchanged.

---

### Task 1: Parse and validate complete imported director plans

**Files:**
- Create: `src/services/importedDirectorPlan.ts`
- Create: `src/services/importedDirectorPlan.test.ts`
- Modify: `src/types.ts`

**Interfaces:**
- Produces: `ImportedDirectorPlan`, `buildImportedDirectorPrompt(source: string, label: string): string`, and `parseImportedDirectorPlan(input: string): ImportedDirectorPlan`.
- `ImportedDirectorPlan` contains `polishedScript`, `analysis`, and an ordered `clips` list where every clip has ordered editable shots.

- [ ] **Step 1: Write failing parser tests**

```ts
expect(parseImportedDirectorPlan(JSON.stringify(validPlan))).toMatchObject({
  polishedScript: '润色后的剧本',
  clips: [{ title: 'Clip 01', shots: [{ title: '建立环境', duration: 5 }]}],
});
expect(() => parseImportedDirectorPlan('{"polishedScript":"x"}')).toThrow('clips');
expect(() => parseImportedDirectorPlan(JSON.stringify(invalidDurationPlan))).toThrow('duration');
```

- [ ] **Step 2: Run the parser test to verify it fails**

Run: `npm test -- importedDirectorPlan.test.ts`

Expected: FAIL because the imported-director-plan module does not exist.

- [ ] **Step 3: Implement the strict JSON parser and prompt builder**

```ts
export function parseImportedDirectorPlan(input: string): ImportedDirectorPlan {
  const value = JSON.parse(input) as unknown;
  // validate polishedScript, analysis, clips, shots, positive duration,
  // shot asset names, and structured audio before returning typed data.
}
```

The prompt must request only JSON with `polishedScript`, `analysis`, `clips`, each shot's `title`, `size`, `duration`, `visual`, `cameraMove`, `action`, `assets`, and `audioItems`.

- [ ] **Step 4: Run the parser test to verify it passes**

Run: `npm test -- importedDirectorPlan.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit parser work**

```bash
git add src/types.ts src/services/importedDirectorPlan.ts src/services/importedDirectorPlan.test.ts
git commit -m "feat: parse imported director plans"
```

### Task 2: Project complete imported plans without automatic re-splitting

**Files:**
- Modify: `src/services/scriptAnalysis.ts`
- Modify: `src/services/importedDirectorPlan.ts`
- Modify: `src/services/importedDirectorPlan.test.ts`

**Interfaces:**
- Produces: `createLockedVersion(project, analysis, sourceMode, polishedScript?)` and `applyImportedDirectorPlan(project, version, plan): Project`.
- Consumes: `ImportedDirectorPlan` from Task 1 and the existing project/asset/shot model.

- [ ] **Step 1: Write failing projection tests**

```ts
const version = createLockedVersion(project, plan.analysis, 'imported', plan.polishedScript);
const result = applyImportedDirectorPlan({ ...project, scriptVersion: version }, version, plan);
expect(result.clips).toHaveLength(1);
expect(result.shots[0]).toMatchObject({ cameraMove: '缓慢推进', action: '苏林停步观察' });
expect(result.assets.find((asset) => asset.name === '苏林')?.referenceImages).toEqual(existingImages);
```

- [ ] **Step 2: Run the projection test to verify it fails**

Run: `npm test -- importedDirectorPlan.test.ts`

Expected: FAIL because version construction and direct projection are not available.

- [ ] **Step 3: Implement version construction and direct model projection**

```ts
export function createLockedVersion(/* ... */): ScriptVersion { /* retain project.script and store polishedScript separately */ }
export function applyImportedDirectorPlan(/* ... */): Project { /* preserve validated clip/shot order and matching asset fields */ }
```

For a matching type/name asset, copy the existing description, tags, status, colour, and `referenceImages` into the imported-version asset. For a name only mentioned by a shot, create a `道具` placeholder so every binding remains editable.

- [ ] **Step 4: Run the projection test to verify it passes**

Run: `npm test -- importedDirectorPlan.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit projection work**

```bash
git add src/services/scriptAnalysis.ts src/services/importedDirectorPlan.ts src/services/importedDirectorPlan.test.ts
git commit -m "feat: apply imported director plans"
```

### Task 3: Connect the imported-script interface to the complete-plan flow

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Test: `npm test`

**Interfaces:**
- Consumes: `buildImportedDirectorPrompt`, `parseImportedDirectorPlan`, `createLockedVersion`, and `applyImportedDirectorPlan`.
- Produces: an import-preview modal that confirms counts, polished script, assets, and the destination version before applying the exact plan.

- [ ] **Step 1: Add a UI-focused failing test or compile-time import use**

```ts
// The imported page must call parseImportedDirectorPlan rather than parseImportedAnalysis.
// Confirm the project is committed only after the preview confirmation callback.
```

- [ ] **Step 2: Run the affected test suite to confirm the current UI lacks the new flow**

Run: `npm test`

Expected: existing UI does not contain the complete-plan import behavior.

- [ ] **Step 3: Implement the import form and confirmation preview**

```tsx
const plan = parseImportedDirectorPlan(input);
const version = createLockedVersion(project, plan.analysis, 'imported', plan.polishedScript);
commit(applyImportedDirectorPlan({ ...project, scriptVersion: version }, version, plan), '已导入完整导演台并锁定剧本');
```

Replace the old analysis-only import copy with a full-plan prompt. The preview must state that the original manuscript is retained, no re-splitting is performed, and the director studio remains editable.

- [ ] **Step 4: Run all tests and production build**

Run: `npm test; npm run build`

Expected: all tests pass and Vite completes a production build.

- [ ] **Step 5: Commit UI work**

```bash
git add src/App.tsx src/App.css
git commit -m "feat: import complete ChatGPT director plans"
```

### Task 4: Verify both workflows remain usable

**Files:**
- Modify: `src/App.tsx`
- Test: `src/services/importedDirectorPlan.test.ts`

**Interfaces:**
- Consumes: direct import projection and existing local director generation.
- Produces: imported polished text shown in the director header while the local AI button continues to generate editable material.

- [ ] **Step 1: Add a failing regression assertion for preserved polished script**

```ts
expect(result.scriptVersion?.polishedScript).toBe('润色后的剧本');
```

- [ ] **Step 2: Run the regression test to verify it fails**

Run: `npm test -- importedDirectorPlan.test.ts`

Expected: FAIL until the version type keeps the imported polished script.

- [ ] **Step 3: Store and render the polished-script field**

```ts
type ScriptVersion = { /* existing fields */ polishedScript?: string };
```

Render `scriptVersion.polishedScript` in the director view when available, with existing generated fallback text for local AI plans.

- [ ] **Step 4: Run final verification**

Run: `npm test; npm run build`

Expected: all tests pass and the production bundle builds.

- [ ] **Step 5: Commit verification-ready changes**

```bash
git add src/types.ts src/App.tsx src/services/importedDirectorPlan.test.ts
git commit -m "fix: retain imported polished script"
```

## Self-Review

- Spec coverage: Tasks 1-2 prevent local rule re-splitting and preserve full imported data; Task 2 preserves local image-reference metadata; Task 3 provides prompt, raw JSON validation, preview, lock, and apply; Task 4 ensures editable downstream display and preserves the existing local path.
- Placeholder scan: no TODO or future-work placeholders are present.
- Type consistency: parser produces `ImportedDirectorPlan`; projection consumes it and returns `Project`; the UI uses the same functions and commits the returned project.

## Execution Handoff

Plan saved to `docs/superpowers/plans/2026-08-13-imported-director-plan.md`. Execute inline in this session using `superpowers:executing-plans` with an isolated worktree.
