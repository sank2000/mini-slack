function joinRoom(roomName) {
  nsSocket.emit('joinRoom', roomName, (newNumberOfMembers) => {
    document.querySelector(
      '.curr-room-num-users'
    ).innerHTML = `${newNumberOfMembers} <span class="glyphicon glyphicon-user"></span>`;
  });

  nsSocket.on('historyCatchUp', (history) => {
    const messagesUl = document.querySelector('#messages');
    messagesUl.innerHTML = '';
    if (history.length === 0) {
      messagesUl.innerHTML += `<p class='start-msg'>Be first to start a conversation in this room. <p>`;
    }
    history.forEach((msg) => {
      const newMsg = buildHTML(msg);
      messagesUl.innerHTML += newMsg;
    });
    messagesUl.scrollTo(0, messagesUl.scrollHeight);
  });

  nsSocket.on('updateMembers', (numMembers) => {
    document.querySelector(
      '.curr-room-num-users'
    ).innerHTML = `${numMembers} <span class="glyphicon glyphicon-user"></span>`;
    document.querySelector('.curr-room-text').innerText = `${roomName}`;
  });

  let searchBox = document.querySelector('#search-box');
  searchBox.addEventListener('input', (e) => {
    console.log(e.target.value);
    let messages = Array.from(document.getElementsByClassName('message'));
    console.log(messages);
    messages.forEach((msg) => {
      if (
        Array.from(Array.from(msg.childNodes)[3].childNodes)[3]
          .innerText.toLowerCase()
          .indexOf(e.target.value.toLowerCase()) === -1
      ) {
        // the msg does not contain the user search term!
        msg.style.display = 'none';
      } else {
        msg.style.display = 'flex';
      }
    });
  });
}
