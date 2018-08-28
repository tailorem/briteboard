const clients = {};

// UPDATE DATABASE
// Board.update(
//  { 'id': 'erjb0tx8' },
//  { "$push": { "componentHistory": {test: 'test'} } },
//  function(err,callback) {
//  });

// function getBoard(board){
//   Board.findOne({ 'id': board }, function(err, targetBoard) {
//      console.log(targetBoard.componentHistory);
//   });
// }

// function updateBoard(board, dataObj){
//  Board.update(
//   { 'id': board },
//   { "componentHistory": dataObj } ,
//   function(err,callback) {
//   });
//   console.log('updated DB!');
// }

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

// Export to server.js
module.exports = (io, boards) => {
  // array of all lines drawn
  // let boardHistory = [];
  // let allBoardsData = boards.getAllBoards();
  // console.log("ALL BOARDS DATA", allBoardsData);


  let DEBUG = false;


  // SOCKET CONNECTION RECEIVED
  io.on('connection', function(socket) {
    console.log("client connected")

    const board = (socket.request.headers.referer).split('/').reverse()[0];
    socket.join(board);

  ////////////////////////////////////////////
  //             CLIENT INFO                //
  ////////////////////////////////////////////

    // console.log("all board ids (BEFORE):", boards.getAllBoardIds());

    const client = { boardId: board };
    // boards[board].componentHistory = []; // this line will overwrite board history, should be assigned on creation


    // const client = { name: 'Anon', boardId: board };

    clients[socket.id] = client;

    // Send connection message to client
    socket.emit('connected', { currentUsers: getCurrentUsers(board), notification: "You've successfully connected!", data: boards.getBoard(board) });

    // Send connection message to other clients in the room
    socket.to(board).emit('new connection', { currentUsers: getCurrentUsers(board), notification: "Someone has joined the room!" });

    //
    // socket.on('username selected', (username) => {
    //   clients[socket.id].name = username;
    //   io/*socket.broadcast.to(board)*/.emit('new connection', getCurrentUsers(board));
    //   console.log("username selected");
    // });

    // Send disconnect message to everyone in the room
    socket.on('disconnect', (reason) => {
      delete clients[socket.id];
      io.in(board).emit('user disconnected', { currentUsers: getCurrentUsers(board), notification: "Someone has left the room!" });
      console.log("client disconnected")
    });
    // console.log(socket.id, board);
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
    });

  });
}
