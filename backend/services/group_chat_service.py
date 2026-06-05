from autogen_agentchat.teams import RoundRobinGroupChat


def create_medhive_group_chat(
    symptom_agent,
    risk_agent,
    medical_agent,
    verification_agent,
    coach_agent,
):
    return RoundRobinGroupChat(
        participants=[
            symptom_agent,
            risk_agent,
            medical_agent,
            verification_agent,
            coach_agent,
        ],
        max_turns=5,
    )