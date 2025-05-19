const IORedis = require("ioredis");
const { redis } = require("./env");

const connection = new IORedis({
  host: redis.host || "redis", // Use service name as default
  port: redis.port || 6379,
  maxRetriesPerRequest: null, // ESSENCIAL para BullMQ funcionar corretamente com Workers
  // você pode adicionar outras configs aqui, como password, db, etc.
});

module.exports = connection;
