const Game = require("./Game.js")
const Globals = require("./Globals.js")

window.addEventListener("load", function () {
  Globals.game = new Game()
  Globals.game.init()
})