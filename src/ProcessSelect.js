const THREE = require("three")
const Pid = require("./Pid")
const suji = require("./suji.json")
const Globals = require("./Globals")

class ProcessSelect {
  constructor () {
    this.pids = Pid.get_pids()

    this.blocks = []
    this.cols = 10
    this.block_width = 90
    this.block_height = 90
    this.interval_x = 150
    this.interval_y = 150
    this.offset_x = - (this.cols / 2 + 0.5) * this.interval_x
    this.offset_y = - Math.floor(this.pids.length / this.cols) * this.interval_y

    let font = new THREE.Font(suji)

    for (let i in this.pids) {
      let geometry = new THREE.PlaneGeometry( this.block_width, this.block_height, 1, 1 )
      let material = new THREE.MeshBasicMaterial( { color: 0xffffff } )
      let mesh = new THREE.Mesh( geometry, material )

      let x = i % this.cols
      let y = Math.floor(i / this.cols)

      mesh.position.x = x * this.interval_x + this.offset_x
      mesh.position.y = y * this.interval_y + this.offset_y
      mesh.position.z = 0
      Globals.scene.add( mesh )

      this.blocks.push([geometry, material, mesh])

      let label_geometry = new THREE.TextGeometry( this.pids[i].toString(), {
        font: font,
        size: 10
      })
      let label_material = new THREE.MeshBasicMaterial( { color: 0x052344 } )
      let label_mesh = new THREE.Mesh( label_geometry, label_material )
      label_mesh.position.x = x * this.interval_x - this.block_width / 2 + 5 + this.offset_x
      label_mesh.position.y = y * this.interval_y - this.block_height / 2 + 5 + this.offset_y
      label_mesh.position.z = 1
      Globals.scene.add( label_mesh )
    }
  }

  update () {
    let coord = Globals.character.coordinate

    // calculate index of pids from coordinate
    let x = coord.x - this.offset_x
    let y = coord.y - this.offset_y
    let x_rem = x % this.interval_x
    let y_rem = y % this.interval_y
    let x_quo = Math.floor(x / this.interval_x)
    let y_quo = Math.floor(y / this.interval_y)
    let index = x_quo + y_quo * this.cols

    // collision detection
    if () {
      
    }
  }
}

module.exports = ProcessSelect