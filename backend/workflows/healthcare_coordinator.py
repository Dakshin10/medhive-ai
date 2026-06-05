from config.model_client import model_client

from agents.symptom_agent import create_symptom_agent
from agents.risk_agent import create_risk_agent
from agents.medical_agent import create_medical_agent
from agents.coach_agent import create_coach_agent
from agents.summary_agent import create_summary_agent


class HealthcareCoordinator:

    def __init__(self):

        self.symptom_agent = create_symptom_agent(model_client)

        self.risk_agent = create_risk_agent(model_client)

        self.medical_agent = create_medical_agent(model_client)

        self.coach_agent = create_coach_agent(model_client)

        self.summary_agent = create_summary_agent(model_client)

    async def analyze(self, user_input: str):

        # Step 1 - Symptom Analysis
        symptom_result = await self.symptom_agent.run(
            task=user_input
        )

        symptoms = symptom_result.messages[-1].content

        # Step 2 - Risk Assessment
        risk_result = await self.risk_agent.run(
            task=symptoms
        )

        risk = risk_result.messages[-1].content

        # Step 3 - Medical Information
        medical_result = await self.medical_agent.run(
            task=f"""
            Symptoms:
            {symptoms}

            Risk:
            {risk}
            """
        )

        medical = medical_result.messages[-1].content

        # Step 4 - Health Coaching
        coach_result = await self.coach_agent.run(
            task=f"""
            Symptoms:
            {symptoms}

            Risk:
            {risk}
            """
        )

        coach = coach_result.messages[-1].content

        # Step 5 - Structured JSON Summary
        summary_result = await self.summary_agent.run(
            task=f"""
            Symptom Analysis:
            {symptoms}

            Risk Assessment:
            {risk}

            Medical Information:
            {medical}

            Recommendations:
            {coach}
            """
        )

        return summary_result.messages[-1].content