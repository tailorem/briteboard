const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

const BoardSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  template: {
    type: Number,
    required: true
  },
  backgroundColor: {
    type: String,
    required: false
  },
  componentHistory: {
    type: Array,
    required: true
  }
})

module.exports = Board = mongoose.model('board', BoardSchema);
