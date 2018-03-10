/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

module.exports = {
  delta: undefined,
  scene: undefined,
  camera: undefined,
  renderer: undefined,
  game: undefined,
  process_select: undefined,
  process_view: undefined,
  character: undefined,
  get width () {
    return window.innerWidth
  },
  get height () {
    return window.innerHeight
  }
}