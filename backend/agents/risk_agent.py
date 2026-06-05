from autogen_agentchat.agents import AssistantAgent

SYSTEM_PROMPT = """
You are a healthcare risk assessment specialist.

Based on symptoms, classify risk into:

LOW
MEDIUM
HIGH
CRITICAL

Rules:

- Explain briefly why.
- Never diagnose.
- Never prescribe medication.
- Focus only on urgency.

Return concise output.
"""

def create_risk_agent(model_client):

    return AssistantAgent(
        name="RiskAgent",
        model_client=model_client,
        system_message=SYSTEM_PROMPT,
    )