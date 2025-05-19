const { Queue } = require("bullmq");
const connection = require("../config/redisClient");

// Função genérica para criar uma fila
function createQueue(name, options = {}) {
  return new Queue(name, {
    connection,
    ...options,
  });
}

// Filas específicas
const ocrQueue = createQueue("ocr-processing");
const asrQueue = createQueue("asr-processing");

module.exports = {
  createQueue,
  ocrQueue,
  asrQueue,
};
