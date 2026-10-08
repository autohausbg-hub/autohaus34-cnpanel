"use strict";

// cPanel/CloudLinux Passenger must execute this file, not the preview server.
const { createServer } = require("./server/cpanel-server");
const server = createServer();
const port = Number(process.env.PORT || 3217);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");

// Passenger intercepts this single listen() and supplies its own Unix socket.
// Outside Passenger the default is loopback-only, including production previews.
server.listen(port, process.env.HOST || "127.0.0.1", () => {
  console.log("AutoHaus Node.js application started");
});
server.on("error", error => {
  console.error("AutoHaus startup failed:", error.code || error.name);
  process.exitCode = 1;
});
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.once(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => { server.closeAllConnections(); process.exit(0); }, 10000).unref();
  });
}
