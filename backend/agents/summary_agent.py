from autogen_agentchat.agents import AssistantAgent

SYSTEM_PROMPT = """
You are a healthcare response formatter.

Convert the healthcare analysis into valid JSON.

Return ONLY valid JSON.

Format:

{
  "symptoms": [],
  "duration": "",
  "risk_level": "",
  "possible_conditions": [],
  "recommendations": []
}

Rules:
- No markdown
- No explanations
- No code blocks
- Return raw JSON only
"""

def create_summary_agent(model_client):

    return AssistantAgent(
        name="SummaryAgent",
        model_client=model_client,
        system_message=SYSTEM_PROMPT,
    )