const THREE = require("three")
const Pid = require("./Pid")
const suji = require("./suji.json")
const Globals = require("./Globals")

class ProcessSelect {
  constructor () {
    this.pids = Pid.get_pids()

    this.blocks = []
    let cols = 10
    let width = 90
    let height = 90
    let interval_x = 150
    let interval_y = 150
    let font = new THREE.Font(suji)

    for (let i in this.pids) {
      let geometry = new THREE.PlaneGeometry( width, height, 1, 1 )
      let material = new THREE.MeshBasicMaterial( { color: 0xffffff } )
      let mesh = new THREE.Mesh( geometry, material )

      let x = i % cols - cols / 2 + 0.5
      let y = Math.floor(i / cols) - Math.floor(this.pids.length / cols)
      mesh.position.x = x * interval_x
      mesh.position.y = y * interval_y
      mesh.position.z = 0
      Globals.scene.add( mesh )

      let label_geometry = new THREE.TextGeometry( this.pids[i].toString(), {
        font: font,
        size: 10
      })
      let label_material = new THREE.MeshBasicMaterial( { color: 0x052344 } )
      let label_mesh = new THREE.Mesh( label_geometry, label_material )
      label_mesh.position.x = x * interval_x - width / 2 + 5
      label_mesh.position.y = y * interval_y - height / 2 + 5
      label_mesh.position.z = 1
      Globals.scene.add( label_mesh )

      this.blocks.push(geometry, material, mesh)
    }
  }

  update () {
  }
}

module.exports = ProcessSelect