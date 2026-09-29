"use client";

import React from "react";
import { HistoricalIncidentMatch } from "@/lib/api";
import { CheckCircle, XCircle, Sparkles } from "lucide-react";

interface HistoricalIncidentProps {
  match: HistoricalIncidentMatch;
  isPrimary?: boolean;
}

export default function HistoricalIncident({ match, isPrimary = false }: HistoricalIncidentProps) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        isPrimary
          ? "border-sky-300 dark:border-cyan-500/50 bg-sky-50/60 dark:bg-gradient-to-b dark:from-[#0e172c] dark:to-[#090f1d] shadow-sm dark:shadow-xl dark:shadow-cyan-950/25 ring-1 ring-sky-400/30 dark:ring-cyan-500/20"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1628]/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 dark:bg-cyan-500/10 text-sky-700 dark:text-cyan-400 border border-sky-200 dark:border-cyan-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-700 dark:text-cyan-400">{match.id}</span>
              {isPrimary && (
                <span className="rounded-full bg-sky-100 dark:bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold tracking-wider text-sky-800 dark:text-cyan-300 border border-sky-200 dark:border-cyan-500/30">
                  TOP PRECEDENT
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mt-0.5">{match.title}</h4>
          </div>
        </div>

        {/* Scores Pills */}
        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl px-2.5 py-1 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">Sim</span>
            <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">{match.similarity_score}%</span>
          </div>
          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">App</span>
            <span
              className={`font-mono text-xs font-bold ${
                match.applicability_score < 50
                  ? "text-rose-600 dark:text-rose-400"
                  : match.applicability_score >= 80
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {match.applicability_score}%
            </span>
          </div>
        </div>
      </div>

      {/* Body Details */}
      <div className="mt-4 space-y-3 text-xs">
        <div>
          <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Historical Root Cause:</span>
          <p className="mt-1 text-slate-700 dark:text-slate-200 leading-relaxed font-sans">{match.root_cause}</p>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 p-3.5 border border-slate-200/80 dark:border-slate-800/80">
          <span className="font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider">Historical Fix Applied:</span>
          <p className="mt-1 font-mono text-xs text-slate-900 dark:text-white font-semibold">{match.action_taken}</p>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Outcome:</span>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                match.outcome.toLowerCase() === "success"
                  ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                  : "bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30"
              }`}
            >
              {match.outcome.toLowerCase() === "success" ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {match.outcome}
            </span>
            {match.side_effects && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                ({match.side_effects})
              </span>
            )}
          </div>
        </div>

        {/* Runtime Stack Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="rounded-md bg-slate-100 dark:bg-slate-800/90 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
            K8s {match.kubernetes_version}
          </span>
          <span className="rounded-md bg-slate-100 dark:bg-slate-800/90 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
            {match.database_version}
          </span>
          <span className="rounded-md bg-slate-100 dark:bg-slate-800/90 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
            Rel {match.deployment_version}
          </span>
        </div>
      </div>
    </div>
  );
}
