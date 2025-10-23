const next = require("next");
const { createServer } = require("http");
const { Server } = require("socket.io");
const chalk = require("chalk");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
const pool = new Map();
const socketToUser = new Map();

const PoolLog = {
  info: (message) => {
    console.log(chalk.cyan(`[POOL] ${message}`));
  }
}

const ClientLog = {
  info: (message) => {
    console.log(chalk.cyan(`[USER] ${message}`));
  },
  warn: (message) => {
    console.log(chalk.yellow(`[USER] ${message}`));
  }
}

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    ClientLog.info(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      const id = socketToUser.get(socket.id);
      const userToRemove = pool.get(id);

      if (userToRemove) {
        pool.delete(id);
        socket.broadcast.emit("pool:remove", userToRemove);

        PoolLog.info(`User disconnected: username=${userToRemove.username}, socketId=${socket.id}`);
        PoolLog.info(`Pool size: ${pool.size}`);
      }

      socketToUser.delete(socket.id);
    });

    socket.on("user:register", (newUser) => {
      const { username, id } = newUser;
      const online = true;
      
      let user = pool.get(id);
      user = !user
        ? { username, socketId: socket.id, id, online }
        : { ...user, socketId: socket.id, id, online };

      pool.set(id, user);
      socketToUser.set(user.socketId, id);

      PoolLog.info(`User registered: username=${username}, socketId=${socket.id}`);
      PoolLog.info(`Pool size: ${pool.size}`);

      socket.broadcast.emit("pool:add", { user, broadcast: true });
      socket.emit("user:register:after", user);
    });

    socket.on("pool:sync", () => {
      socket.emit("pool:sync", Array.from(pool));
    });

    socket.on("user:connect", ({ id }) => {
      socket.emit("user:connect:after", { user: pool.get(id) });
    });

    socket.on("message:send", (newMessage) => {
      const { fromId, toId, message } = newMessage;
      const toUser = pool.get(toId);
      const fromUser = pool.get(fromId);
      if (fromUser && toUser) {
        ClientLog.info(`message:send from=${fromId} to=${toId} socketId=${toUser.socketId} message=${message}`);
        io.to(toUser.socketId).emit("message:receive", newMessage);
        io.to(fromUser.socketId).emit("message:send:after", newMessage);
      }
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