async def run_medhive_group_chat(
    group_chat,
    patient_context: str,
    user_input: str,
    rag_context: str,
    web_context: str,
):
    task = f"""
PATIENT CONTEXT

{patient_context}

CURRENT SYMPTOMS

{user_input}

LOCAL MEDICAL KNOWLEDGE

{rag_context}

WEB MEDICAL KNOWLEDGE

{web_context}

Instructions:

Collaborate to:

1. Analyze symptoms
2. Assess risks
3. Evaluate medical possibilities
4. Verify findings
5. Provide health guidance

This is educational information only.
"""

    result = await group_chat.run(
        task=task
    )

    return result