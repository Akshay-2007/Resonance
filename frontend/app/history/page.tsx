"use client";

import React, { useState, useEffect } from "react";
import { Database, Search, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState("ALL");
  const [selectedService, setSelectedService] = useState("ALL");

  useEffect(() => {
    import("../../../data/incidents.json")
      .then((mod) => setIncidents(mod.default || []))
      .catch(() => {});
  }, []);

  const services = ["ALL", ...Array.from(new Set(incidents.map((i) => i.service)))];

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.symptoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.root_cause.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesOutcome =
      selectedOutcome === "ALL" ||
      inc.outcome.toLowerCase() === selectedOutcome.toLowerCase();

    const matchesService =
      selectedService === "ALL" || inc.service === selectedService;

    return matchesSearch && matchesOutcome && matchesService;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-sky-700 dark:text-cyan-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hindsight Memory Bank Precedents
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            40 structured historical production incidents retained in Resonance's Hindsight memory bank.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 shadow-sm">
            Total Precedents: <strong className="text-sky-700 dark:text-cyan-400">{incidents.length}</strong>
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms, service, root cause..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0e1628] pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none shadow-sm"
          />
        </div>

        {/* Outcome Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["ALL", "Success", "Partial Success", "Failure"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedOutcome(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedOutcome === status
                  ? "bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow"
                  : "bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Service Selector */}
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0e1628] px-3 py-2 text-xs text-slate-800 dark:text-slate-300 focus:border-cyan-500 focus:outline-none w-full sm:w-auto shadow-sm"
        >
          {services.map((svc) => (
            <option key={svc} value={svc}>
              {svc === "ALL" ? "All Services" : svc}
            </option>
          ))}
        </select>
      </div>

      {/* Incident Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIncidents.map((inc) => (
          <div
            key={inc.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1628] p-5 shadow-sm dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-700 dark:text-cyan-400">{inc.id}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">({inc.service})</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{inc.title}</h3>
              </div>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                  inc.outcome.toLowerCase() === "success"
                    ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                    : inc.outcome.toLowerCase() === "failure"
                    ? "bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-500/30"
                    : "bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-500/30"
                }`}
              >
                {inc.outcome}
              </span>
            </div>

            {/* Symptoms & Root Cause */}
            <div className="text-xs space-y-1.5">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Symptoms:</span>
                <p className="text-slate-700 dark:text-slate-300 line-clamp-2">{inc.symptoms}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Root Cause:</span>
                <p className="text-slate-700 dark:text-slate-300 line-clamp-2">{inc.root_cause}</p>
              </div>
            </div>

            {/* Action Taken */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900/80 p-3 border border-slate-200/80 dark:border-slate-800 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Action Executed:
              </span>
              <p className="mt-0.5 font-mono text-slate-800 dark:text-slate-200">{inc.action_taken}</p>
              {inc.side_effects && (
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Side effects: {inc.side_effects}
                </p>
              )}
            </div>

            {/* Runtime environment tags */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <div className="flex flex-wrap gap-1">
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                  K8s {inc.kubernetes_version}
                </span>
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                  {inc.database_version}
                </span>
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                  v{inc.deployment_version}
                </span>
              </div>

              <Link
                href={`/analyze?preset=killer-demo`}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-cyan-400 hover:text-sky-800 dark:hover:text-cyan-300"
              >
                <span>Test in Analyzer</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
