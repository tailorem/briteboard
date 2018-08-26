const boards = require('./db/boards');
const clients = [];

module.exports = (io/*, dataHelpers*/) => {

  // array of all lines drawn
  const componentHistory = [];

  // update component history with incoming changes
  // event-handler for new incoming connections
  function updateComponentHistory(changes) {
    history = componentHistory.find(each => each.id === changes.id);
    if (history) {
      history.left = changes.left;
      history.top = changes.top,
        history.scaleX = changes.scaleX,
        history.scaleY = changes.scaleY,
        history.angle = changes.angle
    }
  }

  io.on('connection', function(socket) {
    clients.push(socket.id);

    console.log(boards);
    // console.log("SOCKET", socket);
    // const referer = (socket.request.headers.referer).split('/').reverse()[0];

    // first send the history to the new client
    for (let component of componentHistory) {
      socket.emit('add_component', component);
    }

    // add handler for broadcast new component
    socket.on('create_component', function(data) {
      componentHistory.push(data)
      // console.log(data);
      socket.broadcast.emit('add_component', data);
    })

    socket.on('modify_component', function(data) {
      // console.log(data);
      socket.broadcast.emit('update_component', data);
    })

    socket.on('remove_component', function(data) {
      // console.log(data);
      socket.broadcast.emit('delete_component', data);
    })

    socket.on('path_created', function(data) {
      socket.broadcast.emit('path_created', data);
    })
  });



}