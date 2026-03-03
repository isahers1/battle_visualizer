export type WeatherType =
  | "clear"
  | "overcast"
  | "rain"
  | "snow"
  | "fog"
  | "heavy_snow"
  | "freezing_rain";

export type Visibility = "high" | "moderate" | "low" | "very_low";

export interface WeatherCondition {
  condition: WeatherType;
  temperature: number; // Celsius
  visibility: Visibility;
}

export type TimeOfDay = "night" | "dawn" | "day" | "dusk";

export interface DaylightState {
  timeOfDay: TimeOfDay;
  sunAngle: number; // 0-1, used for overlay opacity
  tintColor: string; // CSS color for overlay
  opacity: number; // overlay opacity
}
