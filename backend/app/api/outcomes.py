from fastapi import APIRouter
from typing import List, Dict, Any
from ..services.outcome_service import outcome_service

router = APIRouter(prefix="/api/outcomes", tags=["outcomes"])


@router.get("/timeline")
async def get_timeline() -> List[Dict[str, Any]]:
    """
    Returns the Experience Timeline showing how Resonance learned across incidents,
    human overrides, and real operational outcomes.
    """
    return outcome_service.get_timeline()
