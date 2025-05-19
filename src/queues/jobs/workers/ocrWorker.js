const { captureFrame } = require("../../../services/videoProcessor");
const { createWorker } = require("../index");

const worker = createWorker("ocr-processing", async (job) => {
  console.log(`🖼️ Iniciando OCR para job ${job.id}...`);
  const result = await captureFrame(job.data.youtubeUrl);
  return {
    timestamp: Date.now(),
    text: result,
  };
});

// (Opcional) Adicione comportamento específico para este Worker
worker.on("completed", (job, result) => {
  console.log(`🔍 OCR finalizado: ${job.id}`);
});
