# Asset Studio Visual Specification

## Goal

Make SceneWeaver's Design & Assets screen visually comparable in hierarchy and production density to a professional animation asset studio, without copying third-party code, assets, trademarks, or wording.

## Scope

- Preserve all current asset creation, editing, reference-image, readiness, variant, related-shot, and deletion behavior.
- Rework the desktop visual system: 40px project/header rail, 92px asset type toolbar, 370px asset browser, and a responsive asset detail canvas.
- Standardize the typography: 30px detail title, 18px section title, 15px body, 13px metadata, and 12px status tags.
- Standardize controls: 42px search/input height, 38px secondary button height, 42px primary button height, 8px control radius, 12px card radius, 1px warm-gray borders.
- Add visual states for selected assets, hoverable reference-image replacement, selected type tabs, selected overview/related tabs, and ready-state badges.

## Non-goals

- No external model API, remote backend, collaboration, or generation implementation.
- No third-party branding, copied icons, copied images, or copied source code.

## Component Plan

`Assets` in `src/App.tsx` continues to own the data interactions. `src/styles.css` gains scoped rules for the asset studio only. Existing responsive rules remain, with the desktop browser collapsing below 1080px and stacking on mobile.

## Verification

- Existing unit tests stay green.
- Production build succeeds.
- Manually confirm all existing buttons remain reachable in desktop and mobile layouts.
