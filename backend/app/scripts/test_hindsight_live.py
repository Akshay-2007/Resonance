import os
import sys
import json
from dotenv import load_dotenv
from hindsight_client import Hindsight

load_dotenv()

api_url = os.getenv("HINDSIGHT_API_URL", "https://api.hindsight.vectorize.io")
api_key = os.getenv("HINDSIGHT_API_KEY")
bank_id = os.getenv("HINDSIGHT_BANK_ID", "resonance-incidents")

print("Initializing live Hindsight client...")
client = Hindsight(base_url=api_url, api_key=api_key)

# 1. Retain test
test_payload = {
    "id": "INC-101-TEST",
    "title": "Payment API Connection Pool Exhaustion",
    "service": "Payment API",
    "symptoms": "High latency (8.4s) and 21% error rate on POST /v1/charges with pool timeout exceptions",
    "root_cause": "Database connection pool saturated during traffic burst",
    "kubernetes_version": "1.24",
    "database_version": "PostgreSQL 12",
    "deployment_version": "4.8.0",
    "recent_changes": "Traffic surge from flash sale campaign",
    "action_taken": "Increased connection pool size from 50 to 200 and restarted pods",
    "outcome": "Success",
    "side_effects": "None. Latency returned to 120ms within 4 minutes."
}

content_str = (
    f"Incident ID: {test_payload['id']}\n"
    f"Title: {test_payload['title']}\n"
    f"Service: {test_payload['service']}\n"
    f"Environment: Production\n"
    f"Symptoms: {test_payload['symptoms']}\n"
    f"Root Cause: {test_payload['root_cause']}\n"
    f"Kubernetes Version: {test_payload['kubernetes_version']}\n"
    f"Database Version: {test_payload['database_version']}\n"
    f"Deployment Version: {test_payload['deployment_version']}\n"
    f"Recent Changes: {test_payload['recent_changes']}\n"
    f"Action Taken: {test_payload['action_taken']}\n"
    f"Outcome: {test_payload['outcome']}\n"
    f"Side Effects: {test_payload['side_effects']}"
)

print("\n--- Testing Live Retain ---")
retain_res = client.retain(
    bank_id=bank_id,
    content=content_str,
    document_id=test_payload["id"],
    metadata={
        "incident_id": test_payload["id"],
        "service": test_payload["service"],
        "outcome": test_payload["outcome"],
        "kubernetes_version": test_payload["kubernetes_version"],
        "database_version": test_payload["database_version"],
        "deployment_version": test_payload["deployment_version"]
    },
    tags=["payment", "latency", "connection-pool", "database", "production"]
)
print("Retain Success:", retain_res)

print("\n--- Testing Live Recall ---")
recall_res = client.recall(
    bank_id=bank_id,
    query="Payment API latency 8.4s error rate 21% pool timeout"
)
print("Recall Response Type:", type(recall_res))
print("Recall Response Dict/Keys:", [attr for attr in dir(recall_res) if not attr.startswith("_")])
if hasattr(recall_res, "results"):
    print("Found Recall results:", len(recall_res.results))
    for r in recall_res.results[:2]:
        print(" - Result item:", r)

print("\n--- Testing Live Reflect ---")
try:
    reflect_res = client.reflect(
        bank_id=bank_id,
        query="What historical actions have been taken when Payment API suffers from connection pool saturation?"
    )
    print("Reflect Response Type:", type(reflect_res))
    if hasattr(reflect_res, "text"):
        print("Reflect Output:", reflect_res.text[:200])
    elif hasattr(reflect_res, "answer"):
        print("Reflect Output:", reflect_res.answer[:200])
    elif hasattr(reflect_res, "response"):
        print("Reflect Output:", reflect_res.response[:200])
    else:
        print("Reflect Attributes:", [a for a in dir(reflect_res) if not a.startswith("_")])
except Exception as e:
    print("Reflect note:", e)
