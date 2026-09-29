"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, ShieldCheck } from "lucide-react";
import { BorderBeam } from "border-beam";
import { useTheme } from "./ThemeProvider";

interface ScoreCardProps {
  similarity: number;
  applicability: number;
  riskLevel: string;
  verdict: string;
}

export default function ScoreCard({
  similarity,
  applicability,
  riskLevel,
  verdict,
}: ScoreCardProps) {
  const { theme } = useTheme();
  const isDivergent = similarity >= 70 && applicability < 50;
  const isSafe = applicability >= 80;

  return (
    <div className="w-full space-y-5">
      {/* 2 Main Hero Metric Cards: Similarity vs Applicability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: Semantic Similarity */}
        <BorderBeam size="md" colorVariant="ocean" strength={theme === "dark" ? 0.6 : 0.35} theme={theme === "dark" ? "dark" : "light"}>
          <div className="relative overflow-hidden rounded-2xl border border-sky-200 dark:border-sky-500/30 bg-white dark:bg-gradient-to-b dark:from-[#0c162d] dark:to-[#091020] p-6 shadow-sm dark:shadow-xl dark:shadow-sky-950/20 transition-colors">
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-sky-500/20 pb-3">
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-sky-700 dark:text-sky-400">
                  SIMILARITY
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  &ldquo;How similar is the historical incident?&rdquo;
                </p>
              </div>
              <span className="rounded-full bg-sky-100 dark:bg-sky-500/15 px-2.5 py-1 text-[10px] font-mono font-bold text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30">
                Looks similar
              </span>
            </div>

            <div className="mt-5 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl sm:text-7xl font-black tracking-tight text-sky-700 dark:text-sky-400 font-mono">
                  {similarity}%
                </span>
              </div>
              <div className="text-right">
                <span className="rounded bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 px-2 py-0.5 text-[10px] font-mono text-sky-800 dark:text-sky-300">
                  Hindsight Recall
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">High semantic pattern match</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800/90 rounded-full h-2.5 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-sky-500 to-cyan-400 h-1.5 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-sky-400"
                style={{ width: `${similarity}%` }}
              />
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Incident symptoms, error logs, and telemetry correlate strongly with historical precedents in Hindsight Cloud.
            </p>
          </div>
        </BorderBeam>

        {/* Card 2: Operational Applicability */}
        <BorderBeam
          size="md"
          colorVariant={applicability < 50 ? "sunset" : "ocean"}
          strength={theme === "dark" ? (applicability < 50 ? 0.85 : 0.6) : 0.4}
          theme={theme === "dark" ? "dark" : "light"}
        >
          <div
            className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm dark:shadow-2xl transition-all ${
              applicability < 50
                ? "border-rose-300 dark:border-rose-500/50 bg-white dark:bg-gradient-to-b dark:from-[#2a0e16] dark:to-[#16080d] dark:glow-danger"
                : applicability >= 80
                ? "border-emerald-300 dark:border-emerald-500/50 bg-white dark:bg-gradient-to-b dark:from-[#0a2318] dark:to-[#06140e] dark:glow-safe"
                : "border-amber-300 dark:border-amber-500/50 bg-white dark:bg-gradient-to-b dark:from-[#24170a] dark:to-[#120c05]"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-3 ${
                applicability < 50
                  ? "border-rose-100 dark:border-rose-500/30"
                  : applicability >= 80
                  ? "border-emerald-100 dark:border-emerald-500/30"
                  : "border-amber-100 dark:border-amber-500/30"
              }`}
            >
              <div>
                <span
                  className={`text-xs font-bold tracking-wider uppercase ${
                    applicability < 50
                      ? "text-rose-600 dark:text-rose-400"
                      : applicability >= 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  APPLICABILITY
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  &ldquo;How applicable is its solution now?&rdquo;
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-mono font-bold border ${
                  applicability < 50
                    ? "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/40"
                    : applicability >= 80
                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40"
                    : "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/40"
                }`}
              >
                {applicability < 50 ? "Not safe to reuse" : applicability >= 80 ? "Safe to reuse" : "Caution advised"}
              </span>
            </div>

            <div className="mt-5 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-6xl sm:text-7xl font-black tracking-tight font-mono ${
                    applicability < 50
                      ? "text-rose-600 dark:text-rose-400"
                      : applicability >= 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {applicability}%
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-mono ${
                    applicability < 50
                      ? "bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300"
                      : "bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300"
                  }`}
                >
                  Resonance Engine
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Context-aware safety score</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800/90 rounded-full h-2.5 overflow-hidden p-0.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-1000 ease-out shadow-sm ${
                  applicability < 50
                    ? "bg-gradient-to-r from-rose-500 to-red-400 shadow-rose-400"
                    : applicability >= 80
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-emerald-400"
                    : "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-amber-400"
                }`}
                style={{ width: `${applicability}%` }}
              />
            </div>

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {applicability < 50
                ? "Penalized for critical runtime shifts, active schema locks, and proxy incompatibilities."
                : "Runtime context and infrastructure align safely with historical resolution conditions."}
            </p>
          </div>
        </BorderBeam>

      </div>

      {/* Flagship Callout Banner: The 5-Second Judge Takeaway */}
      {isDivergent && (
        <BorderBeam size="md" colorVariant="sunset" strength={theme === "dark" ? 0.85 : 0.4} theme={theme === "dark" ? "dark" : "light"}>
          <div className="rounded-2xl border-2 border-rose-300 dark:border-rose-500/60 bg-rose-50/90 dark:bg-gradient-to-r dark:from-rose-950/80 dark:via-[#180b12] dark:to-rose-950/80 p-5 shadow-sm dark:shadow-2xl dark:shadow-rose-950/40 animate-in fade-in slide-in-from-top-2 duration-500 transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-200/70 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40 shadow-inner">
                  <AlertTriangle className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-rose-200 dark:bg-rose-500/30 px-2 py-0.5 text-[11px] font-bold tracking-wider text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-500/40">
                      VERDICT: DO NOT REUSE PRECEDENT
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-300">
                      RISK: {riskLevel}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                    ⚠️ High similarity does NOT mean the old solution is safe to reuse.
                  </h4>
                  <p className="text-xs text-rose-900/80 dark:text-rose-200/90 mt-0.5">
                    Semantic match is <span className="font-mono font-bold text-sky-700 dark:text-sky-300">{similarity}%</span>, but operational applicability dropped to <span className="font-mono font-bold text-rose-700 dark:text-rose-300">{applicability}%</span> due to runtime & environmental drift.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-xl bg-rose-600 dark:bg-rose-900/60 px-4 py-2.5 border border-rose-700 dark:border-rose-600/60 shadow-md">
                <ShieldAlert className="h-5 w-5 text-white dark:text-rose-300" />
                <span className="text-xs font-mono font-black text-white dark:text-rose-100 tracking-wider">DO NOT REUSE</span>
              </div>
            </div>
          </div>
        </BorderBeam>
      )}

      {isSafe && (
        <BorderBeam size="md" colorVariant="ocean" strength={theme === "dark" ? 0.7 : 0.35} theme={theme === "dark" ? "dark" : "light"}>
          <div className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-500/60 bg-emerald-50/90 dark:bg-gradient-to-r dark:from-emerald-950/80 dark:via-[#0a1b14] dark:to-emerald-950/80 p-5 shadow-sm dark:shadow-2xl dark:shadow-emerald-950/40 animate-in fade-in slide-in-from-top-2 duration-500 transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-200/70 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-200 dark:bg-emerald-500/30 px-2 py-0.5 text-[11px] font-bold tracking-wider text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/40">
                      VERDICT: SAFE TO REUSE PRECEDENT
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      RISK: {riskLevel}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                    🟢 Historical Resolution is Confirmed Safe for Re-use.
                  </h4>
                  <p className="text-xs text-emerald-900/80 dark:text-emerald-200/90 mt-0.5">
                    High similarity (<span className="font-mono font-bold text-sky-700 dark:text-sky-300">{similarity}%</span>) aligns with high applicability (<span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{applicability}%</span>). Operational conditions match historical success.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 dark:bg-emerald-900/60 px-4 py-2.5 border border-emerald-700 dark:border-emerald-600/60 shadow-md">
                <ShieldCheck className="h-5 w-5 text-white dark:text-emerald-300" />
                <span className="text-xs font-mono font-black text-white dark:text-emerald-100 tracking-wider">SAFE TO REUSE</span>
              </div>
            </div>
          </div>
        </BorderBeam>
      )}
    </div>
  );
}
