const THREE = require("three")
const Memory = require("./Memory")
const Globals = require("./Globals")

let mod = function (n, m) {
  return ((n % m) + m) % m;
}

let MAX_POINTS = 10000

class ProcessView {
  constructor(pid) {
    this.tickcount = 0
    
    this.mem = new Memory(pid)
    this.regions = this.mem.get_regions()
    this.offsets = this.regions.map((x)=>{return x[0]})
    this.lengths = this.regions.map((x)=>{return x[1]})
    this.world_size = this.lengths.reduce((a,b)=>{return a+b})
    this.world_width = Math.floor(Math.sqrt(this.world_size))
    this.world_height = this.world_width
    this.world_map = {}

    this.world_geometry = new THREE.BufferGeometry()
    this.world_geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( MAX_POINTS * 3 ), 3 ) )
    this.world_geometry.addAttribute( 'color'   , new THREE.BufferAttribute( new Float32Array( MAX_POINTS * 3 ), 3 ) )

    this.world_material = new THREE.PointsMaterial( { vertexColors: true, size: 18, sizeAttenuation: false } )
    this.world_points = new THREE.Points( this.world_geometry, this.world_material )
    Globals.scene.add( this.world_points )
  }
  
  getAddress(x, y) {
    x += Math.floor(this.world_width / 2)
    y += Math.floor(this.world_height / 2)
    x = mod(x, this.world_width)
    y = mod(y, this.world_height)
    let pos = x + y * this.world_width
    for (let i in this.lengths) {
      pos -= this.lengths[i]
      if (pos < 0) {
        return this.offsets[i] + this.lengths[i] + pos
      }
    }
  }
  
  getByte(x, y) {
    try {
      return this.mem.read(this.getAddress(x, y), 1).readUInt8()
    } catch (e) {
      console.log("!")
      return 0
    }
  }

  update () {

    let update_map = this.tickcount % 10 == 0

    let size = 20
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

        let byte = this.world_map[x+","+y]
        if (byte === undefined || update_map) {
          byte = this.world_map[x+","+y] = this.getByte(x, y)
        }
        if (byte != 0) {
          let col = byte / 255
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