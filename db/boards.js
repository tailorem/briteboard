// In memory array of boards loaded from MongoDB

const Board = require('./models/Board.js');

let boards = [
  {
    name: "Our Test Board",
    id: "test",
    componentHistory: []
  },
  {
    name: "Another Board",
    id: "n7sdj02k",
    componentHistory: []
  }
];

module.exports = {
  init: (success_cb) => {
    // before DB working, do nothing because global boards is already dummy-initialized.

    /* load all boards into memory from db */
    Board.find({}, (err, dbBoardsData) => {
      if (err) {
        console.log("holy cow, could not init data");
      }
      boards = dbBoardsData;    // or maybe something else?
      if (success_cb) { success_cb(); }
    });

    // // Promise-y alternative.  Not tested!  May not work!
    // Board.find({}).exec()
    // .then((dbBoardsData) => {
    //   boards = dbBoardsData;    // or maybe something else?  maybe fussy rehydrating?
    //   if (success_cb) { success_cb(); }
    // })
    // .catch((ohno) => {
    //   console.log("holy cow, could not init data");
    // });

  },
  getBoard: (id) => {
    return boards.filter(b => b.id === id)[0];
  },
  getBoardHistory: (id) => {
    let data = boards.find(b => b.id === id);
    return data ? data.componentHistory : [];
  },
  deleteObject: (id, boardHistory) => {
    Board.updateOne(
    { 'id': id },
    // { "$push": { "componentHistory": dataObj } },
    { "componentHistory": boardHistory } ,
    function(err, callback) {
      if (err) {
        console.log(err);
      } else {
        console.log("DELETED FROM MongoDB!")
      }
    });
  },
  // TODO: Separate this into different functions
  updateBoard: (id, objectData, boardHistory) => {
    // add objectData to appropriate board history
    // 1) add it to in-memory `boards`
    // 2) add it to the database (for backup)
    boards.find(b => b.id === id).componentHistory.push(objectData);
console.log("Board History", boardHistory)
    Board.updateOne(
    { 'id': id },
    // { "$push": { "componentHistory": dataObj } },
    { "componentHistory": boardHistory } ,
    function(err, callback) {
      if (err) {
        console.log(err);
      } else {
        console.log("Updated MongoDB!")
      }
    });
    console.log('updated in memory DB!');
  }

}
