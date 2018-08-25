"use strict";

const express = require('express');
const routes = express.Router();
const boards = require('../db/boards');

module.exports = function(DataHelpers) {

  // GET TEST BOARD
  routes.get('/test', function(req, res) {
    // console.log('Get / req', req);
    res.render('test-board');
  });

  // CREATE NEW BOARD
  routes.post('/new', function(req, res) {
    console.log('Post /boards/new');
    console.log(boards);
    console.log(req.body);
    res.sendStatus(201);
  });

  // GET SPECIFIC BOARD
  routes.get('/:boardId', function(req, res) {
    if (boards[req.params.boardId]) {
      res.render('test-board');
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

