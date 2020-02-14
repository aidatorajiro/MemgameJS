/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

const THREE = require('THREE')

const Memory = require('./Memory')
const Globals = require('./Globals')

// mathematical modulo
const mod = function (n, m) {
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

const MAX_POINTS = 2000

class ProcessView {
  constructor (pid) {
    this.tickcount = 0
    this.cols = 20
    this.rows = Math.ceil(this.cols * (Globals.height / Globals.width))
    this.tilesize = Math.floor(Globals.width / this.cols / 2)

    this.mem = new Memory(pid)

    for (const region of shuffle(this.mem.getRegions())) {
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

    this.world_material = new THREE.PointsMaterial({ vertexColors: true, size: Math.floor(this.tilesize * 0.90), sizeAttenuation: false })
    this.world_points = new THREE.Points(this.world_geometry, this.world_material)
    Globals.scene.add(this.world_points)
  }

  getAddress (x, y) {
    return this.region[0] + x + y * this.world_width
  }

  getByteSync (x, y, l) {
    x = mod(x, this.world_width)
    y = mod(y, this.world_height)
    try {
      if (x + l > this.world_width) {
        const leftlength = this.world_width - x
        const leftdata = this.mem.read(this.getAddress(x, y), leftlength)
        const rightdata = this.mem.read(this.getAddress(0, y), l - leftlength)
        return Array.from(leftdata).concat(Array.from(rightdata))
      }
      return this.mem.read(this.getAddress(x, y), l)
    } catch (e) {
      return Array(l).fill(0)
    }
  }

  update () {
    const stairX = Math.floor(Globals.character.coordinate.x / this.tilesize)
    const stairY = Math.floor(Globals.character.coordinate.y / this.tilesize)

    this.world_points.position.x = stairX * this.tilesize
    this.world_points.position.y = stairY * this.tilesize

    const charaX = stairX + this.world_offset_x
    const charaY = stairY + this.world_offset_y

    const position = this.world_geometry.attributes.position.array
    const color = this.world_geometry.attributes.color.array

    let posIndex = 0
    let colIndex = 0
    let vertIndex = 0

    for (let j = -this.rows; j < this.rows + 3; j++) {
      const data = this.getByteSync(charaX, charaY + j, 2 * this.cols + 5)
      for (let i = -this.cols - 1; i < this.cols + 3; i++) {
        const col = data[i + this.cols + 1] / 255

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
