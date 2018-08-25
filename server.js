const express = require('express');
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const fabric = require('fabric').fabric;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

// start webserver on port 8080
const server = http.createServer(app);
const io = socketIo.listen(server);
server.listen(3000);
// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:3000");

// app.get('/', function(req, res) {
//   console.log("get / req", req);
//   res.sendStatus(200);
// });

const routes = require("./routes/routes.js")();
app.use("/boards", routes);

// TODO: add 404 error handling



// Cleanup step: move below to separate socket-io.js file
// require ('socket-io.js')

// array of all lines drawn
var componentHistory = [];
var client_count = 0;
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

  // first send the history to the new client
  for (let component of componentHistory) {
    socket.emit('add_component', component.rawData);
  }
  client_count += 1;
  socket.emit('init_session', {nextObjID: client_count * 10000});
  //    }

  // add handler for broadcast new component
  socket.on('push_component', function(data) {
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
