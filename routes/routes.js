"use strict";

const express = require('express');
const routes = express.Router();

module.exports = function(DataHelpers) {

  routes.get('/test', function(req, res) {
    console.log('Get / req', req);
    res.render('test-board');
  });

  routes.post('/new', function(req, res) {
    console.log('Post /boards/new');
  });

  routes.delete('/:boardId', function(req, res) {
    console.log('Delete /boards/new');
  });

  return routes;

}

