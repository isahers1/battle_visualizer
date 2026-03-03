import { create } from "zustand";
import { createBattleSlice, type BattleSlice } from "./battleSlice";
import { createTimelineSlice, type TimelineSlice } from "./timelineSlice";
import { createMapSlice, type MapSlice } from "./mapSlice";
import { createSelectionSlice, type SelectionSlice } from "./selectionSlice";
import { createUISlice, type UISlice } from "./uiSlice";

export type AppStore = BattleSlice &
  TimelineSlice &
  MapSlice &
  SelectionSlice &
  UISlice;

export const useStore = create<AppStore>()((...args) => ({
  ...createBattleSlice(...args),
  ...createTimelineSlice(...args),
  ...createMapSlice(...args),
  ...createSelectionSlice(...args),
  ...createUISlice(...args),
}));
