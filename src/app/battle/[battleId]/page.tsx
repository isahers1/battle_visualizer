import { notFound } from "next/navigation";
import { loadBattleData, isValidBattleId } from "@/lib/battleLoader";
import { BattleClient } from "./BattleClient";

interface BattlePageProps {
  params: Promise<{ battleId: string }>;
}

export default async function BattlePage({ params }: BattlePageProps) {
  const { battleId } = await params;

  if (!isValidBattleId(battleId)) {
    notFound();
  }

  const data = await loadBattleData(battleId);

  return <BattleClient data={data} />;
}

export function generateStaticParams() {
  return [{ battleId: "bulge" }];
}
