const http = require("http");
const app = require("./app");
const { initSocketServer } = require("./socket");

const server = http.createServer(app);

initSocketServer(server); // socket.io + QueueEvents

server.listen(3333, () => {
  console.log("🚀 Server running on http://localhost:3333");
});
