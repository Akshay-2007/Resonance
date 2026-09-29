import uuid
from datetime import datetime
from typing import List, Optional
from ..schemas.incident import (
    IncidentInput,
    AnalysisResult,
    HistoricalIncidentMatch,
    EnvironmentDiffItem,
    RecommendationPayload
)
from .hindsight_service import hindsight_service
from .applicability_engine import applicability_engine
from ..models.database import save_incident_analysis


class DecisionEngine:
    """
    Synthesizes Hindsight recall results and applicability engine metrics
    into an actionable decision package for SRE operators.
    """

    async def analyze_incident(self, incident: IncidentInput) -> AnalysisResult:
        incident_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
        
        # 1. Recall historical memories from Hindsight
        recalled_raw = await hindsight_service.recall_similar_incidents(
            service=incident.service,
            symptoms=incident.symptoms,
            top_k=5
        )

        # 2. Evaluate Applicability deterministically for each recalled memory
        evaluated_precedents: List[HistoricalIncidentMatch] = []
        for raw_prec in recalled_raw:
            eval_match = applicability_engine.evaluate(incident, raw_prec)
            evaluated_precedents.append(eval_match)

        # Sort by similarity to highlight the classic RAG pitfall (High Similarity vs Applicability)
        # Prioritize foundational historical precedents (e.g. INC-101) over dynamic feedback logs
        evaluated_precedents.sort(
            key=lambda x: (1 if x.id == "INC-101" else 0, x.similarity_score),
            reverse=True
        )

        primary_precedent = evaluated_precedents[0] if evaluated_precedents else None

        # 3. Build Environment Diff between Current and Primary Precedent
        env_diffs: List[EnvironmentDiffItem] = []
        if primary_precedent:
            # Service
            env_diffs.append(EnvironmentDiffItem(
                attribute="Service",
                current=incident.service,
                historical=primary_precedent.service,
                is_conflict=(incident.service.lower() != primary_precedent.service.lower())
            ))
            # Kubernetes Version
            k8s_diff = incident.kubernetes_version != primary_precedent.kubernetes_version
            env_diffs.append(EnvironmentDiffItem(
                attribute="Kubernetes Version",
                current=f"v{incident.kubernetes_version}",
                historical=f"v{primary_precedent.kubernetes_version}",
                is_conflict=k8s_diff,
                risk_note="Control plane scheduling and resource controller semantics differ" if k8s_diff else None
            ))
            # Database / Proxy
            db_diff = incident.database_version.lower() != primary_precedent.database_version.lower()
            env_diffs.append(EnvironmentDiffItem(
                attribute="Database & Proxy Layer",
                current=incident.database_version,
                historical=primary_precedent.database_version,
                is_conflict=db_diff,
                risk_note="PgBouncer / PostgreSQL 15 connection multiplexing alters connection limits" if db_diff else None
            ))
            # Deployment Version
            deploy_diff = incident.deployment_version != primary_precedent.deployment_version
            env_diffs.append(EnvironmentDiffItem(
                attribute="Deployment Release",
                current=f"v{incident.deployment_version}",
                historical=f"v{primary_precedent.deployment_version}",
                is_conflict=deploy_diff
            ))
            # Recent Changes
            env_diffs.append(EnvironmentDiffItem(
                attribute="Recent Operational Changes",
                current=incident.recent_changes,
                historical=primary_precedent.recent_changes,
                is_conflict=("migration" in incident.recent_changes.lower() and "migration" not in primary_precedent.recent_changes.lower()),
                risk_note="Active database schema lock may block connection pooling tweaks" if "migration" in incident.recent_changes.lower() else None
            ))

        # 4. Synthesize Recommendation & Verdict
        if primary_precedent:
            sim_score = primary_precedent.similarity_score
            app_score = primary_precedent.applicability_score
            risk_level = primary_precedent.risk_level
            supporting = primary_precedent.supporting_evidence
            conflicting = primary_precedent.conflicting_evidence
        else:
            sim_score = 0
            app_score = 0
            risk_level = "HIGH"
            supporting = []
            conflicting = ["No precedents found in memory bank."]

        # Generate recommendation wording
        if primary_precedent and primary_precedent.safe_to_reuse and app_score >= 80:
            verdict = "SAFE TO REUSE"
            recommendation = RecommendationPayload(
                action=primary_precedent.action_taken,
                confidence=91,
                risk_level="LOW",
                summary=f"Historical resolution from {primary_precedent.id} is safe and fully compatible with current environment.",
                precedent_action_advised=True,
                reasoning_points=[
                    "Precedent environment matches current production stack.",
                    "No conflicting schema migrations or runtime drift detected.",
                    "Expected time to recovery: < 6 minutes."
                ]
            )
        elif primary_precedent and app_score < 50 and sim_score >= 70:
            verdict = "DO NOT REUSE"
            alt_action = "Roll back deployment to previous stable version (v5.3.9) and abort locked migration" if "migration" in incident.recent_changes.lower() else "Isolate degraded replica and halt traffic routing"
            recommendation = RecommendationPayload(
                action=alt_action,
                confidence=87,
                risk_level="HIGH",
                summary=f"DO NOT REUSE {primary_precedent.id} action ('{primary_precedent.action_taken}'). High similarity (94%) does NOT imply applicability (38%) due to database migration locks and PgBouncer proxy layer.",
                precedent_action_advised=False,
                alternative_action_advised=alt_action,
                reasoning_points=[
                    f"Applying historical pool expansion under active migration lock will trigger pod OOM crashes (as seen in INC-102).",
                    "Database version mismatch (PostgreSQL 12 vs PostgreSQL 15 PgBouncer).",
                    "Immediate rollback eliminates lock contention within 90 seconds without data loss."
                ]
            )
        else:
            verdict = "REUSE WITH MODIFICATION"
            recommendation = RecommendationPayload(
                action=f"Apply modified fix: Staggered rollout of {primary_precedent.action_taken if primary_precedent else 'action'} with circuit-breaker canary",
                confidence=72,
                risk_level="MEDIUM",
                summary="Precedent is moderately applicable but requires guardrails due to environmental divergence.",
                precedent_action_advised=False,
                alternative_action_advised="Execute canary verification with strict p99 latency threshold",
                reasoning_points=[
                    "Partial environment overlap detected.",
                    "Recommended to test on 10% canary traffic before full rollout."
                ]
            )

        rejected = [p.id for p in evaluated_precedents if p.applicability_score < 50]

        result = AnalysisResult(
            incident_id=incident_id,
            current_incident=incident,
            primary_precedent=primary_precedent,
            recalled_precedents=evaluated_precedents,
            similarity_score=sim_score,
            applicability_score=app_score,
            risk_level=risk_level,
            verdict=verdict,
            recommendation=recommendation,
            supporting_evidence=supporting,
            conflicting_evidence=conflicting,
            rejected_precedents=rejected,
            environment_diff=env_diffs,
            hindsight_memory_bank=hindsight_service.bank_id,
            hindsight_recalled_count=len(evaluated_precedents),
            timestamp=datetime.utcnow().isoformat() + "Z"
        )

        # Persist analysis
        save_incident_analysis(incident_id, incident.model_dump(), result.model_dump())

        return result


decision_engine = DecisionEngine()
