/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

const Game = require("./Game.js")
const Globals = require("./Globals.js")

window.addEventListener("load", function () {
  Globals.game = new Game()
  Globals.game.init()
})