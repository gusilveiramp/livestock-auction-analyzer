from fastapi import FastAPI, UploadFile, File
from faster_whisper import WhisperModel
import tempfile
import shutil

app = FastAPI()
model = WhisperModel("base", device="cpu", compute_type="int8")  # ou "medium" se quiser mais precisão

@app.post("/asr")
async def transcribe_audio(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        shutil.copyfileobj(file.file, tmp)
        audio_path = tmp.name

    segments, _ = model.transcribe(audio_path)
    transcription = "\n".join([seg.text.strip() for seg in segments])

    return {"text": transcription}
