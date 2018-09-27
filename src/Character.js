/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

const THREE = require('three')
const Globals = require('./Globals')

class Character {
  constructor () {
    this.eases = []

    this.time = 0 // frame count

    this.velocity = new THREE.Vector2(0, 0)
    this.coordinate = new THREE.Vector2(0, 0)

    this.material = new THREE.MeshBasicMaterial({ color: 0xffffff })
    this.geometry = new THREE.CircleGeometry(2.5, 16)
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.position.z = -10

    Globals.scene.add(this.mesh)
  }

  // click event handler
  // input: click event position on window
  onClick (vec) {
    this.eases.push([
      Math.atan((vec.x - Globals.width / 2) * 0.04) * 0.01,
      Math.atan((-vec.y + Globals.height / 2) * 0.04) * 0.01,
      this.time
    ])
  }

  update () {
    this.mesh.position.x = this.coordinate.x
    this.mesh.position.y = this.coordinate.y

    this.eases = this.eases.filter((i) => {
      let t = this.time - i[2] - 5

      let ax = i[0] / (0.1 * t * t + 1)
      let ay = i[1] / (0.1 * t * t + 1)

      this.velocity.x += ax
      this.velocity.y += ay

      return true;
    })

    this.velocity.x *= 0.995
    this.velocity.y *= 0.995

    this.coordinate.x += this.velocity.x
    this.coordinate.y += this.velocity.y

    this.time += 1
  }
}

module.exports = Character
