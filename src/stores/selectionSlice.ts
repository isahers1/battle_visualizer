import type { StateCreator } from "zustand";

export interface SelectionSlice {
  hoveredUnitId: string | null;
  selectedUnitId: string | null;
  isDetailPanelOpen: boolean;
  hoverPosition: { x: number; y: number } | null;
  setHoveredUnit: (unitId: string | null, position?: { x: number; y: number }) => void;
  setSelectedUnit: (unitId: string | null) => void;
  openDetailPanel: (unitId: string) => void;
  closeDetailPanel: () => void;
}

export const createSelectionSlice: StateCreator<SelectionSlice> = (set) => ({
  hoveredUnitId: null,
  selectedUnitId: null,
  isDetailPanelOpen: false,
  hoverPosition: null,
  setHoveredUnit: (unitId, position) =>
    set({
      hoveredUnitId: unitId,
      hoverPosition: position ?? null,
    }),
  setSelectedUnit: (unitId) => set({ selectedUnitId: unitId }),
  openDetailPanel: (unitId) =>
    set({
      selectedUnitId: unitId,
      isDetailPanelOpen: true,
    }),
  closeDetailPanel: () =>
    set({
      isDetailPanelOpen: false,
    }),
});
