const express = require('express');
const socketIo = require('socket.io');

const app = express();

const namespaces = require('./data/namespaces');

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(8080, () => {
  console.log('server running at port 8080');
});

const io = socketIo(expressServer);

io.on('connection', (socket) => {
  const nsData = namespaces.map((ns) => {
    return {
      img: ns.img,
      endpoint: ns.endpoint,
    };
  });
  socket.emit('nsList', nsData);
});

namespaces.forEach((namespace) => {
  io.of(namespace.endpoint).on('connection', (nsSocket) => {
    nsSocket.emit('nsRoomLoad', namespace.rooms);

    nsSocket.on('joinRoom', async (roomToJoin, numberOfUsersCallback) => {
      const clients = await io.of('/wiki').allSockets();
      nsSocket.join('/wiki');
      numberOfUsersCallback(clients.size);
    });
    nsSocket.on('newMessageToServer', (msg) => {
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: 'san',
        avatar: 'https://via.placeholder.com/30',
      };

      const roomTitle = Array.from(nsSocket.rooms)[1];
      io.of('/wiki').to(roomTitle).emit('messageToClients', fullMsg);
    });
  });
});
