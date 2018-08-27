const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const mongoose = require('mongoose');

const socketIo = require('socket.io');
const io = socketIo.listen(server);

io.set('heartbeat timeout', 4000);
io.set('heartbeat interval', 2000);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


// Use cookie session for persisting user sessions?
// const cookieSession = require('cookie-session')
// app.use(cookieSession({
//   name: 'session',
//   keys: ['secret', 'key']
// }));

// Server-side fabric
// const fabric = require('fabric').fabric;


app.set('view engine', 'ejs');

// DB Config
const db = require('./db/config/keys').mongoURI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log('MongoDB connected')
    /* load all boards into memory from db */
    /* server.listen */
  })
  .catch(err => console.log(err));

const PORT = process.env.PORT || 3000;

// start web server
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:3000");

const routes = require("./routes/routes.js")();
app.use("/boards", routes);

// TODO: add 404 error handling

require('./socket-io')(io/*, dataHelpers*/)
