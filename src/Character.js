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
    this.geometry = new THREE.PlaneGeometry(5, 5, 32)
    this.mesh = new THREE.Mesh(this.geometry, this.material)

    Globals.scene.add(this.mesh)
  }

  // click event handler
  // input: click event position on window
  onClick (vec) {
    this.eases.push([
      Math.atan((vec.x - Globals.width / 2) * 0.04) * 0.05 * Globals.delta * 0.06,
      Math.atan((-vec.y + Globals.height / 2) * 0.04) * 0.05 * Globals.delta * 0.06,
      this.time
    ])
  }

  update () {
    this.mesh.position.x = this.coordinate.x
    this.mesh.position.y = this.coordinate.y

    for (let i of this.eases) {
      let t = this.time - i[2] - 5

      this.velocity.x += i[0] / (0.1 * t * t + 1)
      this.velocity.y += i[1] / (0.1 * t * t + 1)
    }

    this.velocity.x *= 0.995
    this.velocity.y *= 0.995

    this.coordinate.x += this.velocity.x
    this.coordinate.y += this.velocity.y

    this.time += 1
  }
}

module.exports = Character
