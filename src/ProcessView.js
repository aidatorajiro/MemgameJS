/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

const THREE = require('THREE')

const Memory = require('./Memory')
const Globals = require('./Globals')

// mathematical modulo
let mod = function (n, m) {
  return ((n % m) + m) % m
}

// random coice from an array
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

let MAX_POINTS = 10000

class ProcessView {
  constructor (pid) {
    this.tickcount = 0

    this.mem = new Memory(pid)

    for (let region of shuffle(this.mem.getRegions())) {
      this.region = region
      this.world_size = this.region[1]
      this.world_width = this.world_height = Math.floor(Math.sqrt(this.world_size))
      this.world_offset_x = Math.floor(this.world_width / 2)
      this.world_offset_y = Math.floor(this.world_height / 2)

      console.log(this.world_width)

      let sum = 0
      for (let i = 0; i < 10; i++) {
        sum += this.getByteSync(this.world_offset_x, i + this.world_offset_y, 10).reduce((x, y) => (x + y))
      }

      console.log(sum)

      if (sum > 0) {
        break
      }
    }

    this.world_geometry = new THREE.BufferGeometry()
    this.world_geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_POINTS * 3), 3))
    this.world_geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(MAX_POINTS * 3), 3))

    this.world_material = new THREE.PointsMaterial({ vertexColors: true, size: 10, sizeAttenuation: false })
    this.world_points = new THREE.Points(this.world_geometry, this.world_material)
    Globals.scene.add(this.world_points)
  }

  getAddress (x, y) {
    x = mod(x, this.world_width)
    y = mod(y, this.world_height)
    return this.region[0] + x + y * this.world_width
  }

  getByteSync (x, y, l) {
    try {
      if (x + l >= this.world_width) {
        let leftlength = this.world_width - x
        let leftdata = this.mem.read(this.getAddress(x, y), leftlength)
        let rightdata = this.mem.read(this.getAddress(x + leftlength, y), l - leftlength)
        return leftdata.concat(rightdata)
      }
      return this.mem.read(this.getAddress(x, y), l)
    } catch (e) {
      return Array(l).fill(0)
    }
  }

  update () {
    this.tilesize = 20
    this.cols = Math.ceil(Globals.width / this.tilesize / 2)
    this.rows = Math.ceil(Globals.height / this.tilesize / 2)
    this.world_material.size = this.tilesize

    this.world_points.position.x = -(Globals.character.coordinate.x % this.tilesize)
    this.world_points.position.y = -(Globals.character.coordinate.y % this.tilesize)

    let stairX = Math.floor(Globals.character.coordinate.x / this.tilesize)
    let stairY = Math.floor(Globals.character.coordinate.y / this.tilesize)

    let charaX = stairX + this.world_offset_x
    let charaY = stairY + this.world_offset_y

    let position = this.world_geometry.attributes.position.array
    let color = this.world_geometry.attributes.color.array

    let posIndex = 0
    let colIndex = 0
    let vertIndex = 0

    for (let j = -this.rows; j < this.rows + 3; j++) {
      let data = this.getByteSync(charaX, charaY + j, 2 * this.cols + 5)
      for (let i = -this.cols - 1; i < this.cols + 3; i++) {
        let col = data[i + this.cols + 1] / 255

        if (col !== 0) {
          position[posIndex++] = i * this.tilesize
          position[posIndex++] = j * this.tilesize
          position[posIndex++] = 0

          color[colIndex++] = col
          color[colIndex++] = col
          color[colIndex++] = col

          vertIndex++
        }
      }
    }

    this.world_geometry.attributes.position.needsUpdate = true
    this.world_geometry.attributes.color.needsUpdate = true
    this.world_geometry.setDrawRange(0, vertIndex)

    this.tickcount++
  }
}

module.exports = ProcessView
