// Test boards

const boards = {
  "test": {
    name: "Our Test Board",
    componentHistory: []
  },
  "n7sdj02k": {
    name: "Another Board",
    componentHistory: []
  }
}

module.exports = {
  initializeBoard(id, data) {
  },
  getBoard(id) {
    return boards[id]
  },
  updateBoard(id, data) {

  }
}
