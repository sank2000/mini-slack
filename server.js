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
      const roomToLeave = Array.from(nsSocket.rooms)[1];
      nsSocket.leave(roomToLeave);
      await updateUsersInRoom(namespace, roomToLeave);

      nsSocket.join(roomToJoin);

      const nsRoom = namespace.rooms.find((room) => {
        return room.roomTitle === roomToJoin;
      });
      nsSocket.emit('historyCatchUp', nsRoom.history);

      await updateUsersInRoom(namespace, roomToJoin);
    });
    nsSocket.on('newMessageToServer', (msg) => {
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: 'san',
        avatar: 'https://via.placeholder.com/30',
      };

      const roomTitle = Array.from(nsSocket.rooms)[1];

      // history
      const nsRoom = namespace.rooms.find((room) => {
        return room.roomTitle === roomTitle;
      });
      nsRoom.addMessage(fullMsg);

      io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg);
    });
  });
});

async function updateUsersInRoom(namespace, roomToJoin) {
  const clients = await io.of(namespace.endpoint).in(roomToJoin).allSockets();
  io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers', clients.size);
}
