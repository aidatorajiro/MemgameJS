const THREE = require("three")

class ProcessSelect {
  constructor (camera, scene, renderer) {
    this.camera = camera
    this.scene = scene
    this.renderer = renderer

    this.geometry = new THREE.PlaneGeometry( 64, 64, 1, 1 )
    this.material = new THREE.MeshNormalMaterial()
  
    this.mesh = new THREE.Mesh( this.geometry, this.material )
    this.mesh.position.z = 0
    this.scene.add( this.mesh )
  }

  update () {
    
  }
}

module.exports = ProcessSelect