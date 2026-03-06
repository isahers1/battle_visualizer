"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/stores";
import encyclopediaData from "@/data/equipment-encyclopedia.json";

interface EncyclopediaItem {
  name: string;
  category: string;
  subcategory: string;
  nation: string;
  specs: Record<string, string>;
  description: string;
  usedBy: string[];
}

const items = encyclopediaData.items as Record<string, EncyclopediaItem>;

const CATEGORY_LABELS: Record<string, string> = {
  small_arms: "Small Arms",
  anti_tank: "Anti-Tank Weapons",
  artillery: "Artillery",
  vehicles: "Vehicles",
};

const CATEGORY_ORDER = ["small_arms", "anti_tank", "artillery", "vehicles"];

function buildCategoryTree(): Record<string, EncyclopediaItem[]> {
  const tree: Record<string, EncyclopediaItem[]> = {};
  for (const item of Object.values(items)) {
    if (!tree[item.category]) tree[item.category] = [];
    tree[item.category].push(item);
  }
  return tree;
}

interface EquipmentEncyclopediaProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: string;
}

export function EquipmentEncyclopedia({
  isOpen,
  onClose,
  initialItem,
}: EquipmentEncyclopediaProps) {
  const [selectedItem, setSelectedItem] = useState<string>(
    initialItem ?? Object.keys(items)[0] ?? ""
  );
  const openDetailPanel = useStore((s) => s.openDetailPanel);
  const units = useStore((s) => s.units);

  const categoryTree = useMemo(() => buildCategoryTree(), []);

  // Sync initialItem when it changes
  const [prevInitial, setPrevInitial] = useState(initialItem);
  if (initialItem !== prevInitial) {
    setPrevInitial(initialItem);
    if (initialItem && items[initialItem]) {
      setSelectedItem(initialItem);
    }
  }

  if (!isOpen) return null;

  const current = items[selectedItem];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.3)" }}
    >
      <div className="w95-raised w-[700px] h-[500px] flex flex-col w95-font">
        {/* Titlebar */}
        <div className="w95-titlebar px-1 py-[3px] flex-shrink-0">
          <span className="text-[10px] mr-1">&#128214;</span>
          <span className="text-[11px]">Battle Equipment Reference.hlp</span>
          <button
            onClick={onClose}
            className="w95-btn !p-0 !min-h-[14px] w-[14px] ml-auto flex items-center justify-center text-[9px] leading-none !border-[1px] flex-shrink-0"
          >
            &#x2715;
          </button>
        </div>

        {/* Button bar */}
        <div className="bg-[#c0c0c0] px-1 py-0.5 flex gap-1 border-b border-[#808080]">
          <span className="w95-btn text-[10px] !min-h-[18px] !px-1.5">
            Contents
          </span>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden bg-[#c0c0c0]">
          {/* Left pane - tree nav */}
          <div className="w-[200px] border-r-2 border-r-[#808080] flex flex-col">
            <div className="w95-sunken flex-1 m-1 overflow-y-auto">
              {CATEGORY_ORDER.map((cat) => {
                const catItems = categoryTree[cat];
                if (!catItems) return null;
                return (
                  <div key={cat}>
                    <div className="px-1.5 py-0.5 text-[10px] font-bold text-[#000080] uppercase bg-[#e0e0e0] border-b border-[#c0c0c0]">
                      {CATEGORY_LABELS[cat] ?? cat}
                    </div>
                    {catItems.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => setSelectedItem(item.name)}
                        className={`block w-full text-left px-2 py-0.5 text-[11px] ${
                          selectedItem === item.name
                            ? "bg-[#000080] text-white"
                            : "text-black hover:bg-[#000080] hover:text-white"
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right pane - article */}
          <div className="flex-1 flex flex-col">
            <div className="w95-sunken flex-1 m-1 overflow-y-auto p-2">
              {current ? (
                <>
                  <h2 className="text-[14px] font-bold text-black mb-0.5">
                    {current.name}
                  </h2>
                  <div className="text-[10px] text-[#808080] mb-2">
                    {current.nation} &mdash; {current.subcategory}
                  </div>

                  {/* Specs table */}
                  <table className="w-full mb-2 border-collapse">
                    <tbody>
                      {Object.entries(current.specs).map(([key, val]) => (
                        <tr
                          key={key}
                          className="text-[11px] border-b border-[#e0e0e0]"
                        >
                          <td className="py-0.5 pr-2 font-bold text-[#404040] w-[120px]">
                            {key}
                          </td>
                          <td className="py-0.5 text-black">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Description */}
                  <p className="text-[11px] leading-relaxed text-black mb-3">
                    {current.description}
                  </p>

                  {/* Used by */}
                  {current.usedBy.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-[#404040] uppercase mb-1">
                        Used by
                      </div>
                      <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                        {current.usedBy.map((unitId) => {
                          const unit = units[unitId];
                          if (!unit) return null;
                          return (
                            <button
                              key={unitId}
                              onClick={() => {
                                onClose();
                                openDetailPanel(unitId);
                              }}
                              className="text-[11px] underline cursor-pointer"
                              style={{ color: "#008000" }}
                            >
                              {unit.shortName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-[11px] text-[#808080] italic">
                  Select an item from the contents list.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="w95-statusbar flex-shrink-0">
          <div className="w95-statusbar-cell flex-1">
            {current
              ? `${current.name} — ${current.subcategory}`
              : "Ready"}
          </div>
          <div className="w95-statusbar-cell">
            {Object.keys(items).length} items
          </div>
        </div>
      </div>
    </div>
  );
}
