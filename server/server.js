"use strict";

const next = require("next");
const { createServer } = require("http");
const { Server } = require("socket.io");
const pool = require("./lib/pool");
const User = require("./models/user");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
const Log = require("./scripts/log").Logger.getLog("SERVER");

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.info(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      const user = pool.getBySocketId(socket.id);
      if (!user) return;
      pool.delete(user.userId);
      user.detach();
      io.emit("pool:remove", { user });
    });

    socket.on("user:register", (newUser) => {
      const { username, userId } = newUser;
      const user = pool.get(userId) || new User({ username, userId });

      user.attach(socket.id);
      pool.set(user);

      socket.emit("user:register:done", { user });
      socket.emit("pool:sync", Array.from(pool.pool));
      io.emit("pool:add", { user });
      Log.info("emit (user:register:done, pool:sync, pool:add):", user.username);
      Log.info("Pool summary:\n", pool.summary());
    });

    socket.on("user:connect", (userId) => {
      const user = pool.get(userId);
      socket.emit("user:connect:done", { user });
    });

    socket.on("user:message:send", (newMessage) => {
      const { fromId, toId } = newMessage;
      const toUser = pool.get(toId);
      const fromUser = pool.get(fromId);

      // Only allow sending if both users are online
      if (!fromUser || !toUser) return;

      io.to(toUser.socketId).emit("user:message:receive", newMessage);
      io.to(fromUser.socketId).emit("user:message:send:done", newMessage);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
