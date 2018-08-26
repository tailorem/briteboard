const boards = require('./db/boards');
const clients = {};

getCurrentUsers = (board) => {
  const currentUsers = [];
  for (let client in clients) {
    // console.log(clients[client].boardId, board)
    if (clients[client].boardId === board) {
      currentUsers.push({ [client]: clients[client] });
    }
  }
  return currentUsers;
}

module.exports = (io/*, dataHelpers*/) => {

  // array of all lines drawn
  const componentHistory = [];

  let DEBUG = false;

  // update component history with incoming changes
  // event-handler for new incoming connections
  function updateComponentHistory(changes) {
    history = componentHistory.find(each => each.id === changes.id);
    if (history) {
      if (DEBUG) console.log("History changes", changes);
      if (DEBUG) console.log("History: before", history.comp)
      history.left = changes.left;
      history.top = changes.top,
      history.height = changes.height;
      history.scaleX = changes.scaleX,
      history.scaleY = changes.scaleY,
      history.angle = changes.angle
    }
  }

  function removeFromHistory(id) {
    componentHistory = componentHistory.filter(each => each.id !== id)
  }

  io.on('connection', function(socket) {

    // socket.emit('select username');

    const board = (socket.request.headers.referer).split('/').reverse()[0];
    const client = { name: 'Anon', boardId: board };
    clients[socket.id] = client;
    io/*socket.broadcast.to(board)*/.emit('new connection', getCurrentUsers(board));

    socket.on('disconnect', (reason) => {
      delete clients[socket.id];
      io/*socket.broadcast.to(board)*/.emit('user disconnected', getCurrentUsers(board));
    });
    // console.log(socket.id, board);
    // socket.broadcast.emit('user connected', socket.id);


    if (DEBUG) console.log(boards);
    // console.log("SOCKET", socket);

    // first send the history to the new client
    for (let data of componentHistory) {
      socket.emit('create_component', data);
    }

    // add handler for broadcast new component
    socket.on('create_component', function(data) {
      componentHistory.push(data)
      socket.broadcast.emit('create_component', data);
    })

    socket.on('modify_component', function(data) {
      updateComponentHistory(data);
      socket.broadcast.emit('modify_component', data);
    })

    socket.on('remove_component', function(data) {
      removeFromHistory(data.id)
      socket.broadcast.emit('remove_component', data);
    })

    socket.on('path_created', function(data) {
      componentHistory.push(data)
      socket.broadcast.emit('path_created', data);
    })
  });
}