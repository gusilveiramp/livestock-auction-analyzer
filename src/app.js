const express = require("express");
const { createWorker } = require("tesseract.js"); // ✅ missing import
const path = require("path");
const app = express();
const fs = require("fs");
const { default: axios } = require("axios");

const { ocrQueue } = require("./queues");

app.use(express.json());

app.post("/start", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Missing YouTube URL" });
  }
  try {
    const job = await ocrQueue.add("process-youtube", { youtubeUrl: url });
    res.status(202).json({ jobId: job.id });
  } catch (err) {
    console.error("❌ Failed to queue job:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

app.get("/test-ocr-tesseract", async (req, res) => {
  try {
    const imagePath = path.join(
      __dirname,
      "__test__",
      "fixtures",
      "frame-test.png"
    );
    const worker = await createWorker({ logger: (m) => console.log(m) });
    await worker.loadLanguage("por");
    await worker.initialize("por");

    const { data } = await worker.recognize(imagePath);
    await worker.terminate();
    res.status(200).send({ text: data.text.trim() });
  } catch (err) {
    console.error("❌ OCR test error:", err.message);
    res.status(500).send({ error: err.message });
  }
});

app.get("/test-ocr-proxy", async (req, res) => {
  try {
    const imagePath = path.join(
      __dirname,
      "__test__",
      "fixtures",
      "frame-test.png"
    );
    const imageBuffer = fs.readFileSync(imagePath);

    const response = await axios.post(
      "http://ocr-service:8000/ocr",
      imageBuffer,
      {
        headers: {
          "Content-Type": "application/octet-stream",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (err) {
    console.error("❌ Erro no proxy OCR:", err.message);
    res.status(500).send({ error: err.message });
  }
});

module.exports = app;
