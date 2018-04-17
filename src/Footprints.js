/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

const THREE = require('THREE')
const Globals = require('./Globals')

let MAX_POINTS = 100

function shuffle (array) {
  let n = array.length
  let t
  let i

  while (n) {
    i = Math.floor(Math.random() * n--)
    t = array[n]
    array[n] = array[i]
    array[i] = t
  }

  return array
}

class Footprints {
  constructor () {
    this.points_geometry = new THREE.BufferGeometry()
    this.points_geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_POINTS * 3), 3))
    this.points_geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(MAX_POINTS * 3), 3))
    this.points_material = new THREE.PointsMaterial({ vertexColors: true, size: 2, sizeAttenuation: false })
    this.points = new THREE.Points(this.points_geometry, this.points_material)
    Globals.scene.add(this.points)

    // stores coordinate and color of each point.
    this.coordinates_and_colors = []
  }

  update () {
    this.coordinates_and_colors = this.coordinates_and_colors.filter((x) => (x[2] > 0.01))

    this.coordinates_and_colors.push([Globals.character.coordinate.x, Globals.character.coordinate.y, 1])
    shuffle(this.coordinates_and_colors)

    this.points.position.x = Math.floor(Globals.character.coordinate.x)
    this.points.position.y = Math.floor(Globals.character.coordinate.y)

    let position = this.points_geometry.attributes.position.array
    let color = this.points_geometry.attributes.color.array

    let posIndex = 0
    let colIndex = 0

    for (let i = 0; i < this.coordinates_and_colors.length; i++) {
      let x = this.coordinates_and_colors[i][0]
      let y = this.coordinates_and_colors[i][1]
      let c = this.coordinates_and_colors[i][2] // the color of footprint

      position[posIndex++] = x - Globals.character.coordinate.x
      position[posIndex++] = y - Globals.character.coordinate.y
      position[posIndex++] = -10

      color[colIndex++] = c
      color[colIndex++] = c
      color[colIndex++] = c

      this.coordinates_and_colors[i][2] *= 0.95
    }

    this.points_geometry.attributes.position.needsUpdate = true
    this.points_geometry.attributes.color.needsUpdate = true
    this.points_geometry.setDrawRange(0, this.coordinates_and_colors.length)
  }
}

module.exports = Footprints
