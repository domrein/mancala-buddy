import Hole from "./Hole.js";

export default class Board {
  constructor() {
    /** @type {Hole[]} */
    this.holes = [];
    this.cloneDepth = 0;

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 7; j++) {
        const hole = new Hole();
        hole.type = j + 1 === 7 ? "home" : "regular";
        hole.owner = !i ? "player1" : "player2";
        hole.index = j;

        this.holes.push(hole);
      }
    }
  }

  /**
   * Populates board by setting piece counts for each hole
   * @param {number[]} pieceCounts
   */
  populate(pieceCounts) {
    if (pieceCounts.length !== this.holes.length) {
      throw new Error("Invalid counts to set board");
    }

    this.holes.forEach(h => h.pieces = 0);
    pieceCounts.forEach((c, i) => this.holes[i].pieces = c);
  }

  clone() {
    const board = new Board();
    board.populate(this.holes.map(h => h.pieces));
    board.cloneDepth = this.cloneDepth + 1;

    return board;
  }

  /**
   * Gets score for specified player
   * @param {"player1"|"player2"} player
   */
  getScore(player) {
    const homeHole = this.holes.find(h => h.owner === player && h.type === "home");
    if (!homeHole) {
      throw new Error("Error getting score for player");
    }

    return homeHole.pieces;
  }

  /**
   * Gets index of hole in holes array
   * @param {Hole} hole
   * @return {number}
   */
  getHoleIndex(hole) {
    const index = this.holes.findIndex(h => h === hole);
    if (index === -1) {
      throw new Error("Error finding hole index");
    }

    return index;
  }

  /**
   * Calculates best move a player can make on their turn
   * @param {"player1"|"player2"} player
   * @return {Hole|null}
   */
  findBestMove(player) {
    // HACK: if we're cloning deeper than 10 levels, just give up because there's a bug probably
    // if (this.cloneDepth > 10) {
    //   // return this.holes[0];
    //   return this.holes.filter(h => h.pieces > 0)[0];
    // }

    // console.log(`Clone depth: ${this.cloneDepth}`);
    let highestScore = this.getScore(player);
    let holeChoice = null;
    // calculate points made by selecting each hole
    this.holes
      .filter(hole => hole.owner === player && hole.type === "regular" && hole.pieces)
      .forEach(hole => {
        const b = this.clone();
        const h = b.holes[this.getHoleIndex(hole)];
        // console.log(`${this.cloneDepth} -> ${b.getHoleIndex(h)}`);

        b.movePieces(h, player);
        // b.print();

        let score = b.getScore(player);
        if (score >= highestScore) {
          highestScore = score;
          holeChoice = hole;
          // console.log(`Score: ${highestScore}`);
        }
      });
    // console.log("highestScore:", highestScore);

    return holeChoice;
  }

  /**
   * Move pieces starting with designated hole
   * @param {Hole} hole
   * @param {"player1"|"player2"} player
   */
  movePieces(hole, player) {
    let holeIndex = this.getHoleIndex(hole);

    // grab all the pieces for the current hole
    let pieces = hole.pieces;
    hole.pieces = 0;

    // drop one piece in each hole until we're out
    while (pieces) {
      // get next hole
      holeIndex++;
      holeIndex %= this.holes.length;
      hole = this.holes[holeIndex];

      // drop the piece in
      if (hole.type === "regular" || hole.owner === player) {
        hole.pieces++;
        pieces--;
      }

      // if we're out of pieces
      if (!pieces) {
        // free turn if we're in our home and there are more pieces to move
        if (
          hole.owner === player
          && hole.type === "home"
          && this.holes.find(h => h.owner === player && h.type === "regular" && h.pieces)
        ) {
          const bestHole = this.findBestMove(player);
          // if (bestHole) {
          //   this.movePieces(bestHole, player);
          // }
        }
        // move pieces again if we caused an avalanche
        else if (hole.pieces > 1 && hole.type !== "home") {
          // if (hole.type === "home") {
          //   throw new Error("avalanched on home")
          // }
          this.movePieces(hole, player);
        }
      }
    }
  }

  print() {
    const pieceCounts = this.holes.map(h => h.getPiecesString());
    console.log(pieceCounts.slice(0, pieceCounts.length / 2).join(" "));
    console.log("  ", pieceCounts.slice(pieceCounts.length / 2).join(" "));
  }
}
