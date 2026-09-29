import os
import sys
import json
import time
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

load_dotenv()

from app.services.hindsight_service import hindsight_service

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "incidents.json"))


def seed_all_incidents():
    print(f"Loading synthetic incidents dataset from {DATA_PATH}...")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        incidents = json.load(f)

    health = hindsight_service.check_health()
    print(f"Target Memory Mode: {health['status']} | Bank ID: '{hindsight_service.bank_id}'")
    print(f"Beginning ingestion of {len(incidents)} production incidents into Hindsight Cloud...\n")

    retained_count = 0
    failed_count = 0

    for i, inc in enumerate(incidents, start=1):
        content_str = (
            f"Incident ID: {inc['id']}\n"
            f"Title: {inc['title']}\n"
            f"Service: {inc['service']}\n"
            f"Environment: {inc.get('environment', 'Production')}\n"
            f"Symptoms: {inc['symptoms']}\n"
            f"Root Cause: {inc['root_cause']}\n"
            f"Kubernetes Version: {inc.get('kubernetes_version', '1.28')}\n"
            f"Database Version: {inc.get('database_version', 'PostgreSQL 15')}\n"
            f"Deployment Version: {inc.get('deployment_version', '5.4.1')}\n"
            f"Recent Changes: {inc.get('recent_changes', 'None')}\n"
            f"Action Taken: {inc['action_taken']}\n"
            f"Outcome: {inc['outcome']}\n"
            f"Side Effects: {inc.get('side_effects', 'None')}\n"
            f"Policy Version: {inc.get('policy_version', '2024.1')}\n"
            f"Human Decision: {inc.get('human_decision', 'Approved')}"
        )

        metadata = {
            "incident_id": inc["id"],
            "service": inc["service"],
            "outcome": inc["outcome"],
            "kubernetes_version": str(inc.get("kubernetes_version", "1.28")),
            "database_version": str(inc.get("database_version", "PostgreSQL 15")),
            "deployment_version": str(inc.get("deployment_version", "5.4.1"))
        }

        tags = [
            inc["service"].lower().replace(" ", "-"),
            inc["outcome"].lower().replace(" ", "-"),
            "resonance-incident"
        ]

        try:
            res = hindsight_service._client.retain(
                bank_id=hindsight_service.bank_id,
                content=content_str,
                document_id=inc["id"],
                metadata=metadata,
                tags=tags
            )
            retained_count += 1
            print(f"[{i:02d}/40] Retained {inc['id']}: {inc['title']} ({inc['service']} -> {inc['outcome']})")
        except Exception as e:
            failed_count += 1
            print(f"[{i:02d}/40] Error retaining {inc['id']}: {e}")

        # Short pause to prevent remote server transaction lock contention
        time.sleep(0.35)

    print(f"\n==========================================")
    print(f"Seeding Complete:")
    print(f" - Successfully Retained: {retained_count}/{len(incidents)}")
    print(f" - Failed: {failed_count}")
    print(f" - Memory Mode: {health['status']}")
    print(f" - Memory Bank: {hindsight_service.bank_id}")
    print(f"==========================================")


if __name__ == "__main__":
    seed_all_incidents()
