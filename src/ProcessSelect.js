const THREE = require("three")
const Pid = require("./Pid")
const suji = require("./suji.json")
const Globals = require("./Globals")

class ProcessSelect {
  constructor () {
    this.pids = Pid.get_pids()

    this.meshes = []
    let cols = 10
    let width = 90
    let height = 90
    let interval_x = 150
    let interval_y = 150
    let font = new THREE.Font(suji)

    for (let i in this.pids) {
      let x = (i % cols - cols / 2 + 0.5) * interval_x
      let y = (Math.floor(i / cols) - Math.floor(this.pids.length / cols)) * interval_y

      // block
      {
        let geometry = new THREE.PlaneGeometry( width, height, 1, 1 )
        let material = new THREE.MeshBasicMaterial( { color: 0xffffff } )
        let mesh = new THREE.Mesh( geometry, material )

        mesh.position.x = x
        mesh.position.y = y
        mesh.position.z = 0
        Globals.scene.add( mesh )

        this.meshes.push( mesh )
      }

      // label
      {
        let geometry = new THREE.TextGeometry( this.pids[i].toString(), {
          font: font,
          size: 10
        })
        let material = new THREE.MeshBasicMaterial( { color: 0x052344 } )
        let mesh = new THREE.Mesh( geometry, material )
        mesh.position.x = x - width / 2 + 5
        mesh.position.y = y - height / 2 + 5
        mesh.position.z = 1
        Globals.scene.add( mesh )
      }

    }
  }

  update () {
    // colision detection to all of the blocks
    let c = Globals.character.coordinate
    let ray = new THREE.Raycaster(new THREE.Vector3(c.x, c.y, 0), new THREE.Vector3(0, 0, -1))
    for (let mesh of this.meshes) {
      let intersect = ray.intersectObject(mesh)
      if (intersect.length > 0) {
        
      }
    }
  }
}

module.exports = ProcessSelect