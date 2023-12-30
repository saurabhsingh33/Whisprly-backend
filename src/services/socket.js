const { Server } = require('socket.io');
const { Redis } = require('ioredis');

const SocketService = () => {
  console.log('Initializing socket service');
  const _io = new Server({
    cors: {
      allowedHeaders: ["*"],
      origin: "*",
      methods: ["GET", "POST"],
      transports: ['websocket', 'polling'],
      credentials: true
    },
    allowEIO3: true
  });
  console.log('socket service Started');

  return _io;
};

module.exports = { SocketService };
