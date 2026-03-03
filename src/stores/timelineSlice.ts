import type { StateCreator } from "zustand";

export type AnimationDirection = "forward" | "backward" | "none";

export interface TimelineSlice {
  currentStep: number;
  previousStep: number;
  isAnimating: boolean;
  animationProgress: number; // 0-1
  animationDirection: AnimationDirection;
  setStep: (step: number) => void;
  stepForward: (maxSteps: number) => void;
  stepBackward: () => void;
  setAnimating: (isAnimating: boolean) => void;
  setAnimationProgress: (progress: number) => void;
}

export const createTimelineSlice: StateCreator<TimelineSlice> = (set, get) => ({
  currentStep: 0,
  previousStep: 0,
  isAnimating: false,
  animationProgress: 1,
  animationDirection: "none",
  setStep: (step) =>
    set((state) => ({
      previousStep: state.currentStep,
      currentStep: step,
      animationDirection: step > state.currentStep ? "forward" : "backward",
      animationProgress: step > state.currentStep ? 0 : 1,
    })),
  stepForward: (maxSteps) => {
    const { currentStep } = get();
    if (currentStep < maxSteps - 1) {
      set({
        previousStep: currentStep,
        currentStep: currentStep + 1,
        animationDirection: "forward",
        animationProgress: 0,
      });
    }
  },
  stepBackward: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({
        previousStep: currentStep,
        currentStep: currentStep - 1,
        animationDirection: "backward",
        animationProgress: 1,
      });
    }
  },
  setAnimating: (isAnimating) => set({ isAnimating }),
  setAnimationProgress: (progress) => set({ animationProgress: progress }),
});
