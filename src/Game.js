const THREE = require("three")
const View = require("./ProcessView")
const ProcessSelect = require("./ProcessSelect")
const Character = require("./Character")
const Globals = require("./Globals.js")

class Game {
  init () {
    Globals.camera = new THREE.OrthographicCamera( Globals.width/-2, Globals.width/2, Globals.height/2, Globals.height/-2, 1, 2000 )
    Globals.camera.position.z = 500

    Globals.scene = new THREE.Scene()

    Globals.renderer = new THREE.WebGLRenderer( { antialias: true } )
    Globals.renderer.setSize( Globals.width, Globals.height )
    document.body.appendChild( Globals.renderer.domElement )

    window.addEventListener('resize', () => { this.resize() }, false )

    Globals.character = new Character()
    Globals.process_select = new ProcessSelect()

    window.addEventListener( 'mousedown', function (ev) {
      Globals.character.on_click(new THREE.Vector2(ev.clientX, ev.clientY))
    }, false)

    this.animate()
  }

  resize () {
    Globals.renderer.setSize(Globals.width, Globals.height)
    Globals.camera.left   = Globals.width/-2
    Globals.camera.right  = Globals.width/2
    Globals.camera.top    = Globals.height/2
    Globals.camera.bottom = Globals.height/-2
    Globals.camera.updateProjectionMatrix()
  }

  animate () {
    Globals.renderer.render( Globals.scene, Globals.camera )

    Globals.camera.position.x = Globals.character.coordinate.x
    Globals.camera.position.y = Globals.character.coordinate.y

    Globals.character.update()
    Globals.process_select.update()

    requestAnimationFrame( () => { this.animate() } )
  }
}

module.exports = Game