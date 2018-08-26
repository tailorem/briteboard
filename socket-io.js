const boards = require('./db/boards');
const clients = [];

module.exports = (io/*, dataHelpers*/) => {

  // array of all lines drawn
  var componentHistory = [];

  // update component history with incoming changes
  // event-handler for new incoming connections
  function updateComponentHistory(changes) {
    history = componentHistory.find(each => each.id === changes.id);
    if (history) {
      console.log("History changes", changes);
      console.log("History: before", history.comp)
      history.left = changes.left;
      history.top = changes.top,
      history.height = changes.height;
      history.scaleX = changes.scaleX,
      history.scaleY = changes.scaleY,
      history.angle = changes.angle
    }
  }
  function remvoeFromHistory(id) {
    componentHistory = componentHistory.filter(each => each.id !== id)
  }

  io.on('connection', function(socket) {
    clients.push(socket.id);

    console.log(boards);
    // console.log("SOCKET", socket);
    // const referer = (socket.request.headers.referer).split('/').reverse()[0];

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
      remvoeFromHistory(data.id)
      socket.broadcast.emit('remove_component', data);
    })

    socket.on('path_created', function(data) {
      componentHistory.push(data)
      socket.broadcast.emit('path_created', data);
    })
  });



}