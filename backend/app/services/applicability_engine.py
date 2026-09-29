import re
from typing import Dict, Any, List, Tuple
from ..schemas.incident import IncidentInput, HistoricalIncidentMatch, EnvironmentDiffItem


class ApplicabilityEngine:
    """
    Deterministic Experience-Aware Incident Applicability Engine.
    
    Separates Semantic Similarity (S) from Operational Applicability (A).
    Ensures high similarity incidents that are dangerous or obsolete are penalized.
    """

    # Transparent Weights (Total = 100)
    WEIGHTS = {
        "symptom_similarity": 15,
        "root_cause_similarity": 20,
        "service_similarity": 10,
        "environment_compatibility": 15,
        "version_compatibility": 10,
        "recent_change_compatibility": 10,
        "historical_outcome": 10,
        "side_effect_risk": 5,
        "recency": 5
    }

    def evaluate(self, current: IncidentInput, precedent: Dict[str, Any]) -> HistoricalIncidentMatch:
        """
        Calculates similarity_score and applicability_score deterministically,
        generating evidence chips, penalty breakdowns, and environment diffs.
        """
        supporting_evidence: List[str] = []
        conflicting_evidence: List[str] = []
        penalties: Dict[str, int] = {}

        # 1. Service Similarity (0.0 to 1.0)
        curr_svc = current.service.strip().lower()
        prec_svc = precedent.get("service", "").strip().lower()
        if curr_svc == prec_svc or curr_svc in prec_svc or prec_svc in curr_svc:
            svc_sim = 1.0
            supporting_evidence.append(f"Same service context: '{precedent.get('service')}'")
        else:
            svc_sim = 0.2
            conflicting_evidence.append(f"Service mismatch: Current is '{current.service}', precedent was '{precedent.get('service')}'")

        # 2. Symptom Similarity (0.0 to 1.0)
        curr_symp = current.symptoms.lower()
        prec_symp = precedent.get("symptoms", "").lower()
        token_overlap = self._calc_text_overlap(curr_symp, prec_symp)
        
        # Keyword alignment boost
        kw_matches = 0
        key_terms = ["latency", "error rate", "charges", "pool", "timeout", "exhaustion", "504", "503", "oom", "kafka", "redis", "lock", "migration"]
        for kw in key_terms:
            if kw in curr_symp and kw in prec_symp:
                kw_matches += 1
        kw_factor = min(1.0, kw_matches / 3.0) if kw_matches > 0 else token_overlap
        symptom_sim = min(1.0, (token_overlap * 0.4) + (kw_factor * 0.6))

        if symptom_sim >= 0.6:
            supporting_evidence.append("Symptom signature highly correlated (latency & error characteristics match)")
        elif symptom_sim >= 0.3:
            supporting_evidence.append("Partial symptom overlap with precedent incident")
        else:
            conflicting_evidence.append("Symptom patterns diverge significantly")

        # 3. Root Cause Similarity (0.0 to 1.0)
        prec_rc = precedent.get("root_cause", "").lower()
        rc_token_overlap = self._calc_text_overlap(curr_symp + " " + current.recent_changes.lower(), prec_rc)
        rc_kw_matches = 0
        for kw in ["connection pool", "pool", "saturation", "migration", "exhaustion", "lock", "kafka", "redis", "circuit breaker", "oom", "timeout"]:
            if (kw in curr_symp or kw in current.recent_changes.lower() or kw in current.symptoms.lower()) and (kw in prec_rc or kw in prec_symp):
                rc_kw_matches += 1
        rc_factor = min(1.0, rc_kw_matches / 2.0) if rc_kw_matches > 0 else rc_token_overlap
        rc_sim = min(1.0, (rc_token_overlap * 0.2) + (rc_factor * 0.8))

        if rc_sim >= 0.5:
            supporting_evidence.append(f"Root cause hypothesis aligns: '{precedent.get('root_cause')}'")

        # Calculate Combined Semantic Similarity (0-100)
        raw_similarity = (symptom_sim * 45.0) + (rc_sim * 35.0) + (svc_sim * 20.0)
        similarity_score = int(min(100, max(0, round(raw_similarity))))

        # 4. Environment Compatibility (0.0 to 1.0)
        curr_env = current.environment.lower()
        prec_env = precedent.get("environment", "").lower()
        env_compat = 1.0 if curr_env == prec_env else 0.5
        if curr_env == prec_env:
            supporting_evidence.append(f"Identical execution environment: {current.environment}")
        else:
            conflicting_evidence.append(f"Environment variance: Current {current.environment} vs Precedent {precedent.get('environment')}")

        # 5. Version & Runtime Compatibility (0.0 to 1.0)
        curr_k8s = current.kubernetes_version.strip()
        prec_k8s = precedent.get("kubernetes_version", "").strip()
        curr_db = current.database_version.strip().lower()
        prec_db = precedent.get("database_version", "").strip().lower()
        curr_deploy = current.deployment_version.strip()
        prec_deploy = precedent.get("deployment_version", "").strip()

        k8s_match = curr_k8s == prec_k8s
        db_match = (curr_db == prec_db) or (curr_db in prec_db) or (prec_db in curr_db)
        deploy_match = curr_deploy == prec_deploy

        version_compat = 1.0
        if not k8s_match:
            version_compat -= 0.35
            conflicting_evidence.append(f"Kubernetes version changed: {prec_k8s} → {curr_k8s}")
        if not db_match:
            version_compat -= 0.45
            conflicting_evidence.append(f"Database / Proxy layer changed: {precedent.get('database_version')} → {current.database_version}")
        if not deploy_match:
            version_compat -= 0.20
            conflicting_evidence.append(f"Deployment release changed: {prec_deploy} → {curr_deploy}")
        version_compat = max(0.0, version_compat)

        # 6. Recent Change Compatibility (0.0 to 1.0)
        curr_chg = current.recent_changes.lower()
        prec_chg = precedent.get("recent_changes", "").lower()
        recent_chg_compat = 1.0
        if "migration" in curr_chg and "migration" not in prec_chg:
            recent_chg_compat = 0.2
            conflicting_evidence.append(f"Current state has recent un-indexed migration '{current.recent_changes}' not present in precedent")
        elif "surge" in curr_chg and "surge" in prec_chg:
            recent_chg_compat = 1.0
            supporting_evidence.append("Traffic surge pattern matches historical precedent trigger")

        # 7. Historical Outcome Quality (0.0 to 1.0)
        outcome = precedent.get("outcome", "").capitalize()
        if outcome == "Success":
            hist_outcome_val = 1.0
            supporting_evidence.append(f"Precedent action '{precedent.get('action_taken')}' succeeded previously")
        elif outcome == "Partial Success":
            hist_outcome_val = 0.5
            conflicting_evidence.append(f"Precedent action had partial success with side effects: {precedent.get('side_effects')}")
        else:
            hist_outcome_val = 0.0
            conflicting_evidence.append(f"Precedent action previously FAILED: {precedent.get('side_effects')}")

        # 8. Side Effect Risk (0.0 to 1.0)
        side_effects = precedent.get("side_effects", "").lower()
        side_effect_val = 1.0
        if "oom" in side_effects or "crashed" in side_effects or "outage" in side_effects or "loss" in side_effects:
            side_effect_val = 0.0
            conflicting_evidence.append(f"Known severe side-effect risk: {precedent.get('side_effects')}")

        # 9. Recency (0.0 to 1.0)
        recency_val = 0.85

        # BASE APPLICABILITY CALCULATION
        base_score = (
            (symptom_sim * self.WEIGHTS["symptom_similarity"]) +
            (rc_sim * self.WEIGHTS["root_cause_similarity"]) +
            (svc_sim * self.WEIGHTS["service_similarity"]) +
            (env_compat * self.WEIGHTS["environment_compatibility"]) +
            (version_compat * self.WEIGHTS["version_compatibility"]) +
            (recent_chg_compat * self.WEIGHTS["recent_change_compatibility"]) +
            (hist_outcome_val * self.WEIGHTS["historical_outcome"]) +
            (side_effect_val * self.WEIGHTS["side_effect_risk"]) +
            (recency_val * self.WEIGHTS["recency"])
        )

        # EXPLICIT NEGATIVE PENALTIES
        total_penalty = 0

        # Penalty 1: Known failure in similar context
        if outcome == "Failure":
            penalties["Previous Fix Failed"] = -40
            total_penalty += 40

        # Penalty 2: DB engine/proxy migration conflict (e.g. PgBouncer or major postgres version change)
        if ("pgbouncer" in curr_db or "migration" in curr_chg) and ("postgres 12" in prec_db or "pool size" in precedent.get("action_taken", "").lower()):
            if "increase" in precedent.get("action_taken", "").lower() and "migration" in curr_chg:
                penalties["Incompatible Database Proxy Architecture"] = -25
                penalties["Unsafe Pool Expansion under Active Migration Lock"] = -15
                total_penalty += 40

        # Final Applicability Calculation (Pure Mathematical Derivation)
        raw_applicability = max(0, base_score - total_penalty)
        applicability_score = int(min(100, max(0, round(raw_applicability))))

        # Risk Classification
        if applicability_score >= 80 and outcome == "Success":
            risk_level = "LOW"
            safe_to_reuse = True
        elif applicability_score >= 55:
            risk_level = "MEDIUM"
            safe_to_reuse = False
        elif applicability_score >= 30:
            risk_level = "HIGH"
            safe_to_reuse = False
        else:
            risk_level = "CRITICAL"
            safe_to_reuse = False

        return HistoricalIncidentMatch(
            id=precedent.get("id", "INC-UNKNOWN"),
            title=precedent.get("title", "Historical Incident"),
            service=precedent.get("service", current.service),
            environment=precedent.get("environment", current.environment),
            symptoms=precedent.get("symptoms", ""),
            root_cause=precedent.get("root_cause", ""),
            kubernetes_version=precedent.get("kubernetes_version", "N/A"),
            database_version=precedent.get("database_version", "N/A"),
            deployment_version=precedent.get("deployment_version", "N/A"),
            recent_changes=precedent.get("recent_changes", "None"),
            action_taken=precedent.get("action_taken", ""),
            outcome=precedent.get("outcome", "Unknown"),
            side_effects=precedent.get("side_effects"),
            recovery_time_minutes=precedent.get("recovery_time_minutes"),
            similarity_score=similarity_score,
            applicability_score=applicability_score,
            risk_level=risk_level,
            supporting_evidence=supporting_evidence,
            conflicting_evidence=conflicting_evidence,
            penalty_breakdown=penalties,
            base_score=int(round(base_score)),
            safe_to_reuse=safe_to_reuse
        )

    def _calc_text_overlap(self, text_a: str, text_b: str) -> float:
        tokens_a = set(re.findall(r'\b\w+\b', text_a.lower()))
        tokens_b = set(re.findall(r'\b\w+\b', text_b.lower()))
        if not tokens_a or not tokens_b:
            return 0.0
        intersection = tokens_a.intersection(tokens_b)
        union = tokens_a.union(tokens_b)
        return len(intersection) / float(len(union))


# Singleton instance
applicability_engine = ApplicabilityEngine()
