"use client";

import React from "react";
import { TimelineItem } from "@/lib/api";
import { History, CheckCircle2, XCircle, Sparkles, Clock, RefreshCw } from "lucide-react";

interface ExperienceTimelineProps {
  timeline: TimelineItem[];
  onRefresh?: () => void;
}

export default function ExperienceTimeline({ timeline, onRefresh }: ExperienceTimelineProps) {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Experience Learning Loop</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            How Resonance continuously learns from human decisions, overrides, and real operational resolutions.
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Timeline</span>
          </button>
        )}
      </div>

      {/* Timeline List */}
      {timeline.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1628]/60 p-12 text-center shadow-sm">
          <History className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No active runtime feedback logged yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Analyze an incident on the Flagship demo screen, record an operator decision, and simulate its outcome to see the feedback loop update live.
          </p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8">
          {timeline.map((item, idx) => {
            const isOutcomeSuccess = item.outcome?.toLowerCase() === "success";
            const isOutcomeFailure = item.outcome?.toLowerCase() === "failure";

            return (
              <div key={item.id || idx} className="relative group">
                
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-950 ${
                    isOutcomeSuccess
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/20"
                      : isOutcomeFailure
                      ? "border-rose-500 text-rose-600 dark:text-rose-400 shadow-rose-500/20"
                      : "border-sky-500 text-sky-600 dark:text-cyan-400 shadow-cyan-500/20"
                  } shadow-md`}
                >
                  {isOutcomeSuccess ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isOutcomeFailure ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                </div>

                {/* Card */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1628] p-5 shadow-sm dark:shadow-lg transition-all hover:border-slate-300 dark:hover:border-slate-700">
                  
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-700 dark:text-cyan-400">
                        {item.incident_id || "INC-RUN"}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {item.service}
                      </span>
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : "Just now"}
                      </span>
                    </div>

                    {/* Scores */}
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-sky-700 dark:text-sky-400">
                        Sim: <strong className="text-slate-900 dark:text-white">{item.similarity_score}%</strong>
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className={item.applicability_score < 50 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                        App: <strong className="text-slate-900 dark:text-white">{item.applicability_score}%</strong>
                      </span>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <p className="mt-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {item.symptoms}
                  </p>

                  {/* Flow Steps */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    
                    {/* Recommended */}
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900/80 p-3 border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                        Resonance Proposed:
                      </span>
                      <p className="mt-1 font-mono text-slate-800 dark:text-slate-200 truncate">
                        {item.recommended_action}
                      </p>
                    </div>

                    {/* Human Decision */}
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900/80 p-3 border border-slate-200/80 dark:border-slate-800/80">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                        Human SRE Decision:
                      </span>
                      <p className="mt-1 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {item.human_decision?.toUpperCase()}
                      </p>
                      {item.executed_action && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          Action: {item.executed_action}
                        </p>
                      )}
                    </div>

                    {/* Final Outcome */}
                    <div className={`rounded-lg p-3 border ${
                      isOutcomeSuccess 
                        ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                        : isOutcomeFailure
                        ? "bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-300"
                        : "bg-slate-50 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider">Outcome:</span>
                        {item.retained_to_hindsight && (
                          <span className="text-[9px] rounded bg-white dark:bg-slate-800 px-1.5 py-0.2 font-mono font-medium shadow-sm">
                            Retained
                          </span>
                        )}
                      </div>
                      <p className="mt-1 font-bold font-mono text-xs">
                        {item.outcome || "Pending Execution"}
                      </p>
                      {item.feedback_notes && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                          {item.feedback_notes}
                        </p>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
