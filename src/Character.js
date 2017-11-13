const THREE = require("three")
const Globals = require("./Globals")

class Character {
  constructor () {
    this.eases = []

    this.coordinate = new THREE.Vector2(0, 0)

    this.material = new THREE.MeshBasicMaterial( { color: 0xffffff } )
    this.geometry = new THREE.CircleGeometry( 3, 64 )
    this.mesh = new THREE.Mesh( this.geometry, this.material )

    Globals.scene.add( this.mesh )
  }

  // click event handler
  // input: click event position on window
  on_click (vec) {
    this.eases.push([new THREE.Vector2(
      Math.atan( vec.x - Globals.width / 2) / 3,
      Math.atan(-vec.y + Globals.height / 2) / 3
    ), 0])
  }

  get velocity () {
    let vec = new THREE.Vector2(0, 0)

    for (let i of this.eases) {
      let coeffs = i[0], t = i[1]

      if (t <= 1) {
        vec.x += coeffs.x / (10*t*t + 1)
        vec.y += coeffs.y / (10*t*t + 1)

        i[1] += 0.001
      }
    }

    return vec
  }

  update () {
    this.mesh.position.x = this.coordinate.x
    this.mesh.position.y = this.coordinate.y

    this.coordinate.add(this.velocity)
  }
}

module.exports = Character