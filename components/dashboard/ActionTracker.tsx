"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Action } from "@/lib/timeMachine";
import { Checkbox } from "../ui/Checkbox";

interface ActionTrackerProps {
  actions: Action[];
  checkedActions: string[];
  onToggle: (actionId: string) => void;
  onEcoScoreUpdate: () => void;
  onAddCustomAction: (action: Action) => void;
}

export default function ActionTracker({
  actions,
  checkedActions,
  onToggle,
  onAddCustomAction,
}: ActionTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customSavings, setCustomSavings] = useState("");

  const totalSavings = useMemo(
    () =>
      actions
        .filter((a) => checkedActions.includes(a.id))
        .reduce((sum, a) => sum + a.savingsKg, 0),
    [actions, checkedActions]
  );

  const handleAddCustom = () => {
    const label = customLabel.trim();
    const savings = parseInt(customSavings, 10);
    if (!label || isNaN(savings) || savings <= 0) return;

    const newAction: Action = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      savingsKg: savings,
    };

    onAddCustomAction(newAction);
    setCustomLabel("");
    setCustomSavings("");
    setShowAddForm(false);
  };

  const totalPossibleSavings = useMemo(
    () => actions.reduce((sum, a) => sum + a.savingsKg, 0),
    [actions]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
          <span>Actions Taken</span>
          <span className="font-data-metric text-primary font-bold">
            {checkedActions.length} / {actions.length}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container-highest">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: "0%" }}
            animate={{
              width: `${(checkedActions.length / Math.max(actions.length, 1)) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {actions.map((action) => {
          const isChecked = checkedActions.includes(action.id);
          const isCustom = action.id.startsWith("custom-");
          return (
            <div
              key={action.id}
              onClick={() => onToggle(action.id)}
              className={`flex items-center gap-4 rounded-xl border p-4 transition-all duration-300 cursor-pointer ${
                isChecked
                  ? "bg-primary-container/10 border-primary/50 shadow-[0_0_15px_rgba(75,226,119,0.1)]"
                  : "border-outline-variant/50 bg-surface-container/30 hover:border-outline/50"
              }`}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => onToggle(action.id)}
                id={`action-${action.id}`}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isChecked ? "text-primary" : "text-on-surface"}`}>
                  {action.label}
                  {isCustom && (
                    <span className="ml-2 text-[10px] text-on-surface-variant font-label-caps tracking-wider">CUSTOM</span>
                  )}
                </p>
              </div>
              <span className="font-data-metric text-xs font-semibold text-primary-fixed bg-primary-container/20 px-2.5 py-0.5 rounded-full shrink-0">
                -{action.savingsKg} kg/yr
              </span>
            </div>
          );
        })}
      </div>

      {showAddForm ? (
        <div className="rounded-xl bg-surface-container/40 border border-outline-variant/30 p-4 space-y-3">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Action name (e.g. Use public transit)"
            className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={customSavings}
              onChange={(e) => setCustomSavings(e.target.value)}
              placeholder="kg CO2 saved/year"
              className="flex-1 bg-surface-container-highest/50 border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleAddCustom}
              disabled={!customLabel.trim() || !customSavings}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg bg-surface-container-high/50 text-on-surface-variant text-sm hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex-1 py-2.5 rounded-xl border border-dashed border-outline-variant/50 text-sm text-on-surface-variant font-medium hover:border-primary/50 hover:text-primary transition-all"
          >
            + Add Custom Action
          </button>
        </div>
      )}

      {totalSavings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-primary-container/20 p-4 border border-primary/30 text-center"
        >
          <span className="text-sm font-semibold text-primary">
            Projected Savings:{" "}
            <span className="font-data-metric font-bold text-base ml-1">
              -{totalSavings.toLocaleString()}
            </span>{" "}
            kg CO₂/year
          </span>
        </motion.div>
      )}

      {totalPossibleSavings > 0 && (
        <div className="text-[10px] text-on-surface-variant/60 text-center tracking-wider font-label-caps">
          {checkedActions.length > 0
            ? `${((totalSavings / totalPossibleSavings) * 100).toFixed(0)}% of maximum possible savings`
            : "Check actions above to see your projected savings"}
        </div>
      )}
    </div>
  );
}
