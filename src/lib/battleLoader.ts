import type { BattleData, BattleMetadata } from "@/types";
import type { Unit } from "@/types";
import type { TimelineSnapshot } from "@/types";

const BATTLE_IDS = ["bulge"] as const;
export type BattleId = (typeof BATTLE_IDS)[number];

export function isValidBattleId(id: string): id is BattleId {
  return BATTLE_IDS.includes(id as BattleId);
}

export async function loadBattleData(battleId: string): Promise<BattleData> {
  const [metadata, units, timeline, terrain, fortifications] =
    await Promise.all([
      import(`@/data/battles/${battleId}/metadata.json`).then(
        (m) => m.default as BattleMetadata
      ),
      import(`@/data/battles/${battleId}/units.json`).then(
        (m) => m.default as Record<string, Unit>
      ),
      import(`@/data/battles/${battleId}/timeline.json`).then(
        (m) => m.default as TimelineSnapshot[]
      ),
      import(`@/data/battles/${battleId}/terrain.json`).then(
        (m) => m.default as GeoJSON.FeatureCollection
      ),
      import(`@/data/battles/${battleId}/fortifications.json`).then(
        (m) => m.default as GeoJSON.FeatureCollection
      ),
    ]);

  return { metadata, units, timeline, terrain, fortifications };
}
