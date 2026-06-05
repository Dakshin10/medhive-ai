import uuid

import edge_tts


async def text_to_speech(
    text: str
):

    filename = (
        f"voice_{uuid.uuid4()}.mp3"
    )

    filepath = (
        f"outputs/{filename}"
    )

    communicate = edge_tts.Communicate(
        text=text,
        voice="en-US-AriaNeural"
    )

    await communicate.save(
        filepath
    )

    return filename