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
  addObject: (boardId, newObject) => {
    // 1) add it to in-memory `boards`
    // 2) add it to the database (for backup)
  },
  countBoards: () => {
    return boards.length;
  },
  getAllBoardIds: () => {
    return boards.map(b => b.id);
  },

}


