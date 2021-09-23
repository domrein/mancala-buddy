// test.mjs
import assert from "assert";
import sinon from "sinon";

import Board from "./Board.js";

describe("Board", function () {
  describe("constructor", function () {
    it("should create board with 14 holes", () => {
      const board = new Board();
      assert.strictEqual(board.holes.length, 14);
    });

    it("should create board with 2 homes", () => {
      const board = new Board();
      assert.strictEqual(board.holes.filter(h => h.type === "home").length, 2);
    });

    it("should create board with correct hole types in order", function() {
      const board = new Board();
      assert.deepStrictEqual(
        board.holes.map(h => h.type),
        [
          "regular",
          "regular",
          "regular",
          "regular",
          "regular",
          "regular",
          "home",
          "regular",
          "regular",
          "regular",
          "regular",
          "regular",
          "regular",
          "home",
        ],
      );
    });

    it("should create board with correct hole owners", function() {
      const board = new Board();
      assert.deepStrictEqual(
        board.holes.map(h => h.owner),
        [
          "player1",
          "player1",
          "player1",
          "player1",
          "player1",
          "player1",
          "player1",
          "player2",
          "player2",
          "player2",
          "player2",
          "player2",
          "player2",
          "player2",
        ],
      );
    });

    it("should create with empty holes", () => {
      const board = new Board();
      assert.strictEqual(board.holes.filter(h => !h.pieces).length, 14);
    });
  });

  describe("populate", function() {
    it("should set each board hole to specified piece count", function() {
      const board = new Board();
      const counts = [1, 2, 1, 2, 1, 2, 3, 4, 5, 4, 5, 4, 5, 6];
      board.populate(counts);
      for (let i = 0; i < board.holes.length; i++) {
        assert.strictEqual(board.holes[i].pieces, counts[i]);
      }
    });
  });

  describe("clone", function() {
    it("should return new board", function() {
      const board = new Board();
      const clone = board.clone();
      assert.strictEqual(board !== clone, true);
    });

    it("should copy board holes values", function() {
      const board = new Board();
      board.populate([1, 2, 1, 2, 1, 2, 3, 4, 5, 4, 5, 4, 5, 6]);
      const clone = board.clone();
      for (let i = 0; i < board.holes.length; i++) {
        assert.strictEqual(board.holes[i].pieces, clone.holes[i].pieces);
      }
    });
  });

  describe("getScore", function() {
    it("should return score for players", function() {
      const board = new Board();
      board.populate([0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 5, 4, 5, 6]);
      assert.strictEqual(board.getScore("player1"), 3);
      assert.strictEqual(board.getScore("player2"), 6);
    });
  });

  describe("getHoleIndex", function() {
    it("should return array index for hole", function() {
      const board = new Board();
      const regularHole = board.holes[0];
      const homeHole = board.holes[13];
      assert.strictEqual(board.getHoleIndex(regularHole), 0);
      assert.strictEqual(board.getHoleIndex(homeHole), 13);
    });
  });

  describe("movePieces", function() {
    it("should move one piece from one hole to the next", function() {
      const board = new Board();
      board.populate([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      board.movePieces(board.holes[0], "player1");
      assert.deepStrictEqual(
        board.holes.map(h => h.pieces),
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      );
    });

    it("should move two pieces to the next holes", function() {
      const board = new Board();
      board.populate([2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      board.movePieces(board.holes[0], "player1");

      assert.deepStrictEqual(
        board.holes.map(h => h.pieces),
        [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      );
    });

    it("should move two pieces to the next holes skipping opponent home hole", function() {
      const board = new Board();
      board.populate([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0]);
      board.movePieces(board.holes[11], "player1");

      assert.deepStrictEqual(
        board.holes.map(h => h.pieces),
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      );
    });

    it("should trigger avalanche when ending on populated hole", function() {
      const board = new Board();
      board.populate([1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      board.movePieces(board.holes[0], "player1");

      assert.deepStrictEqual(
        board.holes.map(h => h.pieces),
        [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      );
    });

    it("should give free turn if landing on player's home", function() {
      const board = new Board();
      board.populate([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
      const stub = sinon.stub(board, "findBestMove");
      board.movePieces(board.holes[5], "player1");
      assert.strictEqual(stub.callCount, 1);
    });
  });

  describe("findBestMove", function() {
    it("should identify highest scoring move available on board", function() {
      const board = new Board();
      board.populate([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      const move = board.findBestMove("player1");
      assert.strictEqual(move, "player1 regular 0");
    });

    it("should identify highest scoring move available on board with avalanche", function() {
      const board = new Board();
      board.populate([1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      const move = board.findBestMove("player1");
      assert.strictEqual(move, "player1 regular 1");
    });

    it("should identify highest scoring move available on board with free turn", function() {
      const board = new Board();
      board.populate([0, 0, 5, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
      const move = board.findBestMove("player1");
      assert.strictEqual(move, "player1 regular 5");
    });

    it("should identify highest scoring move available on board with multiple free turns", function() {
      const board = new Board();
      // board.populate([6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
      board.populate([0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
      const move = board.findBestMove("player1");
      assert.strictEqual(move, "player1 regular 5");
    });

    it("should identify highest scoring move available on board with free turn", function() {
      const board = new Board();
      board.populate([4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]);
      const move = board.findBestMove("player1");
      // assert.strictEqual(move, "player1 regular 5");
    });
  });
});
