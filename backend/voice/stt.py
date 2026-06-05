from faster_whisper import WhisperModel


model = WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8"
)


def transcribe_audio(
    audio_path: str
):

    segments, info = model.transcribe(
        audio_path
    )

    transcript = " ".join(
        segment.text
        for segment in segments
    )

    return transcript.strip()