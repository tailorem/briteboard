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

  let DEBUG = false;

  // update component history with incoming changes
  // event-handler for new incoming connections
  function updateComponentHistory(changes, board) {
    history = boards[board].componentHistory.find(each => each.id === changes.id);
    if (history) {
      if (DEBUG) console.log("History changes", changes);
      if (DEBUG) console.log("History: before", history.comp)
      history.left = changes.left;
      history.top = changes.top,
      history.height = changes.height;
      history.scaleX = changes.scaleX,
      history.scaleY = changes.scaleY,
      history.angle = changes.angle,
      history.text = changes.text
    }
  }

  function removeFromHistory(id, board) {
    boards[board].componentHistory = boards[board].componentHistory.filter(each => each.id !== id)
  }


// Export socket events to server.js
module.exports = (io/*, dataHelpers*/) => {

  io.on('connection', function(socket) {

  ////////////////////////////////////////////
  //             CLIENT INFO                //
  ////////////////////////////////////////////

    const board = (socket.request.headers.referer).split('/').reverse()[0];
    // boards[board].componentHistory = []; // this line will overwrite board history, should be assigned on creation

    socket.join(board);

    const client = { name: 'Anon', boardId: board };
    clients[socket.id] = client;

    io.in(board).emit('new connection', 'Someone has joined the room!');
    // io/*socket.broadcast.to(board)*/.emit('new connection', getCurrentUsers(board));

    // socket.on('username selected', (username) => {
    //   clients[socket.id].name = username;
    //   io/*socket.broadcast.to(board)*/.emit('new connection', getCurrentUsers(board));
    //   console.log("username selected");
    // });


    // socket.on('disconnect', (reason) => {
    //   delete clients[socket.id];
    //   io/*socket.broadcast.to(board)*/.emit('user disconnected', getCurrentUsers(board));
    //   console.log("client disconnected")
    // });
    // console.log(socket.id, board);
    // socket.broadcast.emit('user connected', socket.id);


  ////////////////////////////////////////////
  //             CAVAS EVENTS               //
  ////////////////////////////////////////////

    console.log(boards);
    // console.log("SOCKET", socket);

    // first send the history to the new client

    try {
      for (let data of boards[board].componentHistory) {
        socket.emit('create_component', data);
      }
    } catch(error) {
      console.error(error);
      // expected output: SyntaxError: unterminated string literal
      // Note - error messages will vary depending on browser
    }


    // add handler for broadcast new component
    socket.on('create_component', function(data) {
      boards[board].componentHistory.push(data)
      io.to(board).emit('create_component', data);
    })

    socket.on('modify_component', function(data) {
      updateComponentHistory(data, board);
      io.to(board).emit('modify_component', data);
    })

    socket.on('remove_component', function(data) {
      removeFromHistory(data.id, board)
      io.to(board).emit('remove_component', data);
    })

    socket.on('path_created', function(data) {
      boards[board].componentHistory.push(data)
      io.to(board).emit('path_created', data);
    })
  });
}
