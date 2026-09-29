"use client";

import React, { useState } from "react";
import { RecommendationPayload } from "@/lib/api";
import { Check, X, Edit3, ShieldAlert, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { BorderBeam } from "border-beam";
import { useTheme } from "./ThemeProvider";

interface RecommendationCardProps {
  recommendation: RecommendationPayload;
  onDecision: (decision: "Approved" | "Rejected" | "Modified", modifiedAction?: string, rationale?: string) => void;
  decisionStatus: string | null;
  onTriggerOutcomeModal: () => void;
  applicabilityScore?: number;
}

export default function RecommendationCard({
  recommendation,
  onDecision,
  decisionStatus,
  onTriggerOutcomeModal,
  applicabilityScore = 38,
}: RecommendationCardProps) {
  const { theme } = useTheme();
  const [isModifying, setIsModifying] = useState(false);
  const [customAction, setCustomAction] = useState("");
  const [rationale, setRationale] = useState("");

  const isHighRisk = applicabilityScore < 50;

  const handleApprove = () => {
    onDecision("Approved");
  };

  const handleReject = () => {
    onDecision("Rejected", undefined, "Operator rejected recommendation due to custom policy check.");
  };

  const handleModifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAction.trim()) return;
    onDecision("Modified", customAction, rationale);
    setIsModifying(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-indigo-500/30 bg-white dark:bg-gradient-to-b dark:from-[#0f172a] dark:via-[#0d1424] dark:to-[#090e1a] p-6 shadow-md dark:shadow-2xl relative overflow-hidden space-y-6 transition-colors">
      
      {/* Subtle Glow Accents */}
      <div className="absolute top-0 right-0 h-48 w-48 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-32 w-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Verdict Tag & Confidence */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm dark:shadow-lg ${
              isHighRisk
                ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/40"
                : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40"
            }`}
          >
            {isHighRisk ? <ShieldAlert className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider border ${
                  isHighRisk
                    ? "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40"
                    : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40"
                }`}
              >
                {isHighRisk ? "Precedent Re-use Unsafe" : "Precedent Confirmed Safe"}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Resonance Decision Engine
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Recommended Resolution Strategy
            </h3>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 px-4 py-2.5 shadow-sm">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Confidence</span>
            <span className="font-mono text-lg font-black text-sky-700 dark:text-cyan-400">
              {recommendation.confidence}%
            </span>
          </div>
          <div className="h-9 w-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="w-full bg-gradient-to-t from-cyan-500 to-indigo-500 rounded-full transition-all duration-1000"
              style={{ height: `${recommendation.confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Recommended Action Display (Dynamic from Backend) */}
      <div>
        <BorderBeam size="md" colorVariant={isHighRisk ? "sunset" : "ocean"} strength={theme === "dark" ? 0.75 : 0.35} theme={theme === "dark" ? "dark" : "light"}>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-cyan-500/40 p-5 shadow-sm dark:shadow-inner transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-cyan-400">
              Engine Action Recommendation
            </span>
            <p className="mt-1.5 font-mono text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{recommendation.action}</span>
            </p>
            <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {recommendation.summary}
            </p>
          </div>
        </BorderBeam>

        {/* Safety Justifications / Reasoning Points */}
        {recommendation.reasoning_points && recommendation.reasoning_points.length > 0 && (
          <div className="mt-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Safety Justifications & Reasoning:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {recommendation.reasoning_points.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-600 dark:bg-cyan-400 shrink-0" />
                  <span className="leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Human Decision Action Controls */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5">
        {decisionStatus ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/40 p-4 shadow-sm dark:shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40">
                  <Check className="h-5 w-5 stroke-[3]" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Operator Decision Recorded:</span>
                  <p className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                    {decisionStatus.toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                onClick={onTriggerOutcomeModal}
                className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-r dark:from-cyan-500 dark:via-sky-500 dark:to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:scale-105 transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Simulate Resolution & Retain in Hindsight</span>
              </button>
            </div>

            {/* Visual 4-Stage Learning Loop */}
            <div className="rounded-2xl border border-slate-200 dark:border-indigo-500/30 bg-slate-50 dark:bg-[#090f1d] p-4 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block mb-3">
                Continuous Experience Learning Flow
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/30 p-2.5">
                  <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 block font-bold">STAGE 1</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">Human Decision</span>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block mt-0.5 font-mono">
                    ✓ {decisionStatus}
                  </span>
                </div>

                <div className="rounded-xl border border-sky-200 dark:border-cyan-500/30 bg-sky-50/80 dark:bg-cyan-950/20 p-2.5">
                  <span className="font-mono text-[10px] text-sky-700 dark:text-cyan-400 block font-bold">STAGE 2</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">Actual Outcome</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Telemetry Normalized</span>
                </div>

                <div className="rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-950/20 p-2.5">
                  <span className="font-mono text-[10px] text-indigo-700 dark:text-indigo-400 block font-bold">STAGE 3</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">Lesson Learned</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Schema Drift Validated</span>
                </div>

                <div className="rounded-xl border border-sky-200 dark:border-sky-500/30 bg-sky-50/80 dark:bg-sky-950/20 p-2.5">
                  <span className="font-mono text-[10px] text-sky-700 dark:text-sky-400 block font-bold">STAGE 4</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">Hindsight Retain</span>
                  <span className="text-[10px] text-sky-800 dark:text-sky-300 block mt-0.5 font-mono">Memory Bank Updated</span>
                </div>

              </div>
            </div>

          </div>
        ) : isModifying ? (
          <form onSubmit={handleModifySubmit} className="space-y-3 rounded-2xl bg-white dark:bg-slate-950 p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
              <Edit3 className="h-4 w-4" /> Modify Resolution Strategy
            </span>
            <input
              type="text"
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              placeholder="Enter operator modified resolution action..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
              required
            />
            <input
              type="text"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Operator rationale / technical reason for modification..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsModifying(false)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-bold text-slate-950 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Modified Action</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-white">Human-In-The-Loop:</span> Authorize, reject, or adjust the proposed operational strategy.
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReject}
                className="flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 px-5 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all shadow-sm"
              >
                <X className="h-4 w-4" />
                <span>Reject</span>
              </button>

              <button
                onClick={() => {
                  setCustomAction(recommendation.action);
                  setIsModifying(true);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 px-5 py-2.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all shadow-sm"
              >
                <Edit3 className="h-4 w-4" />
                <span>Modify</span>
              </button>

              <button
                onClick={handleApprove}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-600 px-6 py-2.5 text-xs font-bold text-white dark:text-slate-950 shadow-md hover:scale-105 transition-all"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Approve Action</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
