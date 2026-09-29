from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from ..schemas.incident import (
    IncidentInput,
    AnalysisResult,
    HumanDecisionRequest,
    OutcomeRecordingRequest
)
from ..services.decision_engine import decision_engine
from ..services.outcome_service import outcome_service
from ..models.database import save_incident_analysis, get_db_connection

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


@router.post("/analyze", response_model=AnalysisResult)
async def analyze_incident(incident: IncidentInput):
    """
    Main incident analysis endpoint:
    Recalls Hindsight precedents, executes deterministic applicability calculations,
    and returns similarity vs applicability verdict.
    """
    try:
        result = await decision_engine.analyze_incident(incident)
        # Save to SQLite database
        save_incident_analysis(result.incident_id, incident.model_dump(), result.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Incident analysis failed: {str(e)}")


@router.post("/{incident_id}/decision")
async def record_decision(incident_id: str, request: HumanDecisionRequest):
    """
    Records human SRE decision: APPROVE, REJECT, or MODIFY.
    """
    try:
        res = await outcome_service.handle_human_decision(incident_id, request)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record decision: {str(e)}")


@router.post("/{incident_id}/outcome")
async def record_outcome(incident_id: str, request: OutcomeRecordingRequest):
    """
    Records incident resolution outcome and retains learned experience into Hindsight.
    """
    try:
        res = await outcome_service.handle_incident_outcome(incident_id, request)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record outcome: {str(e)}")


@router.get("/history")
async def get_incident_history():
    """
    Fetches all historical incidents analyzed by Resonance.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents ORDER BY timestamp DESC LIMIT 50")
    rows = cursor.fetchall()
    conn.close()
    
    import json
    return [
        {
            "id": r["id"],
            "timestamp": r["timestamp"],
            "service": r["service"],
            "symptoms": r["symptoms"],
            "environment": r["environment"],
            "kubernetes_version": r["kubernetes_version"],
            "database_version": r["database_version"],
            "deployment_version": r["deployment_version"],
            "recent_changes": r["recent_changes"],
            "analysis": json.loads(r["analysis_json"]) if r["analysis_json"] else None
        }
        for r in rows
    ]


@router.get("/presets")
async def get_demo_presets() -> List[Dict[str, Any]]:
    """
    Guided Incident Scenario Presets.
    """
    return [
        {
            "id": "killer-demo",
            "name": "Flagship Scenario: Schema Migration Drift (Divergent)",
            "tagline": "Payment API latency with database migration & PgBouncer conflict",
            "badge": "DIVERGENT RISK",
            "payload": {
                "service": "Payment API",
                "symptoms": "Latency 8.4s, Error Rate 21% on POST /v1/charges with pool timeout exceptions",
                "environment": "Production",
                "kubernetes_version": "1.28",
                "database_version": "PostgreSQL 15 (PgBouncer)",
                "deployment_version": "5.4.1",
                "recent_changes": "Database migration executed 34 minutes ago"
            }
        },
        {
            "id": "safe-reuse-demo",
            "name": "Baseline Scenario: Capacity Surge Pattern (Safe)",
            "tagline": "Payment API flash surge matching historical capacity pattern",
            "badge": "SAFE TO REUSE",
            "payload": {
                "service": "Payment API",
                "symptoms": "Latency 8.4s, Error Rate 21% on POST /v1/charges with pool timeout exceptions",
                "environment": "Production",
                "kubernetes_version": "1.24",
                "database_version": "PostgreSQL 12",
                "deployment_version": "4.8.0",
                "recent_changes": "Traffic surge from flash sale campaign"
            }
        },
        {
            "id": "kafka-lag-demo",
            "name": "Extended Scenario: Kafka Partition Rebalance Hazard",
            "tagline": "Kafka lag spike where naive pod scaling crashes partition assignments",
            "badge": "ARCHITECTURAL HAZARD",
            "payload": {
                "service": "Order Processing Service",
                "symptoms": "Consumer lag exceeded 450,000 messages, checkout confirmation delayed 5m",
                "environment": "Production",
                "kubernetes_version": "1.29",
                "database_version": "Kafka 3.6",
                "deployment_version": "4.8.0",
                "recent_changes": "Topic partition count reconfigured down to 16"
            }
        }
    ]
