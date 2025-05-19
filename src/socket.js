const { Server } = require("socket.io");
const { QueueEvents } = require("bullmq");
const connection = require("./config/redisClient");

function initSocketServer(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  const queueEvents = new QueueEvents("ocr-processing", { connection });

  io.on("connection", (socket) => {
    console.log(`🧠 Cliente conectado: ${socket.id}`);
  });

  queueEvents.on("completed", ({ jobId }) => {
    console.log(`✅ Job ${jobId} finalizado`);
    io.emit("job:completed", { jobId });
  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    console.error(`❌ Job ${jobId} falhou:`, failedReason);
    io.emit("job:failed", { jobId, failedReason });
  });
}

module.exports = { initSocketServer };
