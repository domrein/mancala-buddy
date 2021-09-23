export default class Hole {
  constructor() {
    this.pieces = 0;

    /** @type {"regular"|"home"} */
    this.type = "regular";

    /** @type {"player1"|"player2"} */
    this.owner = "player1";
  }

  getPiecesString() {
    return `${this.pieces}`.padStart(2);
  }
}
