const Memory = require("./Memory")

class ProcessView {
  constructor(pid) {
    this.mem = new Memory(pid)
    this.regions = this.mem.get_regions()
    this.offsets = this.regions.map((x)=>{return x[0]})
    this.lengths = this.regions.map((x)=>{return x[1]})
    this.world_size = this.lengths.reduce((a,b)=>{return a+b})
    this.world_width = Math.floor(Math.sqrt(this.world_size))
    this.world_height = this.world_width
  }
  
  getAddress(x, y) {
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
    return this.mem.read(this.getAddress(x, y), 1).readUInt8()
  }
}

module.exports = ProcessView