module.exports = {
  capturer: undefined, // used for the capture mode
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