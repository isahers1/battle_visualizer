"use client";

import { useDaylightState } from "@/hooks/useDaylightState";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";

const TOD_LABELS: Record<string, string> = {
  night: "Night",
  dawn: "Dawn",
  day: "Day",
  dusk: "Dusk",
};

const TOD_ICONS: Record<string, string> = {
  night: "\u263D",
  dawn: "\u263C",
  day: "\u2600",
  dusk: "\u263C",
};

export function TimeOfDayIndicator() {
  const daylightState = useDaylightState();
  const snapshot = useCurrentSnapshot();

  if (!daylightState || !snapshot) return null;

  const time = new Date(snapshot.dateTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="w95-raised w95-font p-0">
      <div className="w95-titlebar text-[10px]">
        <span className="mr-1">{TOD_ICONS[daylightState.timeOfDay] ?? "\u2600"}</span>
        Time of Day
      </div>
      <div className="px-2 py-1.5 flex items-center gap-2">
        <span className="text-[16px]">
          {TOD_ICONS[daylightState.timeOfDay] ?? "\u2600"}
        </span>
        <div>
          <div className="text-[11px] font-bold text-black">
            {TOD_LABELS[daylightState.timeOfDay]}
          </div>
          <div className="text-[10px] text-[#404040]">{time}</div>
        </div>
      </div>
    </div>
  );
}
