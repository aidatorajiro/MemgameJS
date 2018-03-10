/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

const Memory = require("./Memory")
const Globals = require("./Globals")

// mathematical modulo
let mod = function (n, m) {
  return ((n % m) + m) % m;
}

// choose one element randomly from array
let choice = function (arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

let MAX_POINTS = 10000

class ProcessView {
  constructor(pid) {
    this.tickcount = 0
    this.rows = 10 // the number of tiles / 2
    this.tilesize = Math.floor(Globals.width / this.rows / 2)

    this.mem = new Memory(pid)

    while (true) {
      this.region = choice(this.mem.get_regions())
      this.world_size = this.region[1]
      this.world_width = this.world_height = Math.floor(Math.sqrt(this.world_size))
      this.getAddress_offset_x = Math.floor(this.world_width / 2)
      this.getAddress_offset_y = Math.floor(this.world_height / 2)
      
      let sum = 0;
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          sum += this.getByteSync(i,j);
        }
      }

      if (sum > 1000) {
        break;
      }
    }

    this.world_geometry = new THREE.BufferGeometry()
    this.world_geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( MAX_POINTS * 3 ), 3 ) )
    this.world_geometry.addAttribute( 'color'   , new THREE.BufferAttribute( new Float32Array( MAX_POINTS * 3 ), 3 ) )

    this.world_material = new THREE.PointsMaterial( { vertexColors: true, size: this.tilesize - 2, sizeAttenuation: false } )
    this.world_points = new THREE.Points( this.world_geometry, this.world_material )
    Globals.scene.add( this.world_points )
  }

  getAddress(x, y) {
    x += this.getAddress_offset_x
    y += this.getAddress_offset_y
    x = mod(x, this.world_width)
    y = mod(y, this.world_height)
    return this.region[0] + x + y * this.world_width
  }

  getByteSync(x, y) {
    try {
      return this.mem.read(this.getAddress(x, y), 1)[0]
    } catch (e) {
      return 0
    }
  }

  update () {
    let cx = Math.floor(Globals.character.coordinate.x / this.tilesize)
    let cy = Math.floor(Globals.character.coordinate.y / this.tilesize)

    this.world_points.position.x = cx * this.tilesize
    this.world_points.position.y = cy * this.tilesize

    let position = this.world_geometry.attributes.position.array
    let array    = this.world_geometry.attributes.color.array

    let pos_index = 0, col_index = 0, vert_index = 0

    for (let i = -this.rows; i < this.rows + 2; i++) {
      for (let j = -this.rows; j < this.rows; j++) {
        let x = cx + i
        let y = cy + j

        let col = this.getByteSync(x, y) / 255

        if (col != 0) {
          position[pos_index++] = i * this.tilesize
          position[pos_index++] = j * this.tilesize
          position[pos_index++] = 0

          array[col_index++] = col
          array[col_index++] = col
          array[col_index++] = col

          vert_index++
        }
      }
    }

    this.world_geometry.attributes.position.needsUpdate = true
    this.world_geometry.attributes.color   .needsUpdate = true
    this.world_geometry.setDrawRange( 0, vert_index )

    this.tickcount++
  }
}

module.exports = ProcessView