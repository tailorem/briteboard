const Board = require('./db/models/Board.js');
const { getBoard } = require('./db/boards');
const clients = {};

const getCurrentUsers = (boardId) => {
  const currentUsers = [];
  for (let client in clients) {
    // console.log(clients[client].boardId, boardId)
    if (clients[client].boardId === boardId) {
      currentUsers.push({ [client]: clients[client] });
    }
  }
  return currentUsers;
}

const getBoardById = () => {
  // do board finding logic here
}

module.exports = (io/*, dataHelpers*/) => {

  let DEBUG = false;

  // update component history with incoming changes
  // event-handler for new incoming connections
  function updateComponentHistory(changes, boardId) {
    history = board[componentHistory].find(each => each.id === changes.id);
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

  function removeFromHistory(id, boardId) {
    board[componentHistory] = board[componentHistory].filter(each => each.id !== id)
  }

  // SOCKET CONNECTION RECEIVED
  io.on('connection', function(socket) {
    console.log("client connected")

    const boardId = (socket.request.headers.referer).split('/').reverse()[0];

    socket.join(boardId);

  ////////////////////////////////////////////
  //             CLIENT INFO                //
  ////////////////////////////////////////////

    Board.findOne({ 'id': boardId }, function(err, result) {
      if (err) {
        console.error(err);
        // TODO: better error handling
      }



    });

  // TODO: track state changes before saving to database


    const client = { name: 'Anon', boardId: boardId };
    clients[socket.id] = client;

    // Send connection message to client
    socket.emit('connected', { currentUsers: getCurrentUsers(boardId), notification: "You've successfully connected!", data: getBoard(boardId) });

    // Send connection message to other clients in the room
    socket.to(boardId).emit('new connection', { currentUsers: getCurrentUsers(boardId), notification: "Someone has joined the room!" });

    //
    // socket.on('username selected', (username) => {
    //   clients[socket.id].name = username;
    //   io/*socket.broadcast.to(boardId)*/.emit('new connection', getCurrentUsers(boardId));
    //   console.log("username selected");
    // });

    // Send disconnect message to everyone in the room
    socket.on('disconnect', (reason) => {
      delete clients[socket.id];
      io.in(boardId).emit('user disconnected', { currentUsers: getCurrentUsers(boardId), notification: "Someone has left the room!" });
      console.log("client disconnected")
    });
    // console.log(socket.id, boardId);
    // socket.broadcast.emit('user connected', socket.id);


  ////////////////////////////////////////////
  //             CAVAS EVENTS               //
  ////////////////////////////////////////////

    if (DEBUG) console.log(boards);
    // console.log("SOCKET", socket);

    // first send the history to the new client
    // for (let data of board[componentHistory]) {
    //   socket.emit('create_component', data);
    // }

    // add handler for broadcast new component
    sockboardet.on('create_component', function(data) {
      // [componentHistory].push(data)
      updateBoard(boardId, data)
      socket.to(boardId).emit('create_component', data);
    })

    socket.on('modify_component', function(data) {
      updateComponentHistory(data, boardId);
      socket.to(boardId).emit('modify_component', data);
    })

    socket.on('remove_component', function(data) {
      removeFromHistory(data.id, boardId)
      socket.to(boardId).emit('remove_component', data);
    })

    socket.on('path_created', function(data) {
      board[componentHistory].push(data)
      socket.to(boardId).emit('path_created', data);
    })
  });


}
