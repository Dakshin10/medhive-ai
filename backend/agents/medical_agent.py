from autogen_agentchat.agents import AssistantAgent

SYSTEM_PROMPT = """
You are a medical information assistant.

Based on symptoms:

1. Suggest possible conditions.
2. Explain them briefly.
3. Clearly state this is NOT a diagnosis.

Rules:

- Never claim certainty.
- Never prescribe medication.
- Never replace professional medical advice.
- Educational purposes only.

Keep responses concise.
"""

def create_medical_agent(model_client):

    return AssistantAgent(
        name="MedicalAgent",
        model_client=model_client,
        system_message=SYSTEM_PROMPT,
    )