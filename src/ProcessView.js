const THREE = require("three")
const Memory = require("./Memory")
const Globals = require("./Globals")

class ProcessView {
  constructor(pid) {
    this.mem = new Memory(pid)
    this.regions = this.mem.get_regions()
    this.offsets = this.regions.map((x)=>{return x[0]})
    this.lengths = this.regions.map((x)=>{return x[1]})
    this.world_size = this.lengths.reduce((a,b)=>{return a+b})
    this.world_width = Math.floor(Math.sqrt(this.world_size))
    this.world_height = this.world_width
    this.world_map = {}
    this.world_geometry = new THREE.Geometry()
    this.world_material = new THREE.PointsMaterial( { vertexColors: true, size: 18 } )
    this.world_points = new THREE.Points( this.world_geometry, this.world_material )
    Globals.scene.add( this.world_points )
  }
  
  getAddress(x, y) {
    x += Math.floor(this.world_width / 2)
    y += Math.floor(this.world_height / 2)
    x %= this.world_width
    y %= this.world_height
    let pos = x + y * this.world_height
    for (let i in this.lengths) {
      pos -= this.lengths[i]
      if (pos < 0) {
        return this.offsets[i] + pos + this.lengths[i]
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
    let size = 20
    let cx = Math.floor(Globals.character.coordinate.x / size)
    let cy = Math.floor(Globals.character.coordinate.y / size)
    let width = Math.floor(Globals.width / size / 2) + 10
    let height = Math.floor(Globals.height / size / 2) + 10

    this.world_points.position.x = cx * size
    this.world_points.position.y = cy * size

    this.world_geometry.vertices = []
    this.world_geometry.colors = []

    for (let i = -width; i < width; i++) {
      for (let j = -height; j < height; j++) {
        let x = cx + i
        let y = cy + j

        let byte = this.world_map[x+","+y]
        if (byte === undefined) {
          byte = this.world_map[x+","+y] = this.getByte(x, y)
        }
        if (byte === 0) {
          continue
        }
        let col = byte / 255
        this.world_geometry.vertices.push( new THREE.Vector3(i * size, j * size, 0) )
        this.world_geometry.colors.push( new THREE.Color(col, col, col) )
      }
    }

    this.world_geometry.verticesNeedUpdate = true
    this.world_geometry.colorsNeedUpdate = true
  }
}

module.exports = ProcessView