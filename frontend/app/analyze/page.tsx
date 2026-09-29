"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Cpu,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Database,
  Layers,
  Terminal,
  ArrowDown
} from "lucide-react";
import {
  IncidentInput,
  AnalysisResult,
  analyzeIncident,
  recordDecision,
  recordOutcome,
  getPresets,
  DemoPreset,
  checkHealth
} from "@/lib/api";
import { BorderBeam } from "border-beam";
import { ThinkingOrb } from "thinking-orbs";
import ScoreCard from "@/components/ScoreCard";
import HistoricalIncident from "@/components/HistoricalIncident";
import ApplicabilityPanel from "@/components/ApplicabilityPanel";
import RecommendationCard from "@/components/RecommendationCard";
import OutcomeModal from "@/components/OutcomeModal";
import { useTheme } from "@/components/ThemeProvider";

// Preset scenario helper to avoid duplicate emojis and raw test strings
const getPresetScenario = (id: string, fallbackName: string) => {
  if (id === "killer-demo") {
    return {
      title: "Schema Migration Drift",
      badge: "Precedent Incompatible",
      badgeColor: "border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
    };
  }
  if (id === "safe-reuse-demo") {
    return {
      title: "Capacity Surge Pattern",
      badge: "Safe Remediation",
      badgeColor: "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    };
  }
  if (id === "kafka-lag-demo") {
    return {
      title: "Kafka Partition Rebalance",
      badge: "Architectural Hazard",
      badgeColor: "border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
    };
  }
  return {
    title: fallbackName.replace(/^[^\w]+/, "").split(":")[0].trim(),
    badge: "Scenario",
    badgeColor: "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  };
};

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [presets, setPresets] = useState<DemoPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("killer-demo");
  const [hindsightStatus, setHindsightStatus] = useState<string>("CHECKING");
  const [hindsightBank, setHindsightBank] = useState<string>("resonance-incidents");

  // Form State
  const [service, setService] = useState("Payment API");
  const [symptoms, setSymptoms] = useState("Latency 8.4s, Error Rate 21% on POST /v1/charges with pool timeout exceptions");
  const [environment, setEnvironment] = useState("Production");
  const [kubernetesVersion, setKubernetesVersion] = useState("1.28");
  const [databaseVersion, setDatabaseVersion] = useState("PostgreSQL 15 (PgBouncer)");
  const [deploymentVersion, setDeploymentVersion] = useState("5.4.1");
  const [recentChanges, setRecentChanges] = useState("Database migration executed 34 minutes ago");

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Decision & Outcome Loop State
  const [decisionStatus, setDecisionStatus] = useState<string | null>(null);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [outcomeSuccessMessage, setOutcomeSuccessMessage] = useState<string | null>(null);

  // Load Presets & Hindsight Cloud Health
  useEffect(() => {
    checkHealth()
      .then((data) => {
        if (data?.hindsight?.status === "HINDSIGHT_CLOUD") {
          setHindsightStatus("CONNECTED");
          if (data?.hindsight?.bank_id) setHindsightBank(data.hindsight.bank_id);
        } else if (data?.hindsight?.status === "LOCAL_MEMORY_MODE") {
          setHindsightStatus("LOCAL_EXPERIENCE_BANK");
        } else {
          setHindsightStatus("CONNECTED");
        }
      })
      .catch(() => {
        setHindsightStatus("FALLBACK_MODE");
      });

    getPresets().then((data) => {
      setPresets(data);
      const urlPreset = searchParams.get("preset");
      if (urlPreset) {
        const found = data.find((p) => p.id === urlPreset);
        if (found) loadPreset(found);
      }
    });
  }, [searchParams]);

  const loadPreset = (preset: DemoPreset) => {
    setSelectedPresetId(preset.id);
    setService(preset.payload.service);
    setSymptoms(preset.payload.symptoms);
    setEnvironment(preset.payload.environment);
    setKubernetesVersion(preset.payload.kubernetes_version);
    setDatabaseVersion(preset.payload.database_version);
    setDeploymentVersion(preset.payload.deployment_version);
    setRecentChanges(preset.payload.recent_changes);
    setAnalysisResult(null);
    setDecisionStatus(null);
    setOutcomeSuccessMessage(null);
  };

  const handleRunAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAnalyzing(true);
    setError(null);
    setDecisionStatus(null);
    setOutcomeSuccessMessage(null);

    const payload: IncidentInput = {
      service,
      symptoms,
      environment,
      kubernetes_version: kubernetesVersion,
      database_version: databaseVersion,
      deployment_version: deploymentVersion,
      recent_changes: recentChanges,
    };

    try {
      const result = await analyzeIncident(payload);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "Failed to analyze incident.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDecision = async (
    decision: "Approved" | "Rejected" | "Modified",
    modifiedAction?: string,
    rationale?: string
  ) => {
    if (!analysisResult) return;
    try {
      await recordDecision(analysisResult.incident_id, {
        decision,
        selected_action: analysisResult.recommendation.action,
        modified_action: modifiedAction,
        rationale: rationale,
      });
      setDecisionStatus(decision);
    } catch (err: any) {
      console.error("Error recording decision:", err);
    }
  };

  const handleOutcomeSubmit = async (outcomeData: {
    outcome: string;
    actual_recovery_time_minutes: number;
    side_effects_observed: string;
    lessons_learned: string;
  }) => {
    if (!analysisResult) return;
    try {
      await recordOutcome(analysisResult.incident_id, outcomeData);
      setIsOutcomeModalOpen(false);
      setOutcomeSuccessMessage(
        `Resolution outcome (${outcomeData.outcome}) successfully retained into Hindsight Cloud to calibrate future applicability calculations.`
      );
    } catch (err: any) {
      console.error("Error recording outcome:", err);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Super Header / Brand & Core Message Banner */}
      <BorderBeam size="md" colorVariant="ocean" strength={theme === "dark" ? 0.65 : 0.35} theme={theme === "dark" ? "dark" : "light"}>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1422]/90 p-6 sm:p-7 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold tracking-wider text-sky-700 dark:text-cyan-400 uppercase">
                  Resonance
                </span>
                <span className="text-slate-400 dark:text-slate-600">·</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  Experience-Aware Incident Intelligence
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1.5">
                Incident Decision Command
              </h1>

              {/* Core Principle Callout */}
              <div className="mt-3.5 inline-flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
                <span className="font-semibold text-sky-700 dark:text-cyan-400">Core Principle:</span>
                <span>High similarity does not imply safe remediation reuse. Resonance evaluates runtime & schema drift before execution.</span>
              </div>
            </div>

            {/* Hindsight Cloud Live Badge */}
            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="flex items-center gap-2.5 rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/60 px-3.5 py-1.5 text-xs shadow-sm">
                <ThinkingOrb state={hindsightStatus === "CONNECTED" ? "connecting" : "breathing"} size={20} theme={theme === "dark" ? "dark" : "light"} />
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                    Hindsight Cloud
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">·</span>
                  <span className="font-sans text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Connected
                  </span>
                </div>
              </div>

              {/* Scenario Presets */}
              <div className="flex flex-wrap items-center gap-2">
                {presets.map((preset) => {
                  const info = getPresetScenario(preset.id, preset.name);
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => loadPreset(preset)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white dark:border-cyan-500/80 dark:bg-slate-800 dark:text-cyan-200 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <span>{info.title}</span>
                      <span className={`rounded px-1.5 py-0.2 text-[9px] font-medium border ${info.badgeColor}`}>
                        {info.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </BorderBeam>

      {/* SECTION 1: ACTIVE INCIDENT CONTEXT */}
      <form onSubmit={handleRunAnalysis} className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0f1422]/80 p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-6 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sky-700 dark:text-cyan-400">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Active Incident Telemetry & Runtime State
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Specify observed error signatures, infrastructure versions, and recent operational changes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 px-3 py-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Target:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{service}</span>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="text-sky-700 dark:text-cyan-400 font-medium">{environment}</span>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div>
            <label className="font-medium text-slate-700 dark:text-slate-300">Service Name</label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 font-sans text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-medium text-slate-700 dark:text-slate-300">Observed Symptoms & Error Signatures</label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 font-sans text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 dark:text-slate-300">Kubernetes Version</label>
            <input
              type="text"
              value={kubernetesVersion}
              onChange={(e) => setKubernetesVersion(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 font-mono text-sm text-slate-900 dark:text-slate-100 focus:border-cyan-500 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 dark:text-slate-300">Database & Connection Proxy</label>
            <input
              type="text"
              value={databaseVersion}
              onChange={(e) => setDatabaseVersion(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 font-mono text-sm text-slate-900 dark:text-slate-100 focus:border-cyan-500 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 dark:text-slate-300">Deployment Version</label>
            <input
              type="text"
              value={deploymentVersion}
              onChange={(e) => setDeploymentVersion(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 font-mono text-sm text-slate-900 dark:text-slate-100 focus:border-cyan-500 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="md:col-span-3">
            <label className="font-medium text-slate-700 dark:text-slate-300">Recent Operational / Schema Changes</label>
            <input
              type="text"
              value={recentChanges}
              onChange={(e) => setRecentChanges(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 font-sans text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:bg-white focus:outline-none"
              required
            />
          </div>

        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-sky-700 dark:text-cyan-400 shrink-0" />
            <span>Associative recall from Hindsight Cloud + Resonance deterministic applicability evaluation</span>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="flex items-center gap-2.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-r dark:from-cyan-600 dark:via-sky-600 dark:to-indigo-600 dark:hover:from-cyan-500 dark:hover:to-indigo-500 px-7 py-3 text-xs font-bold text-white uppercase tracking-wider shadow-md hover:scale-105 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <ThinkingOrb state="searching" size={20} theme={theme === "dark" ? "dark" : "light"} />
                <span>Evaluating Precedents & Applicability...</span>
              </>
            ) : (
              <>
                <Cpu className="h-4 w-4" />
                <span>Evaluate Incident Applicability</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Banner */}
      {outcomeSuccessMessage && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{outcomeSuccessMessage}</span>
        </div>
      )}

      {/* SECTION 2: DYNAMIC ANALYSIS RESULTS */}
      {analysisResult && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Visual Downward Flow Indicator: Hindsight Cloud Recall */}
          <div className="flex flex-col items-center justify-center gap-2 py-1">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 px-4 py-1.5 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-sky-700 dark:text-cyan-400" />
              <span>Hindsight Cloud Recalled Precedent:</span>
              <span className="font-semibold text-sky-800 dark:text-cyan-300">
                {analysisResult.primary_precedent?.id || "INC-101"} — {analysisResult.primary_precedent?.title || "Payment API Connection Pool Exhaustion"}
              </span>
            </div>
            <ArrowDown className="h-4 w-4 text-sky-600 dark:text-cyan-400/80 animate-bounce mt-0.5" />
          </div>

          {/* DUAL SCORE VISUALIZATION (Visual Centerpiece) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Resonance Decision Intelligence
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                Incident Ref: <span className="text-sky-700 dark:text-cyan-400 font-semibold">{analysisResult.incident_id}</span>
              </span>
            </div>

            <ScoreCard
              similarity={analysisResult.similarity_score}
              applicability={analysisResult.applicability_score}
              riskLevel={analysisResult.risk_level}
              verdict={analysisResult.verdict}
            />
          </div>

          {/* SECTION 3: RECALLED PRECEDENTS & COMPATIBILITY ANALYSIS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 1/3: Historical Precedents Recalled from Hindsight Cloud */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-sky-700 dark:text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Recalled Experience Precedents ({analysisResult.recalled_precedents.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                  ● Hindsight Cloud
                </span>
              </div>

              {analysisResult.primary_precedent && (
                <HistoricalIncident
                  match={analysisResult.primary_precedent}
                  isPrimary={true}
                />
              )}

              {analysisResult.recalled_precedents.slice(1, 3).map((match) => (
                <HistoricalIncident key={match.id} match={match} />
              ))}
            </div>

            {/* Right 2/3: Compatibility Analysis & Evidence Matrix */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-700 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Precedent Compatibility Analysis & Drift Matrix
                </h3>
              </div>

              <ApplicabilityPanel
                primaryPrecedent={analysisResult.primary_precedent}
                environmentDiffs={analysisResult.environment_diff}
                supportingEvidence={analysisResult.supporting_evidence}
                conflictingEvidence={analysisResult.conflicting_evidence}
              />
            </div>

          </div>

          {/* SECTION 4: RECOMMENDATION PANEL & HUMAN APPROVAL CONTROLS */}
          <RecommendationCard
            recommendation={analysisResult.recommendation}
            onDecision={handleDecision}
            decisionStatus={decisionStatus}
            onTriggerOutcomeModal={() => setIsOutcomeModalOpen(true)}
            applicabilityScore={analysisResult.applicability_score}
          />

        </div>
      )}

      {/* Outcome Recording Modal */}
      <OutcomeModal
        isOpen={isOutcomeModalOpen}
        onClose={() => setIsOutcomeModalOpen(false)}
        onSubmit={handleOutcomeSubmit}
        service={service}
      />

    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center text-slate-400 text-xs">
        Loading Incident Decision Command...
      </div>
    }>
      <AnalyzeContent />
    </Suspense>
  );
}
