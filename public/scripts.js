const username = prompt('What is your username?');

const socket = io('http://localhost:8080', {
  query: {
    username: username ?? 'user',
  },
});

let nsSocket;

socket.on('nsList', (nsData) => {
  let namespacesDiv = document.querySelector('.namespaces');
  namespacesDiv.innerHTML = '';
  nsData.forEach((ns) => {
    namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint} ><img src="${ns.img}" /></div>`;
  });

  Array.from(document.getElementsByClassName('namespace')).forEach((elem) => {
    elem.addEventListener('click', (e) => {
      const nsEndpoint = elem.getAttribute('ns');
      document.querySelector('.room-title').innerText =
        nsEndpoint.split('/')[1];
      joinNs(nsEndpoint);
    });
  });

  joinNs('/wiki');
  document.querySelector('.room-title').innerText = 'wiki';
});
