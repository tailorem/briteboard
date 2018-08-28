const clients = {};

getCurrentUsers = (board) => {
  const currentUsers = [];
  for (let client in clients) {
    // console.log(clients[client].boardId, boardId)
    if (clients[client].boardId === board) {
      currentUsers.push({ [client]: clients[client] });
    }
  }
  return currentUsers;
}

// update component history with incoming changes
// event-handler for new incoming connections

function updateboardHistory(changes) {
  history = boardHistory.find(each => each.id === changes.id);
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

function removeFromHistory(id) {
  boardHistory = boardHistory.filter(each => each.id !== id)
}

module.exports = (io/*, dataHelpers*/) => {
  // array of all lines drawn
  // let boardHistory = [];
  // let allBoardsData = boards.getAllBoards();
  // console.log("ALL BOARDS DATA", allBoardsData);


  let DEBUG = false;


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


    const client = { boardId: board };
    // boards[board].boardHistory = []; // this line will overwrite board history, should be assigned on creation

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

    const boardHistory = boards.getBoardHistory(board);
    if (DEBUG) console.log("BOARD HISTORY", boardHistory);

    // first send the history to the new client
    for (let data of boardHistory) {
      socket.emit('create_component', data);
    }

    // add handler for broadcast new component
    socket.on('create_component', function(objectData) {
      // boardHistory.push(objectData)
      // console.log(objectData);
      boards.updateBoard(board, objectData, boardHistory);
      socket.broadcast.emit('create_component', objectData);
    })

    // // Delete previous object (removeFromHistory) and re-add it...?
    // socket.on('modify_component', function(objectData) {
    //   updateboardHistory(objectData);
    //   boards.updateBoard(board, boardHistory);
    //   socket.broadcast.emit('modify_component', objectData);
    // })

    // // Remember to use a separate function for this... (not updateBoard)?
    // socket.on('remove_component', function(objectData) {
    //   removeFromHistory(objectData.id)
    //   boards.updateBoard(board, boardHistory);
    //   socket.broadcast.emit('remove_component', objectData);
    // })

    socket.on('path_created', function(objectData) {
      boards.updateBoard(board, objectData, boardHistory);
      socket.broadcast.emit('path_created', objectData);
    })
  });

}
