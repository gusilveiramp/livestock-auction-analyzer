// src/jobs/index.js
const { Worker } = require("bullmq");
const connection = require("../../config/redisClient");

function createWorker(queueName, processor, options = {}) {
  const worker = new Worker(queueName, processor, { connection });

  if (!options.disableEvents) {
    worker.on("completed", (job) => {
      console.log(`✅ [${queueName}] Job ${job.id} concluído`);
    });

    worker.on("failed", (job, err) => {
      console.error(`❌ [${queueName}] Job ${job.id} falhou:`, err.message);
    });
  }
  return worker;
}

module.exports = {
  createWorker,
};
