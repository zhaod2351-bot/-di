# Asset Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended) or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Let assets maintain reference-backed variants that are selectable per director shot.

**Architecture:** Extend asset and shot data with small persisted variant records. Use mutation helpers for creation, selection and safe deletion; render selectors in assets and Director.

**Tech Stack:** React, TypeScript, Vitest, Vite.

### Task 1: Variant data and safety

- [ ] Write failing mutation tests for creation, selection and deletion fallback.
- [ ] Add AssetVariant and per-shot variant map types.
- [ ] Implement pure mutation helpers and validate the focused suite.

### Task 2: Asset and director UI

- [ ] Show the variant list, add/edit/delete controls and reference upload in asset details.
- [ ] Add selected-variant controls to each shot editor and surface selection in storyboard cards.
- [ ] Run full tests and production build, then publish.
