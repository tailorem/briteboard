
const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const socketIo = require('socket.io');
const io = socketIo.listen(server);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['secret', 'key']
}));

const fabric = require('fabric').fabric;

app.set('view engine', 'ejs');

const PORT = 3000;

// start web server
server.listen(PORT);

// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:3000");

const routes = require("./routes/routes.js")();
app.use("/boards", routes);

// TODO: add 404 error handling

require('./socket-io')(io/*, dataHelpers*/)