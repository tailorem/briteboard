"use strict";

const express = require('express');
const routes = express.Router();
const boards = require('../db/boards');
const Board = require('../db/models/Board.js');

function rando() {
  return Math.random().toString(36).substr(2, 8);
}

module.exports = function(DataHelpers) {

  // CREATE NEW BOARD
  routes.post('/new', function(req, res) {
    const id = rando();
    const name = req.body.boardName;
    const templateId = parseInt(req.body.templateId);
    // console.log('TEMPLATE ID IN ROUTES:', templateId);
    const newBoard = new Board({
      name: name,
      id: id,
      template: templateId,
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
      if (board) {
        console.log('Loading board from db:');
        res.render('test-board', { board: board });
      } else {
        res.render('404');
      }
    });
  });

  // DELETE SPECIFIC BOARD
  routes.delete('/:boardId', function(req, res) {
    const boardId = req.params.boardId;
    if (boardId === '8ec5lhlh') { res.sendStatus("401"); }
    Board.deleteOne({ 'id': boardId }, function(err, board) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  });

  return routes;

}
