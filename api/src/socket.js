let io;

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: '*', // Configure properly in production
        methods: ['GET', 'POST']
      }
    });
    return io;
  },
  getIo: () => {
    if (!io) {
      console.warn('Socket.io not initialized!');
    }
    return io;
  }
};
