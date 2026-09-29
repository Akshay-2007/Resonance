"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Shield,
  Database,
  Cpu,
  Sparkles,
  Zap,
  AlertTriangle,
  History,
  TrendingDown
} from "lucide-react";
import { getTimeline } from "@/lib/api";
import WaveBackground from "@/components/WaveBackground";

export default function DashboardPage() {
  const router = useRouter();
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    getTimeline().then((data) => {
      if (data && data.length > 0) {
        setRecentEvents(data.slice(0, 3));
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-12 pb-16 relative">
      
      {/* Wave Graphic Layer behind the Hero (Matching User Reference) */}
      <WaveBackground />

      {/* MINIMALIST HERO (Directly matching user reference composition) */}
      <section className="relative pt-8 pb-14 text-center max-w-4xl mx-auto space-y-6">
        
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Incident Decision Intelligence · Powered by Hindsight Cloud</span>
        </div>

        {/* Big Bold Headline inspired by reference */}
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Resonance
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-300 tracking-tight">
            Experience-Aware Incident Intelligence
          </p>
        </div>

        {/* Descriptive Body Paragraph */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
          Autonomous SRE agents routinely trigger catastrophic outages by blindly reusing historical fixes. Resonance doesn't just find what worked before — it determines whether that experience is still safe to execute now.
        </p>

        {/* Minimalist Solid Pill CTA Button (Matching reference "LEARN MORE" button) */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/analyze?preset=killer-demo"
            className="inline-flex items-center gap-2.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-8 py-3.5 text-xs font-bold tracking-wider uppercase shadow-lg shadow-slate-900/10 hover:scale-105 transition-all"
          >
            <span>Analyze Incident Applicability</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/history"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3.5 text-xs font-semibold transition-all shadow-sm"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Memory Bank</span>
          </Link>
        </div>
      </section>

      {/* ACTIVE INCIDENT COMMAND CARD */}
      <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-white dark:bg-gradient-to-b dark:from-[#140f1a] dark:to-[#0d1322] p-6 sm:p-8 shadow-md dark:shadow-2xl shadow-slate-200/50 dark:shadow-rose-950/20 relative overflow-hidden transition-colors">
        
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-rose-500"></span>
            </span>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-rose-600 dark:text-rose-400 font-mono">
                ACTIVE PRODUCTION INCIDENT
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Payment API Degradation</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 px-3 py-1.5">
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-200">SEV-1 OUTAGE</span>
          </div>
        </div>

        {/* Live Incident Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 p-4 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">p99 Latency</span>
            <p className="mt-1 text-2xl sm:text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">8.4s</p>
            <span className="text-[11px] text-rose-600 dark:text-rose-400/80">▲ 7,000% over baseline</span>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 p-4 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Error Rate</span>
            <p className="mt-1 text-2xl sm:text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">21%</p>
            <span className="text-[11px] text-rose-600 dark:text-rose-400/80">504 Gateway Timeouts</span>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 p-4 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Environment</span>
            <p className="mt-1 text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white">Production</p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Cluster: us-east-1</span>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 p-4 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Deployment Release</span>
            <p className="mt-1 text-lg sm:text-xl font-bold font-mono text-sky-600 dark:text-cyan-400">v5.4.1</p>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">PostgreSQL 15 PgBouncer</span>
          </div>
        </div>

        {/* Recent Change Callout */}
        <div className="mt-4 rounded-xl bg-amber-50/70 dark:bg-slate-950/90 border border-amber-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] tracking-wider font-bold text-slate-600 dark:text-slate-400">
                Recent Topology & Schema Changes:
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Database migration executed 34 minutes ago (PostgreSQL 15 PgBouncer migration & schema index sync)
              </p>
            </div>
          </div>

          <span className="rounded bg-amber-100 dark:bg-amber-500/10 px-2.5 py-1 text-[11px] font-mono font-medium text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
            Migration Active
          </span>
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Link
            href="/analyze?preset=killer-demo"
            className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-r dark:from-cyan-500 dark:via-sky-500 dark:to-indigo-600 px-8 py-3.5 text-xs font-bold text-white uppercase tracking-wider shadow-md hover:scale-105 transition-all group"
          >
            <Cpu className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            <span>Evaluate Precedent Safety</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>

      {/* 3 VALUE PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1628]/80 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 dark:bg-cyan-500/10 text-sky-600 dark:text-cyan-400 mb-4 border border-sky-200 dark:border-cyan-500/20">
            <Database className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Hindsight Long-Term Memory</h3>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Hindsight retains structured incident memories and recalls precedents using associative spread. Resonance layers operational applicability reasoning on top.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1628]/80 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-4 border border-rose-200 dark:border-rose-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Deterministic Applicability Engine</h3>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Evaluates 9 architectural dimensions with transparent negative penalties for environment drift, database version changes, and known historical failures.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1628]/80 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4 border border-indigo-200 dark:border-indigo-500/20">
            <History className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Continuous Feedback Loop</h3>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Human approvals, overrides, and real execution outcomes feed directly back into Hindsight to improve future confidence and prevent repeat blunders.
          </p>
        </div>

      </div>

    </div>
  );
}
