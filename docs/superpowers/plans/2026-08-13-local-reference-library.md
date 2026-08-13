# 本地参考图资产库 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users upload, preview, preserve, replace and manage local reference images for each asset, with browser-authorized D-drive storage and a safe browser-only fallback.

**Architecture:** A `referenceLibrary` service owns path normalization, metadata changes and File System Access writes. React persists image metadata on assets and uses IndexedDB only for the selected root directory handle; the Assets UI supplies hover upload affordances, an upload dialog and reference history controls.

**Tech Stack:** React 18, TypeScript, Vitest, Vite, File System Access API, IndexedDB.

## Global Constraints

- Ask the user to authorize a D-drive root folder before direct file writes.
- Use Chinese folders: project / clip-or-全局资产 / asset type / asset name / 参考图.
- Do not overwrite prior uploads; use timestamped unique filenames.
- Do not generate images or delete the actual local file when the user removes an in-app reference.
- Accept PNG, JPG, JPEG and WEBP up to 50MB; use browser storage fallback if directory access is unavailable.

---

### Task 1: Test and implement reference-image metadata plus Chinese paths

**Files:**
- Create: `src/services/referenceLibrary.ts`
- Create: `src/services/referenceLibrary.test.ts`
- Modify: `src/types.ts`

- [ ] Write failing tests for `sanitizeFolderName('废弃/城市:街道')`, `buildReferencePath(...)`, and `addReferenceMetadata(...)`; assert Chinese nested folders, sanitized names, unique timestamp file name, and primary image selection.
- [ ] Run `& 'E:\新建文件夹 (2)\npm.cmd' test -- src/services/referenceLibrary.test.ts --run` and verify missing-module failure.
- [ ] Implement `ReferenceImage`, asset `referenceImages`, `sanitizeFolderName`, `buildReferencePath`, `addReferenceMetadata`, `setPrimaryReference` and `removeReferenceMetadata`.
- [ ] Re-run focused tests and commit with `feat: add reference image metadata service`.

### Task 2: Add directory authorization, writing and browser fallback adapters

**Files:**
- Modify: `src/services/referenceLibrary.ts`
- Modify: `src/services/referenceLibrary.test.ts`

- [ ] Write failing tests for `validateReferenceFile` rejecting a non-image and a file over 50MB.
- [ ] Implement feature detection, `showDirectoryPicker` authorization, nested directory creation, file write, and IndexedDB-backed fallback metadata; keep browser-specific calls behind guarded functions so Vitest can run.
- [ ] Re-run focused tests and commit with `feat: support local reference image storage`.

### Task 3: Build the asset hover upload and history interface

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] Add a failing service-level test proving that removing metadata does not mutate the provided local file name or request deletion.
- [ ] Add an asset-image hover overlay, hidden file input, modal drop target, selected D-drive folder setup action, upload progress/error state, and reference history actions for primary selection/removal.
- [ ] Use `URL.createObjectURL` to show same-session previews; add existing reference preview as asset hero background when one is primary.
- [ ] Run `& 'E:\新建文件夹 (2)\npm.cmd' test -- --run` and `& 'E:\新建文件夹 (2)\npm.cmd' run build`; commit with `feat: add local reference image upload UI`.
