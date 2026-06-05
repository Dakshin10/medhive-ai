import json

from config.model_client import model_client

from agents.emergency_agent import create_emergency_agent
from agents.symptom_agent import create_symptom_agent
from agents.risk_agent import create_risk_agent
from agents.medical_agent import create_medical_agent
from agents.coach_agent import create_coach_agent
from agents.summary_agent import create_summary_agent
from agents.verification_agent import create_verification_agent
from agents.lab_report_agent import create_lab_report_agent
from agents.drug_interaction_agent import (
    create_drug_interaction_agent
)

from agents.web_search_agent import (
    search_medical_web
)

from services.memory_service import (
    MemoryService
)

from services.group_chat_service import (
    create_medhive_group_chat
)

from services.group_chat_runner import (
    run_medhive_group_chat
)

from rag.retriever import retrieve


class HealthcareCoordinator:

    def __init__(self):

        self.emergency_agent = (
            create_emergency_agent(
                model_client
            )
        )

        self.symptom_agent = (
            create_symptom_agent(
                model_client
            )
        )

        self.risk_agent = (
            create_risk_agent(
                model_client
            )
        )

        self.medical_agent = (
            create_medical_agent(
                model_client
            )
        )

        self.verification_agent = (
            create_verification_agent(
                model_client
            )
        )

        self.coach_agent = (
            create_coach_agent(
                model_client
            )
        )

        self.summary_agent = (
            create_summary_agent(
                model_client
            )
        )

        self.lab_report_agent = (
            create_lab_report_agent(
                model_client
            )
        )

        self.drug_interaction_agent = (
            create_drug_interaction_agent(
                model_client
            )
        )

        self.group_chat = (
            create_medhive_group_chat(
                self.symptom_agent,
                self.risk_agent,
                self.medical_agent,
                self.verification_agent,
                self.coach_agent,
            )
        )

    # =====================================================
    # JSON PARSER
    # =====================================================

    def _parse_json_response(
        self,
        text: str
    ):

        try:

            return json.loads(text)

        except Exception:

            try:

                cleaned = (
                    text.replace(
                        "```json",
                        ""
                    )
                    .replace(
                        "```",
                        ""
                    )
                    .strip()
                )

                return json.loads(
                    cleaned
                )

            except Exception:

                return None

    # =====================================================
    # EMERGENCY DETECTOR
    # =====================================================

    def _is_emergency(
        self,
        emergency_data
    ):

        if not emergency_data:

            return False

        value = emergency_data.get(
            "emergency",
            False
        )

        if isinstance(
            value,
            bool
        ):
            return value

        return (
            str(value).lower()
            == "true"
        )

    # =====================================================
    # MEDICATION EXTRACTOR
    # =====================================================

    def _extract_medications(
        self,
        text: str
    ):

        common_drugs = [
            "aspirin",
            "ibuprofen",
            "paracetamol",
            "acetaminophen",
            "metformin",
            "insulin",
            "atorvastatin",
            "warfarin",
            "amoxicillin",
            "omeprazole"
        ]

        text = text.lower()

        medications = []

        for drug in common_drugs:

            if drug in text:

                medications.append(
                    drug
                )

        return medications

    # =====================================================
    # MAIN WORKFLOW
    # =====================================================

    async def analyze(
        self,
        user_input: str,
        patient_id: int | None = None
    ):

        patient_context = ""

        if patient_id:

            patient = (
                MemoryService.get_patient(
                    patient_id
                )
            )

            if patient:

                patient_context = f"""
PATIENT PROFILE

Name: {patient.name}
Age: {patient.age}
Gender: {patient.gender}

Medical Conditions:
{patient.medical_conditions}

Allergies:
{patient.allergies}
"""

        enhanced_input = f"""
{patient_context}

CURRENT SYMPTOMS

{user_input}
"""

        # ==========================================
        # EMERGENCY TRIAGE
        # ==========================================

        emergency_result = (
            await self.emergency_agent.run(
                task=enhanced_input
            )
        )

        emergency_response = (
            emergency_result
            .messages[-1]
            .content
        )

        emergency_data = (
            self._parse_json_response(
                emergency_response
            )
        )

        if self._is_emergency(
            emergency_data
        ):

            return {
                "status":
                "EMERGENCY",
                "assessment":
                emergency_data
            }

        # ==========================================
        # LOCAL RAG
        # ==========================================

        try:

            retrieved_docs = (
                retrieve(
                    user_input
                )
            )

            rag_context = (
                "\n\n".join(
                    retrieved_docs
                )
            )

        except Exception as e:

            print(
                f"RAG Error: {e}"
            )

            rag_context = (
                "No local medical documents found."
            )

        # ==========================================
        # WEB SEARCH
        # ==========================================

        try:

            web_results = (
                search_medical_web(
                    user_input
                )
            )

            if web_results:

                web_context = (
                    "\n\n".join(
                        [
                            f"""
TITLE:
{result['title']}

SOURCE:
{result['url']}

SNIPPET:
{result['snippet']}

FULL ARTICLE CONTENT:
{result['content']}
"""
                            for result in web_results
                        ]
                    )
                )

            else:

                web_context = (
                    "No trusted medical web sources found."
                )

        except Exception as e:

            print(
                f"Web Search Error: {e}"
            )

            web_context = (
                "No trusted medical web sources found."
            )

        # ==========================================
        # GROUP CHAT ANALYSIS
        # ==========================================

        group_chat_result = (
            await run_medhive_group_chat(
                group_chat=self.group_chat,
                patient_context=patient_context,
                user_input=user_input,
                rag_context=rag_context,
                web_context=web_context,
            )
        )

        group_chat_output = []

        for message in (
            group_chat_result.messages
        ):

            try:

                content = getattr(
                    message,
                    "content",
                    str(message)
                )

                group_chat_output.append(
                    str(content)
                )

            except Exception:

                pass

        combined_analysis = (
            "\n\n".join(
                group_chat_output
            )
        )

        # ==========================================
        # DRUG INTERACTIONS
        # ==========================================

        medications = (
            self._extract_medications(
                user_input
            )
        )

        drug_interactions = (
            "No medications detected."
        )

        if medications:

            interaction_result = (
                await self.drug_interaction_agent.run(
                    task=f"""
PATIENT MEDICATIONS

{", ".join(medications)}

Analyze:

1. Drug interactions
2. Severity
3. Risks
4. Recommendations

Educational purposes only.
"""
                )
            )

            drug_interactions = (
                interaction_result
                .messages[-1]
                .content
            )

        # ==========================================
        # SUMMARY
        # ==========================================

        summary_result = (
            await self.summary_agent.run(
                task=f"""
PATIENT CONTEXT

{patient_context}

GROUP CHAT ANALYSIS

{combined_analysis}

DRUG INTERACTION ANALYSIS

{drug_interactions}

Generate ONLY valid JSON.

{{
  "symptoms": [],
  "risk_level": "",
  "possible_conditions": [],
  "recommendations": [],
  "confidence_score": "",
  "verified": true,
  "evidence_sources": [],
  "drug_interactions": ""
}}
"""
            )
        )

        summary_response = (
            summary_result
            .messages[-1]
            .content
        )

        summary_data = (
            self._parse_json_response(
                summary_response
            )
        )

        if summary_data:

            return {
                "status":
                "SUCCESS",
                "assessment":
                summary_data,
                "group_chat_analysis":
                combined_analysis,
                "drug_interactions":
                drug_interactions
            }

        return {
            "status":
            "SUCCESS",
            "raw_response":
            summary_response,
            "group_chat_analysis":
            combined_analysis,
            "drug_interactions":
            drug_interactions
        }