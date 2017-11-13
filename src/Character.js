const THREE = require("three")
const Globals = require("./Globals")

class Character {
  constructor () {
    this.coordinate = new THREE.Vector2(0, 0)
    this.velocity = new THREE.Vector2(0, 0)

    this.material = new THREE.MeshBasicMaterial( { color: 0xffffff } )
    this.geometry = new THREE.CircleGeometry( 3, 64 )
    this.mesh = new THREE.Mesh( this.geometry, this.material )

    Globals.scene.add( this.mesh )
  }

  // click event handler
  // input: click event position on window
  on_click (x, y) {
    // convert (x, y) into the change amount between window center and click position
    x -= Globals.width
    y -= Globals.height

    this.velocity.x += atan(x)
    this.velocity.y += atan(y)
  }

  update () {
    this.mesh.position.x = this.coordinate.x
    this.mesh.position.y = this.coordinate.y

    this.coordinate.add(this.velocity)
  }
}

module.exports = Character