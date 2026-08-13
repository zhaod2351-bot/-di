# Dual Script Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add original and manual-ChatGPT-import script routes that share one locked production version.

**Architecture:** Extend the existing script analysis domain with source mode and pure import parsing/prompt functions. Add two story page views under an expandable sidebar parent, then pass both valid analyses through the existing lock path.

**Tech Stack:** React, TypeScript, Vitest, Vite.

## Global Constraints

- Do not collect or store an OpenAI API key.
- Imported JSON must be validated before it changes project state.
- Both routes must use the identical lock operation and active script version ID.
- Run all tests and a production build before deployment.

---

### Task 1: Import domain service

**Files:**
- Modify: `src/types.ts`, `src/services/scriptAnalysis.ts`, `src/services/scriptAnalysis.test.ts`
- Create: `src/services/importedAnalysis.ts`, `src/services/importedAnalysis.test.ts`

- [ ] Write failing tests for prompt generation and JSON schema validation.
- [ ] Run `npm test -- --run` and confirm missing-module failure.
- [ ] Implement `buildChatGptPrompt(source, label)` and `parseImportedAnalysis(input)` returning the existing analysis type.
- [ ] Add `sourceMode` to version locking and test original/imported parity.
- [ ] Run all tests and verify domain behavior passes.

### Task 2: Two source workspaces

**Files:**
- Modify: `src/App.tsx`, `src/styles.css`

- [ ] Add a failing DOM test for source navigation and rejected malformed import.
- [ ] Run the test suite and confirm expected failure.
- [ ] Implement expandable sidebar, source-mode selection, prompt copy/manual fallback, import textarea, validation feedback and shared analysis preview.
- [ ] Show current source/version badge in asset and director headers.
- [ ] Run all tests and verify the dual route behavior passes.

### Task 3: Verification and deployment

**Files:**
- Modify: `README.md`

- [ ] Document the manual ChatGPT Plus workflow and JSON contract.
- [ ] Run `npm test -- --run` and `npm run build`.
- [ ] Commit and push; confirm GitHub Pages workflow starts.

## Plan Self-Review

Tasks cover navigation, validation, lock parity, version sourcing, documentation and deployment without exposing credentials or creating duplicate director data.
