import Board from "./Board.js";

const board = new Board();
board.populate([
  4,
  4,
  4,
  4,
  4,
  4,
  0, // player  1 home
  4,
  4,
  4,
  4,
  4,
  4,
  0, // player 2 home
]);
const holeName = board.findBestMove("player1");
console.log(holeName);
