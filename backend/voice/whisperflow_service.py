from voice.stt import (
    transcribe_audio
)

from voice.tts import (
    text_to_speech
)


def _get_readable_text(response: dict) -> str:
    if not isinstance(response, dict):
        return str(response)

    status = response.get("status")

    if status == "EMERGENCY":
        assessment = response.get("assessment", {})
        reason = assessment.get("reason", "critical symptoms")
        action = assessment.get("action", "seek emergency help immediately")
        return f"Warning: This is a medical emergency. Risk level is critical. Reason: {reason}. Recommended action: {action}."

    elif status == "SUCCESS":
        assessment = response.get("assessment")
        if assessment and isinstance(assessment, dict):
            risk_level = assessment.get("risk_level", "unknown")
            conditions = ", ".join(assessment.get("possible_conditions", []))
            recommendations = ". ".join(assessment.get("recommendations", []))
            text = f"Symptom analysis completed. The estimated risk level is {risk_level}."
            if conditions:
                text += f" Possible conditions include: {conditions}."
            if recommendations:
                text += f" Here are some recommendations: {recommendations}."
            return text
        elif response.get("raw_response"):
            return str(response.get("raw_response"))

    return "Symptom analysis completed. Please check the details on the screen."


async def process_voice_request(
    coordinator,
    audio_path: str,
    patient_id: int | None = None
):

    transcript = (
        transcribe_audio(
            audio_path
        )
    )

    response = (
        await coordinator.analyze(
            transcript,
            patient_id
        )
    )

    readable_text = _get_readable_text(response)

    speech_file = (
        await text_to_speech(
            readable_text
        )
    )

    return {
        "transcript": transcript,
        "response": response,
        "audio_file": speech_file
    }