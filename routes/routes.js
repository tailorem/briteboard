"use strict";

const express = require('express');
const routes = express.Router();
const boards = require('../db/boards');
const Board = require('../db/models/Board.js');

function rando() {
  return Math.random().toString(36).substr(2, 8);
}

module.exports = function(DataHelpers) {

  // GET TEST BOARD (development only)
  // routes.get('/test', function(req, res) {
  //   res.render('test-board');
  // });

  // CREATE NEW BOARD
  routes.post('/new', function(req, res) {
    const id = rando();
    const name = req.body.boardName;
    const newBoard = new Board({
      name: name,
      id: id,
      componentHistory: []
    });

    newBoard.save()
      .then(board => { boards.init() })
      .then(board => { res.redirect(`/boards/${id}`) });

    //console.log('New board added to db:', JSON.stringify(board));

});



  // GET SPECIFIC BOARD
  routes.get('/:boardId', function(req, res) {
    const boardId = req.params.boardId;
    Board.findOne({ 'id': boardId }, function(err, board) {
      if (err) console.log(err);
      console.log('Loading board from db:'/*, board*/);
      if (board) {
        res.render('test-board', { board: board });
      } else {
        res.sendStatus(404);
      }
    });

    // let user = null;

  });

// // DELETE SPECIFIC BOARD
// routes.delete('/:boardId', function(req, res) {
//   console.log('Delete /boards/new');
//   // delete board
//   // redirect to home
// });

return routes;

}
