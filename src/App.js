const Game = require("./Game.js")
const globals = require("./Globals.js")

window.addEventListener("load", function () {
  globals.game = new Game()
  globals.game.init()
})