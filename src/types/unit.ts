export type Side = "allied" | "axis";

export type UnitType =
  | "infantry"
  | "armor"
  | "artillery"
  | "airborne"
  | "cavalry"
  | "mechanized"
  | "headquarters"
  | "engineer"
  | "reconnaissance";

export type Echelon =
  | "army_group"
  | "army"
  | "corps"
  | "division"
  | "brigade"
  | "regiment"
  | "battalion";

export type UnitStatus =
  | "reserve"
  | "moving"
  | "engaged"
  | "defending"
  | "retreating"
  | "destroyed"
  | "surrendered";

export interface Equipment {
  name: string;
  category: string;
  quantity: number;
}

export interface Personnel {
  officers: number;
  ncos: number;
  enlisted: number;
}

export interface Unit {
  id: string;
  name: string;
  shortName: string;
  side: Side;
  unitType: UnitType;
  echelon: Echelon;
  parentId: string | null;
  childIds: string[];
  commander: string;
  personnel: Personnel;
  equipment: Equipment[];
  history: string;
}
