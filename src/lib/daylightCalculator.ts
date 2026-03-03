import type { DaylightState, TimeOfDay } from "@/types";

export function calculateDaylightState(dateTimeStr: string): DaylightState {
  const date = new Date(dateTimeStr);
  const hour = date.getHours() + date.getMinutes() / 60;

  let timeOfDay: TimeOfDay;
  let sunAngle: number;
  let tintColor: string;
  let opacity: number;

  if (hour >= 6 && hour < 8) {
    // Dawn — very subtle warm tint
    timeOfDay = "dawn";
    sunAngle = (hour - 6) / 2;
    tintColor = "rgba(255, 160, 50, 1)";
    opacity = 0.04 * (1 - sunAngle);
  } else if (hour >= 8 && hour < 16) {
    // Day — no overlay
    timeOfDay = "day";
    sunAngle = 1;
    tintColor = "rgba(0, 0, 0, 0)";
    opacity = 0;
  } else if (hour >= 16 && hour < 18) {
    // Dusk — very subtle warm tint
    timeOfDay = "dusk";
    sunAngle = 1 - (hour - 16) / 2;
    tintColor = "rgba(255, 100, 30, 1)";
    opacity = 0.04 * (1 - sunAngle);
  } else {
    // Night — very subtle blue tint, keeps map readable
    timeOfDay = "night";
    sunAngle = 0;
    tintColor = "rgba(15, 23, 60, 1)";
    opacity = 0.08;
  }

  return { timeOfDay, sunAngle, tintColor, opacity };
}
