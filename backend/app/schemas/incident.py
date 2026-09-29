from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class IncidentInput(BaseModel):
    service: str = Field(..., json_schema_extra={"example": "Payment API"})
    symptoms: str = Field(..., json_schema_extra={"example": "Latency 8.4s, Error Rate 21% on POST /v1/charges"})
    environment: str = Field(default="Production", json_schema_extra={"example": "Production"})
    kubernetes_version: str = Field(default="1.28", json_schema_extra={"example": "1.28"})
    database_version: str = Field(default="PostgreSQL 15 (PgBouncer)", json_schema_extra={"example": "PostgreSQL 15 (PgBouncer)"})
    deployment_version: str = Field(default="5.4.1", json_schema_extra={"example": "5.4.1"})
    recent_changes: str = Field(default="Database migration executed 34 minutes ago", json_schema_extra={"example": "Database migration executed 34 minutes ago"})
    raw_description: Optional[str] = None


class EvidenceItem(BaseModel):
    category: str
    description: str
    is_positive: bool
    impact_score: float


class HistoricalIncidentMatch(BaseModel):
    id: str
    title: str
    service: str
    environment: str
    symptoms: str
    root_cause: str
    kubernetes_version: str
    database_version: str
    deployment_version: str
    recent_changes: str
    action_taken: str
    outcome: str
    side_effects: Optional[str] = None
    recovery_time_minutes: Optional[int] = None
    similarity_score: int
    applicability_score: int
    risk_level: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    supporting_evidence: List[str] = []
    conflicting_evidence: List[str] = []
    penalty_breakdown: Dict[str, int] = {}
    base_score: int = 0
    safe_to_reuse: bool = False


class EnvironmentDiffItem(BaseModel):
    attribute: str
    current: str
    historical: str
    is_conflict: bool
    risk_note: Optional[str] = None


class RecommendationPayload(BaseModel):
    action: str
    confidence: int  # 0-100
    risk_level: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    summary: str
    precedent_action_advised: bool
    alternative_action_advised: Optional[str] = None
    reasoning_points: List[str] = []


class AnalysisResult(BaseModel):
    incident_id: str
    current_incident: IncidentInput
    primary_precedent: Optional[HistoricalIncidentMatch] = None
    recalled_precedents: List[HistoricalIncidentMatch] = []
    similarity_score: int
    applicability_score: int
    risk_level: str
    verdict: str  # "SAFE TO REUSE" | "DO NOT REUSE" | "REUSE WITH MODIFICATION"
    recommendation: RecommendationPayload
    supporting_evidence: List[str] = []
    conflicting_evidence: List[str] = []
    rejected_precedents: List[str] = []
    environment_diff: List[EnvironmentDiffItem] = []
    hindsight_memory_bank: str = "resonance-incidents"
    hindsight_recalled_count: int = 0
    timestamp: str


class HumanDecisionRequest(BaseModel):
    decision: str  # "Approved", "Rejected", "Modified"
    selected_action: str
    modified_action: Optional[str] = None
    rationale: Optional[str] = None
    operator_name: Optional[str] = "Lead SRE"


class OutcomeRecordingRequest(BaseModel):
    outcome: str  # "Success", "Partial Success", "Failure"
    actual_recovery_time_minutes: Optional[int] = 5
    side_effects_observed: Optional[str] = "None"
    lessons_learned: Optional[str] = None


class ExperienceTimelineItem(BaseModel):
    id: str
    incident_id: str
    timestamp: str
    service: str
    symptoms: str
    similarity_score: int
    applicability_score: int
    historical_precedent_id: Optional[str] = None
    recommended_action: str
    human_decision: str
    executed_action: str
    outcome: Optional[str] = "Pending"
    retained_to_hindsight: bool = True
    feedback_notes: Optional[str] = None
