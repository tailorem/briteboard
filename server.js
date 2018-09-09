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

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Set view engine
app.set('view engine', 'ejs');

// DB Config
const DB_URI = require('./db/config/keys').mongoURI;
const PORT = process.env.PORT || 3000;
const routes = require("./routes/routes.js")();


// Connect to MongoDB
mongoose.connect(DB_URI, { useNewUrlParser: true })
.then((db) => {
  console.log('MongoDB connected!');

  // add directory with our static files
  app.use(express.static(__dirname + '/public'));
  console.log("Server running on 127.0.0.1:3000");

  app.use("/boards", routes);

  // Temp 404 handler
  app.use((req, res) => {
    res.status(404).redirect("/");
  });

  const boards = require('./db/boards');

  boards.init(() => {
    console.log("In memory cache re-hydrated");

    // start web server
    server.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });

    require('./socket-events')(io, boards);
  });

})
.catch(err => {
  throw(err);
});
