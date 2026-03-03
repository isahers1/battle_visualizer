import type { UnitStatus } from "./unit";
import type { WeatherCondition } from "./weather";

export interface Casualties {
  killed: number;
  wounded: number;
  captured: number;
  missing: number;
}

export interface UnitSnapshot {
  unitId: string;
  position: [number, number]; // [lng, lat]
  strength: number; // 0-100 percentage
  status: UnitStatus;
  casualties: Casualties;
}

export type CombatEventType =
  | "artillery_fire"
  | "assault"
  | "air_strike"
  | "defense"
  | "retreat"
  | "surrender"
  | "reinforcement";

export interface CombatEvent {
  id: string;
  type: CombatEventType;
  fromUnitId: string;
  toUnitId: string | null;
  fromPosition: [number, number];
  toPosition: [number, number];
  description: string;
}

export interface TimelineSnapshot {
  index: number;
  dateTime: string; // ISO 8601
  title: string;
  description: string;
  weather: WeatherCondition;
  unitStates: Record<string, UnitSnapshot>;
  combatEvents: CombatEvent[];
  significance?: string;
  details?: string[];
}
