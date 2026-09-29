import uuid
from datetime import datetime
from typing import Dict, Any, List
from ..schemas.incident import HumanDecisionRequest, OutcomeRecordingRequest, ExperienceTimelineItem
from ..models.database import (
    record_human_decision,
    record_incident_outcome,
    get_experience_timeline,
    get_db_connection
)
from .hindsight_service import hindsight_service


class OutcomeService:
    """
    Manages the Human Feedback and Outcome Learning Loop.
    Feeds real resolution outcomes back into Hindsight experience memory.
    """

    async def handle_human_decision(self, incident_id: str, request: HumanDecisionRequest) -> Dict[str, Any]:
        decision_id = f"DEC-{uuid.uuid4().hex[:6].upper()}"
        record_human_decision(decision_id, incident_id, request.model_dump())
        
        return {
            "status": "recorded",
            "decision_id": decision_id,
            "incident_id": incident_id,
            "decision": request.decision,
            "selected_action": request.selected_action,
            "modified_action": request.modified_action
        }

    async def handle_incident_outcome(self, incident_id: str, request: OutcomeRecordingRequest) -> Dict[str, Any]:
        outcome_id = f"OUT-{uuid.uuid4().hex[:6].upper()}"
        record_incident_outcome(outcome_id, incident_id, request.model_dump())

        # Retrieve incident and decision context to retain into Hindsight
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
        inc_row = cursor.fetchone()
        cursor.execute("SELECT * FROM human_decisions WHERE incident_id = ? ORDER BY timestamp DESC LIMIT 1", (incident_id,))
        dec_row = cursor.fetchone()
        conn.close()

        # Retain new learned experience into Hindsight Memory Bank
        memory_payload = {
            "id": incident_id,
            "title": f"Learned Experience: {inc_row['service'] if inc_row else 'Service'} Incident",
            "service": inc_row["service"] if inc_row else "Unknown",
            "environment": inc_row["environment"] if inc_row else "Production",
            "symptoms": inc_row["symptoms"] if inc_row else "",
            "root_cause": request.lessons_learned or "Post-resolution analysis logged via Resonance feedback loop",
            "kubernetes_version": inc_row["kubernetes_version"] if inc_row else "1.28",
            "database_version": inc_row["database_version"] if inc_row else "PostgreSQL 15",
            "deployment_version": inc_row["deployment_version"] if inc_row else "5.4.1",
            "recent_changes": inc_row["recent_changes"] if inc_row else "None",
            "action_taken": dec_row["modified_action"] if dec_row and dec_row["modified_action"] else (dec_row["selected_action"] if dec_row else "Executed resolution"),
            "outcome": request.outcome,
            "side_effects": request.side_effects_observed,
            "recovery_time_minutes": request.actual_recovery_time_minutes,
            "human_decision": dec_row["decision"] if dec_row else "Recorded",
            "policy_version": "2024.2-resonance-learned",
            "retained_at": datetime.utcnow().isoformat() + "Z",
            "tags": ["learned-experience", "human-verified", inc_row["service"].lower() if inc_row else "service"]
        }

        retain_result = await hindsight_service.retain_incident(memory_payload)

        return {
            "status": "outcome_recorded_and_retained",
            "outcome_id": outcome_id,
            "incident_id": incident_id,
            "outcome": request.outcome,
            "hindsight_retention": retain_result
        }

    def get_timeline(self) -> List[Dict[str, Any]]:
        return get_experience_timeline()


outcome_service = OutcomeService()
