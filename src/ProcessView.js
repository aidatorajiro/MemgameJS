const Memory = require("./Memory")
const Globals = require("./Globals")

let mod = function (n, m) {
  return ((n % m) + m) % m;
}

let choice = function (arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

let MAX_POINTS = 10000

class ProcessView {
  constructor(pid) {
    this.tickcount = 0
    this.update_range = 20

    this.mem = new Memory(pid)

    this.region = choice(this.mem.get_regions())

    this.world_size = this.region[1]
    this.world_width = this.world_height = Math.floor(Math.sqrt(this.world_size))
    this.world_map = {}

    this.world_geometry = new THREE.BufferGeometry()
    this.world_geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( MAX_POINTS * 3 ), 3 ) )
    this.world_geometry.addAttribute( 'color'   , new THREE.BufferAttribute( new Float32Array( MAX_POINTS * 3 ), 3 ) )

    this.world_material = new THREE.PointsMaterial( { vertexColors: true, size: 18, sizeAttenuation: false } )
    this.world_points = new THREE.Points( this.world_geometry, this.world_material )
    Globals.scene.add( this.world_points )

    this.getAddress_offset_x = Math.floor(this.world_width / 2)
    this.getAddress_offset_y = Math.floor(this.world_height / 2)

    this.update_map_infinite()
  }

  getAddress(x, y) {
    x += this.getAddress_offset_x
    y += this.getAddress_offset_y
    x = mod(x, this.world_width)
    y = mod(y, this.world_height)
    return this.region[0] + x + y * this.world_width
  }

  async getByte(x, y) {
    try {
      return (await this.mem.read_async(this.getAddress(x, y), 1))[0]
    } catch (e) {
      console.log("!")
      return 0
    }
  }

  async update_map () {
    let size = this.update_range
    let cx = Math.floor(Globals.character.coordinate.x / size)
    let cy = Math.floor(Globals.character.coordinate.y / size)
    let width = Math.floor(Globals.width / size / 2)
    let height = Math.floor(Globals.height / size / 2)

    for (let i = -width; i < width + 3; i++) {
      for (let j = -height; j < height + 3; j++) {
        let x = cx + i
        let y = cy + j

        this.world_map[x+","+y] = await this.getByte(x, y)
      }
    }
  }

  async update_map_infinite () {
    while (true) {
      await this.update_map()
    }
  }

  update () {
    let size = this.update_range
    let cx = Math.floor(Globals.character.coordinate.x / size)
    let cy = Math.floor(Globals.character.coordinate.y / size)
    let width = Math.floor(Globals.width / size / 2)
    let height = Math.floor(Globals.height / size / 2)

    this.world_points.position.x = cx * size
    this.world_points.position.y = cy * size

    let position = this.world_geometry.attributes.position.array
    let array    = this.world_geometry.attributes.color.array

    let pos_index = 0, col_index = 0, vert_index = 0

    for (let i = -width; i < width + 3; i++) {
      for (let j = -height; j < height + 3; j++) {
        let x = cx + i
        let y = cy + j

        let col = this.world_map[x+","+y]

        if (col != 0) {
          position[pos_index++] = i * size
          position[pos_index++] = j * size
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