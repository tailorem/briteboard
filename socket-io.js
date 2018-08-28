// const boards = require('./db/boards');
const clients = {};
// const Board = require('./db/models/Board.js');

// UPDATE DATABASE
// Board.update(
//  { 'id': 'erjb0tx8' },
//  { "$push": { "componentHistory": {test: 'test'} } },
//  function(err,callback) {
//  });

// function getBoard(boardId){
//   Board.findOne({ 'id': boardId }, function(err, targetBoard) {
//      console.log(targetBoard.componentHistory);
//   });
// }

// function updateBoard(boardId, dataObj){
//  Board.update(
//   { 'id': boardId },
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

module.exports = (io, boards) => {

  // array of all lines drawn
  let componentHistory = [];

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
      history.angle = changes.angle,
      history.text = changes.text
    }
  }

  function removeFromHistory(id) {
    componentHistory = componentHistory.filter(each => each.id !== id)
  }

  io.on('connection', function(socket) {
    console.log("client connected")

    const board = (socket.request.headers.referer).split('/').reverse()[0];
    socket.join(board);

  ////////////////////////////////////////////
  //             CLIENT INFO                //
  ////////////////////////////////////////////


    console.log("all board ids (BEFORE):", boards.getAllBoardIds());

    const client = { boardId: board };
    // boards[board].componentHistory = []; // this line will overwrite board history, should be assigned on creation


    // const client = { name: 'Anon', boardId: board };
    clients[socket.id] = client;

    // Send connection message to client
    socket.emit('connected', { currentUsers: getCurrentUsers(board), notification: "You've successfully connected!" });

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

    // first send the history to the new client
    for (let data of componentHistory) {
      socket.emit('create_component', data);
    }

    // add handler for broadcast new component
    socket.on('create_component', function(data) {
      componentHistory.push(data)
      updateBoard(board, componentHistory);
      socket.broadcast.emit('create_component', data);
    })

    socket.on('modify_component', function(data) {
      updateComponentHistory(data);
      updateBoard(board, componentHistory);
      socket.broadcast.emit('modify_component', data);
    })

    socket.on('remove_component', function(data) {
      removeFromHistory(data.id)
      updateBoard(board, componentHistory);
      socket.broadcast.emit('remove_component', data);
    })

    socket.on('path_created', function(data) {
      componentHistory.push(data)
      updateBoard(board, componentHistory);
      socket.broadcast.emit('path_created', data);
    })
  });
}
