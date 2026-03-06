# QA Bug Report — Battle Visualizer

## Bugs Found

### Bug 1: Presentation Mode doesn't hide UI panels — FIXED
**Severity:** High
**Fix:** Conditionally hide all UI panels in BattleClient.tsx when `isPresentationMode` is true. Moved PresentationMode component from inside BattleMap to BattleClient so it renders as a proper top-level overlay.

### Bug 2: Presentation Mode doesn't auto-advance stages — FIXED
**Severity:** High
**Fix:** Rewrote PresentationMode timer logic to use separate refs for phase timers vs stage timers, preventing cross-effect cleanup interference. Used direct `setTimeout` instead of shared `useCallback` helpers.

### Bug 3: Casualties panel clipped by viewport bottom — FIXED
**Severity:** Medium
**Fix:** Moved Casualties panel from `bottom-4 right-4` to `top-10 right-2` so it grows downward from the top-right. Added `max-h-[calc(100vh-120px)]` with overflow scroll as safety.

### Bug 4: Legend panel overlaps Casualties panel — FIXED
**Severity:** Low
**Fix:** Resolved by moving Casualties to `top-10 right-2` (below Legend button at `top-2 right-2`). The Legend dropdown panel at `top-8 right-2` may still slightly overlap, but this is acceptable since Legend is a toggleable overlay.

### Bug 5: Dead code — SitRepPanel.tsx still on disk — FIXED
**Severity:** Low (housekeeping)
**Fix:** Deleted `src/components/panels/SitRepPanel.tsx`.

### Bug 6: "Click for battle overview" hint in header
**Severity:** Low (cosmetic) — NOT FIXED (kept for discoverability)
**Details:** The BattleHeader still shows "Click for battle overview" hint text at 9px. This provides useful discoverability for new users so was intentionally kept.
