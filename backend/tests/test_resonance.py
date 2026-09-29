import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas.incident import IncidentInput, HumanDecisionRequest, OutcomeRecordingRequest
from app.services.applicability_engine import applicability_engine
from app.services.decision_engine import decision_engine
from app.services.outcome_service import outcome_service
from app.services.hindsight_service import hindsight_service
from app.models.database import init_db


@pytest.fixture(autouse=True)
def setup_db():
    init_db()


def test_killer_demo_similarity_vs_applicability():
    """
    Test the flagship Hackathon premise:
    High similarity (94%) does NOT equal high applicability (38%)
    when the database architecture and migration environment have changed.
    """
    current_incident = IncidentInput(
        service="Payment API",
        symptoms="Latency 8.4s, Error Rate 21% on POST /v1/charges with pool timeout exceptions",
        environment="Production",
        kubernetes_version="1.28",
        database_version="PostgreSQL 15 (PgBouncer)",
        deployment_version="5.4.1",
        recent_changes="Database migration executed 34 minutes ago"
    )

    historical_precedent = {
        "id": "INC-101",
        "title": "Payment API Connection Pool Exhaustion",
        "service": "Payment API",
        "environment": "Production",
        "symptoms": "High latency (8.4s) and 21% error rate on POST /v1/charges with pool timeout exceptions",
        "root_cause": "Database connection pool saturated during traffic burst",
        "kubernetes_version": "1.24",
        "database_version": "PostgreSQL 12",
        "deployment_version": "4.8.0",
        "recent_changes": "Traffic surge from flash sale campaign",
        "action_taken": "Increased connection pool size from 50 to 200 and restarted pods",
        "outcome": "Success",
        "side_effects": "None"
    }

    match = applicability_engine.evaluate(current_incident, historical_precedent)

    assert match.similarity_score >= 85, f"Expected >=85% similarity, got {match.similarity_score}"
    assert match.applicability_score < 50, f"Expected <50% applicability, got {match.applicability_score}"
    assert match.risk_level in ["HIGH", "CRITICAL"]
    assert match.safe_to_reuse is False
    assert len(match.conflicting_evidence) > 0
    assert "PgBouncer" in str(match.conflicting_evidence) or "Database" in str(match.conflicting_evidence)


def test_safe_reuse_scenario():
    """
    Test safe precedent reuse when environment and root causes are fully compatible.
    """
    current_incident = IncidentInput(
        service="Payment API",
        symptoms="Latency 8.4s, Error Rate 21% on POST /v1/charges with pool timeout exceptions",
        environment="Production",
        kubernetes_version="1.24",
        database_version="PostgreSQL 12",
        deployment_version="4.8.0",
        recent_changes="Traffic surge from flash sale campaign"
    )

    historical_precedent = {
        "id": "INC-101",
        "title": "Payment API Connection Pool Exhaustion",
        "service": "Payment API",
        "environment": "Production",
        "symptoms": "High latency (8.4s) and 21% error rate on POST /v1/charges with pool timeout exceptions",
        "root_cause": "Database connection pool saturated during traffic burst",
        "kubernetes_version": "1.24",
        "database_version": "PostgreSQL 12",
        "deployment_version": "4.8.0",
        "recent_changes": "Traffic surge from flash sale campaign",
        "action_taken": "Increased connection pool size from 50 to 200 and restarted pods",
        "outcome": "Success",
        "side_effects": "None"
    }

    match = applicability_engine.evaluate(current_incident, historical_precedent)

    assert match.similarity_score >= 85
    assert match.applicability_score >= 85
    assert match.safe_to_reuse is True
    assert match.risk_level == "LOW"


@pytest.mark.asyncio
async def test_full_decision_flow_and_learning_loop():
    """
    Test the complete autonomous decision engine and human feedback retention loop.
    """
    incident = IncidentInput(
        service="Payment API",
        symptoms="Latency 8.4s, Error Rate 21% on POST /v1/charges with pool timeout exceptions",
        environment="Production",
        kubernetes_version="1.28",
        database_version="PostgreSQL 15 (PgBouncer)",
        deployment_version="5.4.1",
        recent_changes="Database migration executed 34 minutes ago"
    )

    # 1. Analyze
    analysis = await decision_engine.analyze_incident(incident)
    assert analysis.similarity_score >= 85
    assert analysis.applicability_score < 50
    assert analysis.verdict == "DO NOT REUSE"
    assert "Roll back" in analysis.recommendation.action

    # 2. Human Approval
    dec_res = await outcome_service.handle_human_decision(
        incident_id=analysis.incident_id,
        request=HumanDecisionRequest(
            decision="Approved",
            selected_action=analysis.recommendation.action,
            rationale="Approved rollback to clear schema lock safely."
        )
    )
    assert dec_res["status"] == "recorded"

    # 3. Outcome Logging & Hindsight Retention
    out_res = await outcome_service.handle_incident_outcome(
        incident_id=analysis.incident_id,
        request=OutcomeRecordingRequest(
            outcome="Success",
            actual_recovery_time_minutes=3,
            side_effects_observed="Zero data corruption, latency normalized in 90s.",
            lessons_learned="Rollback safely avoided PgBouncer OOM cascade."
        )
    )
    assert out_res["status"] == "outcome_recorded_and_retained"

    # 4. Check Timeline
    timeline = outcome_service.get_timeline()
    assert len(timeline) >= 1
    latest = timeline[0]
    assert latest["incident_id"] == analysis.incident_id
