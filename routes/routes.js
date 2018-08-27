"use strict";

const express = require('express');
const routes = express.Router();
const boards = require('../db/boards');

function rando(){
  return Math.random().toString(36).substr(2, 8);
}

module.exports = function(DataHelpers) {

  // GET TEST BOARD (development only)
  // routes.get('/test', function(req, res) {
  //   res.render('test-board');
  // });

  // CREATE NEW BOARD
  routes.post('/new', function(req, res) {
    const rNum = rando();
    boards[rNum] = {
      name: req.body.boardName,
      componentHistory: []
    }
    res.redirect(`/boards/${rNum}`);
  });

  // GET SPECIFIC BOARD
  routes.get('/:boardId', function(req, res) {
    // let user = null;
    const board = boards[req.params.boardId];
    if (board) {
      res.render('test-board', { board });
    } else {
      res.sendStatus(404);
    }
  });

  // // DELETE SPECIFIC BOARD
  // routes.delete('/:boardId', function(req, res) {
  //   console.log('Delete /boards/new');
  //   // delete board
  //   // redirect to home
  // });

  return routes;

}

