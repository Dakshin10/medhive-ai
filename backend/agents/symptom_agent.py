from autogen_agentchat.agents import AssistantAgent

SYSTEM_PROMPT = """
You are a healthcare symptom extraction specialist.

Tasks:
1. Extract symptoms.
2. Extract duration if mentioned.
3. Extract severity if mentioned.

Rules:
- Do not diagnose.
- Do not recommend medication.
- Return concise structured information.
"""

def create_symptom_agent(model_client):
    return AssistantAgent(
        name="SymptomAgent",
        model_client=model_client,
        system_message=SYSTEM_PROMPT,
    )