import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "resonance.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Incidents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        service TEXT NOT NULL,
        symptoms TEXT NOT NULL,
        environment TEXT,
        kubernetes_version TEXT,
        database_version TEXT,
        deployment_version TEXT,
        recent_changes TEXT,
        analysis_json TEXT
    )
    """)

    # Human decisions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS human_decisions (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        decision TEXT NOT NULL,
        selected_action TEXT NOT NULL,
        modified_action TEXT,
        rationale TEXT,
        operator_name TEXT,
        FOREIGN KEY(incident_id) REFERENCES incidents(id)
    )
    """)

    # Incident execution outcomes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incident_outcomes (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        outcome TEXT NOT NULL,
        recovery_time_minutes INTEGER,
        side_effects TEXT,
        lessons_learned TEXT,
        retained_to_hindsight BOOLEAN DEFAULT 1,
        FOREIGN KEY(incident_id) REFERENCES incidents(id)
    )
    """)

    # Synced Hindsight memories log
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hindsight_memories (
        id TEXT PRIMARY KEY,
        incident_id TEXT,
        memory_bank TEXT,
        retain_payload TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()


def save_incident_analysis(incident_id: str, incident_data: dict, analysis_data: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO incidents 
    (id, service, symptoms, environment, kubernetes_version, database_version, deployment_version, recent_changes, analysis_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        incident_id,
        incident_data.get("service"),
        incident_data.get("symptoms"),
        incident_data.get("environment"),
        incident_data.get("kubernetes_version"),
        incident_data.get("database_version"),
        incident_data.get("deployment_version"),
        incident_data.get("recent_changes"),
        json.dumps(analysis_data)
    ))
    conn.commit()
    conn.close()


def record_human_decision(decision_id: str, incident_id: str, decision_data: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO human_decisions (id, incident_id, decision, selected_action, modified_action, rationale, operator_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        decision_id,
        incident_id,
        decision_data.get("decision"),
        decision_data.get("selected_action"),
        decision_data.get("modified_action"),
        decision_data.get("rationale"),
        decision_data.get("operator_name")
    ))
    conn.commit()
    conn.close()


def record_incident_outcome(outcome_id: str, incident_id: str, outcome_data: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO incident_outcomes (id, incident_id, outcome, recovery_time_minutes, side_effects, lessons_learned, retained_to_hindsight)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        outcome_id,
        incident_id,
        outcome_data.get("outcome"),
        outcome_data.get("actual_recovery_time_minutes"),
        outcome_data.get("side_effects_observed"),
        outcome_data.get("lessons_learned"),
        1
    ))
    conn.commit()
    conn.close()


def get_experience_timeline() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT 
        i.id as incident_id,
        i.timestamp,
        i.service,
        i.symptoms,
        i.analysis_json,
        d.decision as human_decision,
        d.selected_action,
        d.modified_action,
        o.outcome as final_outcome,
        o.recovery_time_minutes,
        o.side_effects,
        o.lessons_learned
    FROM incidents i
    LEFT JOIN human_decisions d ON i.id = d.incident_id
    LEFT JOIN incident_outcomes o ON i.id = o.incident_id
    ORDER BY i.timestamp DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    timeline = []
    for r in rows:
        analysis = json.loads(r["analysis_json"]) if r["analysis_json"] else {}
        timeline.append({
            "id": r["incident_id"],
            "incident_id": r["incident_id"],
            "timestamp": r["timestamp"],
            "service": r["service"],
            "symptoms": r["symptoms"],
            "similarity_score": analysis.get("similarity_score", 0),
            "applicability_score": analysis.get("applicability_score", 0),
            "historical_precedent_id": analysis.get("primary_precedent", {}).get("id") if analysis.get("primary_precedent") else None,
            "recommended_action": analysis.get("recommendation", {}).get("action", "Under Analysis"),
            "human_decision": r["human_decision"] or "Pending",
            "executed_action": r["modified_action"] if r["modified_action"] else (r["selected_action"] or analysis.get("recommendation", {}).get("action", "N/A")),
            "outcome": r["final_outcome"] or "Pending",
            "recovery_time_minutes": r["recovery_time_minutes"],
            "retained_to_hindsight": True,
            "feedback_notes": r["lessons_learned"] or r["side_effects"]
        })
    return timeline
