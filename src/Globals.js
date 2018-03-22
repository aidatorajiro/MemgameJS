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
  processSelect: undefined,
  processView: undefined,
  character: undefined,
  footprints: undefined,
  get width () {
    return window.innerWidth
  },
  get height () {
    return window.innerHeight
  }
}
