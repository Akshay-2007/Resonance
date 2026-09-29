"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { getTimeline, TimelineItem } from "@/lib/api";
import ExperienceTimeline from "@/components/ExperienceTimeline";

export default function LearningPage() {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeline = () => {
    setIsLoading(true);
    getTimeline()
      .then((data) => {
        if (data && data.length > 0) {
          setTimeline(data);
        } else {
          // Pre-populate with realistic learning loop demo data
          setTimeline([
            {
              id: "EVT-1",
              incident_id: "INC-8A91B2",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              service: "Payment API",
              symptoms: "Latency 8.4s, Error Rate 21% on POST /v1/charges with pool timeout exceptions",
              similarity_score: 94,
              applicability_score: 38,
              historical_precedent_id: "INC-101",
              recommended_action: "Roll back deployment to v5.3.9 and abort pending migration transaction",
              human_decision: "Approved",
              executed_action: "Roll back deployment to v5.3.9 and abort pending migration transaction",
              outcome: "Success",
              recovery_time_minutes: 3,
              retained_to_hindsight: true,
              feedback_notes: "Rollback eliminated PgBouncer lock contention in 90 seconds without OOM crashes."
            },
            {
              id: "EVT-2",
              incident_id: "INC-4C10D8",
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              service: "Order Processing Service",
              symptoms: "Consumer lag exceeded 450,000 messages, checkout confirmation delayed 5m",
              similarity_score: 89,
              applicability_score: 42,
              historical_precedent_id: "INC-108",
              recommended_action: "Do NOT scale to 32 pods; scale to max 16 pods matching topic partition count",
              human_decision: "Approved",
              executed_action: "Scaled consumer pods to 16 and increased timeout buffer",
              outcome: "Success",
              recovery_time_minutes: 6,
              retained_to_hindsight: true,
              feedback_notes: "Prevented perpetual partition rebalancing storm seen in INC-109."
            },
            {
              id: "EVT-3",
              incident_id: "INC-3F88E1",
              timestamp: new Date(Date.now() - 172800000).toISOString(),
              service: "Search Service",
              symptoms: "Elasticsearch heap saturation and GC pauses during high cardinality query spike",
              similarity_score: 92,
              applicability_score: 88,
              historical_precedent_id: "INC-115",
              recommended_action: "Disable fielddata on text fields and engage indices.breaker.fielddata.limit: 40%",
              human_decision: "Approved",
              executed_action: "Disabled fielddata on high-cardinality text fields",
              outcome: "Success",
              recovery_time_minutes: 5,
              retained_to_hindsight: true,
              feedback_notes: "Heap dropped from 94% to 55% immediately."
            }
          ]);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Learning Narrative Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-indigo-500/30 bg-white dark:bg-gradient-to-r dark:from-[#0e1628] dark:via-[#12142e] dark:to-[#0e1628] p-8 shadow-sm dark:shadow-xl transition-colors">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Autonomous Calibration & Feedback Ingestion</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            The Continuous Experience Learning Loop
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Resonance doesn't stay static. Every human approval, modification, and post-resolution outcome is retained into Hindsight to dynamically tune applicability penalties and improve future SRE decision confidence.
          </p>
        </div>
      </div>

      {/* Timeline Component */}
      <ExperienceTimeline timeline={timeline} onRefresh={fetchTimeline} />

    </div>
  );
}
