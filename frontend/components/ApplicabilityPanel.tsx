"use client";

import React from "react";
import { Check, X, AlertOctagon, ShieldCheck, ShieldAlert, ArrowRightLeft } from "lucide-react";
import { HistoricalIncidentMatch, EnvironmentDiffItem } from "@/lib/api";

interface ApplicabilityPanelProps {
  primaryPrecedent?: HistoricalIncidentMatch;
  environmentDiffs: EnvironmentDiffItem[];
  supportingEvidence: string[];
  conflictingEvidence: string[];
}

export default function ApplicabilityPanel({
  primaryPrecedent,
  environmentDiffs,
  supportingEvidence,
  conflictingEvidence,
}: ApplicabilityPanelProps) {
  const isHighRisk = (primaryPrecedent?.applicability_score ?? 100) < 50;

  return (
    <div className="space-y-6">
      
      {/* Prominent Header for Evidence Section */}
      <div
        className={`rounded-2xl border p-5 transition-colors ${
          isHighRisk
            ? "border-rose-200 dark:border-rose-500/40 bg-rose-50 dark:bg-gradient-to-r dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/20 shadow-sm"
            : "border-emerald-200 dark:border-emerald-500/40 bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/20 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              isHighRisk
                ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/40"
                : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40"
            }`}
          >
            {isHighRisk ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              {isHighRisk
                ? "Why is this precedent unsafe to reuse?"
                : "Why is this precedent safe to reuse?"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {isHighRisk
                ? "Resonance detected critical environmental drift and schema conflicts that invalidate the historical fix."
                : "Operational and infrastructure layers match historical parameters, verifying safe execution."}
            </p>
          </div>
        </div>
      </div>

      {/* Environment Drift & Context Comparison Matrix: Historical -> Current */}
      {environmentDiffs && environmentDiffs.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1628]/95 p-6 shadow-sm dark:shadow-xl transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <ArrowRightLeft className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">
                Environment & Runtime Context Comparison
              </h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-400 font-semibold">
              Historical ({primaryPrecedent?.id || "INC-101"}) → Current State
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold tracking-wider text-[11px]">
                  <th className="pb-3 pr-4">Runtime Layer</th>
                  <th className="pb-3 px-4 text-slate-500 dark:text-slate-400">Historical Precedent</th>
                  <th className="pb-3 px-2 text-center text-slate-400 dark:text-slate-500">→</th>
                  <th className="pb-3 px-4 text-cyan-700 dark:text-cyan-400 font-semibold">Current State</th>
                  <th className="pb-3 pl-4 text-right">Impact Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {environmentDiffs.map((diff, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      diff.is_conflict
                        ? "bg-rose-50/70 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    <td className="py-3.5 pr-4 font-sans font-semibold text-slate-800 dark:text-slate-200">
                      {diff.attribute}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {diff.historical}
                    </td>
                    <td className="py-3.5 px-2 text-center text-slate-400 dark:text-slate-600 font-sans">
                      →
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {diff.current}
                    </td>
                    <td className="py-3.5 pl-4 text-right font-sans">
                      {diff.is_conflict ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-100 dark:bg-rose-500/15 border border-rose-300 dark:border-rose-500/30 px-2.5 py-1 text-[11px] font-bold text-rose-800 dark:text-rose-300">
                          <X className="h-3.5 w-3.5 shrink-0" />
                          <span>{diff.risk_note || "Conflict Hazard"}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                          <Check className="h-3.5 w-3.5 shrink-0" />
                          <span>Compatible</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Evidence Split: Conflicting Risks vs Supporting Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Conflicting Evidence */}
        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-950/15 p-5 shadow-sm dark:shadow-lg transition-colors">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 mb-3 border-b border-rose-200 dark:border-rose-500/20 pb-2.5">
            <ShieldAlert className="h-5 w-5" />
            <h4 className="text-xs font-bold tracking-wider uppercase text-rose-800 dark:text-rose-300">
              Conflicting Risk Factors ({conflictingEvidence.length})
            </h4>
          </div>
          <ul className="space-y-2.5">
            {conflictingEvidence.length === 0 ? (
              <li className="text-xs text-slate-500 dark:text-slate-400 italic">No operational hazards or conflicts identified.</li>
            ) : (
              conflictingEvidence.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-rose-950 dark:text-rose-100">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-200 dark:bg-rose-500/25 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40">
                    <X className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className="leading-snug">{item}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Supporting Evidence */}
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/15 p-5 shadow-sm dark:shadow-lg transition-colors">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-3 border-b border-emerald-200 dark:border-emerald-500/20 pb-2.5">
            <ShieldCheck className="h-5 w-5" />
            <h4 className="text-xs font-bold tracking-wider uppercase text-emerald-800 dark:text-emerald-300">
              Supporting Precedent Factors ({supportingEvidence.length})
            </h4>
          </div>
          <ul className="space-y-2.5">
            {supportingEvidence.length === 0 ? (
              <li className="text-xs text-slate-500 dark:text-slate-400 italic">No direct positive alignment found.</li>
            ) : (
              supportingEvidence.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-emerald-950 dark:text-emerald-100">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-200 dark:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className="leading-snug">{item}</span>
                </li>
              ))
            )}
          </ul>
        </div>

      </div>

      {/* Negative Penalty Deductions Breakdown */}
      {primaryPrecedent && primaryPrecedent.penalty_breakdown && Object.keys(primaryPrecedent.penalty_breakdown).length > 0 && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/40 bg-rose-50/70 dark:bg-gradient-to-b dark:from-rose-950/30 dark:to-[#12070c] p-5 shadow-sm dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between mb-3 border-b border-rose-200 dark:border-rose-500/20 pb-2.5">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-semibold">
              <AlertOctagon className="h-4 w-4" />
              <span>Deterministic Safety Deductions</span>
            </div>
            <span className="text-[10px] font-mono text-rose-800 dark:text-rose-300 font-bold">
              Base: {primaryPrecedent.base_score} pts → Final: {primaryPrecedent.applicability_score}%
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.entries(primaryPrecedent.penalty_breakdown).map(([reason, penalty]) => (
              <div
                key={reason}
                className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900/90 px-3.5 py-2.5 text-xs border border-rose-200 dark:border-rose-500/30 shadow-sm"
              >
                <span className="text-slate-800 dark:text-slate-200 font-medium">{reason}</span>
                <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">{penalty} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
