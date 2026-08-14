# Asset Studio Visual Specification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align SceneWeaver's asset studio visual hierarchy and control dimensions with the approved professional studio specification while preserving asset behavior.

**Architecture:** Keep the existing `Assets` component and data mutations unchanged. Apply a scoped desktop-first visual layer in `src/styles.css`, using existing semantic classes. Add no new dependency and no network request.

**Tech Stack:** React, TypeScript, CSS, Vite, Vitest.

## Global Constraints

- Preserve existing asset, shot, reference-image and variant data behavior.
- Do not copy third-party source code, branding, icons, or images.
- Desktop controls use 42px inputs, 38px secondary buttons, 42px primary buttons, 8px control radius and 12px cards.
- Verify existing tests and a production build before publishing.

---

### Task 1: Add asset-studio visual tokens and layout rules

**Files:**
- Modify: `src/styles.css`
- Test: existing `src/services/*.test.ts`

**Interfaces:**
- Consumes: Existing `.asset-layout`, `.asset-list`, `.asset-detail`, `.asset-card`, `.asset-image-upload`, `.asset-tabs`, and `.asset-form` classes.
- Produces: Responsive visual layout without changing React props or project state.

- [ ] **Step 1: Add a failing visual-contract test note**

Document that the existing test suite does not exercise computed CSS, and retain behavior tests as the regression contract.

- [ ] **Step 2: Run the behavior suite before visual changes**

Run: `& 'E:\新建文件夹 (2)\npm.cmd' test -- --run`

Expected: all existing source tests pass.

- [ ] **Step 3: Implement scoped visual rules**

Add `src/styles.css` rules that set the desktop rail dimensions, type-toolbar rhythm, 370px asset browser, 42px search field, selected-card border, 30px detail title, 300px reference image, 12px panel radius, and responsive fallbacks.

- [ ] **Step 4: Run the behavior suite after visual changes**

Run: `& 'E:\新建文件夹 (2)\npm.cmd' test -- --run`

Expected: all existing source tests pass.

- [ ] **Step 5: Build the production bundle**

Run: `& 'E:\新建文件夹 (2)\npm.cmd' run build`

Expected: Vite production build exits successfully.

- [ ] **Step 6: Commit**

Run:

```powershell
& $git add src/styles.css docs/superpowers
& $git commit -m "style: refine asset studio visual system"
```
