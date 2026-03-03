"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/stores";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";

export function EventBanner() {
  const isVisible = useStore((s) => s.isEventBannerVisible);
  const snapshot = useCurrentSnapshot();

  if (!isVisible || !snapshot) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={snapshot.index}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="absolute top-14 left-1/2 z-10 -translate-x-1/2 max-w-lg"
      >
        <div className="rounded-lg bg-white/90 px-4 py-2 shadow-md backdrop-blur-sm border border-stone-200">
          <p className="text-center text-xs leading-relaxed text-stone-600">
            {snapshot.description}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
