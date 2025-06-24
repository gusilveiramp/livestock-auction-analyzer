const { transcribeAudio } = require("../../services/audioProcessor");
const { createWorker } = require("../jobs/index");

const worker = createWorker("asr-processing", async (job) => {
  console.log(`🖼️ Iniciando ASR para job ${job.id}...`);
  const result = await transcribeAudio(job.data.youtubeUrl);
  return {
    timestamp: Date.now(),
    text: result,
  };
});

// (Opcional) Se quiser sobrescrever eventos:
worker.on("completed", (job, result) => {
  console.log(`🎤 ASR Finalizado: ${job.id}`);
});
