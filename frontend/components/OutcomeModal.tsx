"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X, Database } from "lucide-react";
import { ThinkingOrb } from "thinking-orbs";
import { useTheme } from "./ThemeProvider";

interface OutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (outcome: { outcome: string; actual_recovery_time_minutes: number; side_effects_observed: string; lessons_learned: string }) => void;
  service: string;
}

export default function OutcomeModal({ isOpen, onClose, onSubmit, service }: OutcomeModalProps) {
  const { theme } = useTheme();
  const [outcome, setOutcome] = useState("Success");
  const [recoveryTime, setRecoveryTime] = useState(4);
  const [sideEffects, setSideEffects] = useState("None. Latency normalized to 110ms.");
  const [lessonsLearned, setLessonsLearned] = useState("Rollback cleared schema lock without triggering PgBouncer connection overload.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSubmit({
      outcome,
      actual_recovery_time_minutes: Number(recoveryTime),
      side_effects_observed: sideEffects,
      lessons_learned: lessonsLearned,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1628] p-6 shadow-2xl transition-colors">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-gradient-to-br dark:from-cyan-500 dark:to-indigo-600 text-white shadow-md">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-cyan-400">
              Continuous Learning Feedback Loop
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Execution Outcome</h3>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Outcome Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Resolution Outcome:</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { id: "Success", label: "Success", icon: CheckCircle2, color: "text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40 bg-emerald-100 dark:bg-emerald-950/30" },
                { id: "Partial Success", label: "Partial", icon: AlertTriangle, color: "text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-500/40 bg-amber-100 dark:bg-amber-950/30" },
                { id: "Failure", label: "Failure", icon: XCircle, color: "text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-500/40 bg-rose-100 dark:bg-rose-950/30" },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = outcome === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOutcome(opt.id)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      isSelected ? opt.color + " shadow-sm" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recovery Time */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Actual Time to Recovery (Minutes):
            </label>
            <input
              type="number"
              value={recoveryTime}
              onChange={(e) => setRecoveryTime(Number(e.target.value))}
              min={1}
              max={240}
              className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          {/* Side Effects */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Side Effects / Blast Radius Observed:
            </label>
            <input
              type="text"
              value={sideEffects}
              onChange={(e) => setSideEffects(e.target.value)}
              placeholder="e.g., Cache cold-start latency for 2 minutes"
              className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Lessons Learned */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Lessons Learned / Operational Takeaway:
            </label>
            <textarea
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              rows={3}
              placeholder="Describe why this action worked or failed for future recall..."
              className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Retention notice with ThinkingOrb */}
          <div className="rounded-xl bg-slate-100 dark:bg-indigo-950/40 border border-slate-200 dark:border-indigo-500/30 p-3.5 text-[11px] text-slate-700 dark:text-indigo-300 flex items-center gap-3">
            <ThinkingOrb state="weaving" size={20} theme={theme === "dark" ? "dark" : "light"} />
            <span>
              This outcome will be automatically retained into Hindsight Cloud to calibrate future applicability calculations.
            </span>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <ThinkingOrb state="connecting" size={20} theme={theme === "dark" ? "dark" : "light"} />
                  <span>Retaining into Hindsight...</span>
                </>
              ) : (
                <span>Confirm & Retain Outcome</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
