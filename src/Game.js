const View = require("./ProcessView")
const Pid = require("./Pid")
const THREE = require("three")

class Game {
  constructor () {
    this.pids = Pid.get_pids()

    this.camera = new THREE.OrthographicCamera( this.width/-2, this.width/2, this.height/2, this.height/-2, 1, 2000 )
    this.camera.position.z = 500;

    this.scene = new THREE.Scene()
  
    this.geometry = new THREE.PlaneGeometry( 100, 100, 1, 1 )
    this.material = new THREE.MeshNormalMaterial()
  
    this.mesh = new THREE.Mesh( this.geometry, this.material )
    this.mesh.position.z = 0
    this.scene.add( this.mesh )
  
    this.renderer = new THREE.WebGLRenderer( { antialias: true } )
    this.renderer.setSize( this.width, this.height )
    document.body.appendChild( this.renderer.domElement )

    window.addEventListener('resize', () => { this.resize() }, false )

    this.animate()
  }

  get width () {
    return window.innerWidth
  }

  get height () {
    return window.innerHeight
  }

  resize () {
    this.renderer.setSize(this.width, this.height)
    this.camera.left   = this.width/-2
    this.camera.right  = this.width/2
    this.camera.top    = this.height/2
    this.camera.bottom = this.height/-2
    this.camera.updateProjectionMatrix()
  }

  animate () {
    requestAnimationFrame( () => { this.animate() } );
    
    this.renderer.render( this.scene, this.camera );
  }
}

module.exports = Game