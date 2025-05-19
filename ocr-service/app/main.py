from fastapi import FastAPI, Request
import easyocr
import tempfile
import os

app = FastAPI()
reader = easyocr.Reader(['pt', 'en'])

@app.post("/ocr")
async def run_ocr(request: Request):
    body = await request.body()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
        tmp.write(body)
        tmp_path = tmp.name

    try:
        result = reader.readtext(tmp_path, detail=0, paragraph=True)
        text = "\n".join(result)
    finally:
        os.remove(tmp_path)

    return {"text": text}
