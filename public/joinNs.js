function joinNs(endpoint) {
  if (nsSocket) {
    nsSocket.close();

    // remove the eventListener before it's added again
    document
      .querySelector('#user-input')
      .removeEventListener('submit', formSubmission);
  }

  nsSocket = io(`http://localhost:8080${endpoint}`);
  nsSocket.on('nsRoomLoad', (nsRooms) => {
    let roomList = document.querySelector('.room-list');
    roomList.innerHTML = '';
    nsRooms.forEach((room) => {
      let glyph;
      if (room.privateRoom) {
        glyph = 'lock';
      } else {
        glyph = 'globe';
      }
      roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`;
    });
    // add click listener to each room
    let roomNodes = document.getElementsByClassName('room');
    Array.from(roomNodes).forEach((elem) => {
      elem.addEventListener('click', (e) => {
        joinRoom(e.target.innerText);
      });
    });

    const topRoom = document.querySelector('.room');
    const topRoomName = topRoom.innerText;
    joinRoom(topRoomName);
  });

  nsSocket.on('messageToClients', (msg) => {
    console.log(msg);
    const startMsg = document.querySelector('.start-msg');
    if (startMsg) {
      startMsg.remove();
    }
    const newMsg = buildHTML(msg);
    document.querySelector('#messages').innerHTML += newMsg;
  });
  document
    .querySelector('.message-form')
    .addEventListener('submit', formSubmission);
}

function formSubmission(event) {
  event.preventDefault();
  const messageField = document.querySelector('#user-message');
  nsSocket.emit('newMessageToServer', { text: messageField.value });
  messageField.value = '';
}

function buildHTML(msg) {
  const convertedDate = new Date(msg.time).toLocaleString();
  const newHTML = `
    <li class="message">
        <div class="user-image">
            <img src="${msg.avatar}" />
        </div>
        <div class="user-message">
            <div class="user-name-time">${msg.username} <span>${convertedDate}</span></div>
            <div class="message-text">${msg.text}</div>
        </div>
    </li>    
    `;
  return newHTML;
}
