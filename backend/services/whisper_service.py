import os
import tempfile
from groq import Groq
from fastapi import HTTPException, UploadFile

from core.config import GROQ_API_KEY
from core.logging import get_logger

logger = get_logger(__name__)
client = Groq(api_key=GROQ_API_KEY)

MAX_AUDIO_BYTES     = 10 * 1024 * 1024
ALLOWED_AUDIO_TYPES = {
    "audio/m4a", "audio/mp4", "audio/mpeg",
    "audio/wav","audio/wave", "audio/webm", "audio/x-m4a",
}

async def transcribe_audio(audio_file: UploadFile) -> str:
    if audio_file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported audio type '{audio_file.content_type}'."
        )

    if audio_file.size and audio_file.size > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio file too large. Max 10 MB.")

    audio_bytes = await audio_file.read()

    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio file too large. Max 10 MB.")
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Audio file is empty.")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".m4a", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        with open(tmp_path, "rb") as f:
            result = client.audio.transcriptions.create(
                model="whisper-large-v3-turbo",
                file=f,
                language="en",
                response_format="text",
            )

        transcript = result.strip() if isinstance(result, str) else result.text.strip()
        logger.info(f"Transcribed {len(audio_bytes)} bytes → '{transcript[:80]}'")
        return transcript

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Whisper failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
