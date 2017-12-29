const ProcessView = require("./ProcessView")
const ProcessSelect = require("./ProcessSelect")
const Character = require("./Character")
const Globals = require("./Globals")
const Config = require("./Config")
const Capturer = require("./Capturer")

class Game {
  init () {
    // camera / scene / renderer preparation
    Globals.camera = new THREE.OrthographicCamera( Globals.width/-2, Globals.width/2, Globals.height/2, Globals.height/-2, 1, 2000 )
    Globals.camera.position.z = 500

    Globals.scene = new THREE.Scene()

    Globals.renderer = new THREE.WebGLRenderer( { antialias: true } )
    Globals.renderer.setSize( Globals.width, Globals.height )
    document.body.appendChild( Globals.renderer.domElement )

    // capturer preparation
    if (Config.CAPTURE_MODE) {
      Globals.capturer = new Capturer(Config.CAPTURE_PATH)
    }

    // event handlers
    window.addEventListener('resize', () => { this.resize() }, false )

    window.addEventListener( 'mousedown', function (ev) {
      Globals.character.on_click(new THREE.Vector2(ev.clientX, ev.clientY))
    }, false)

    // construct objects
    Globals.character = new Character()
    Globals.process_select = new ProcessSelect()

    // call animate func
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

    if (Globals.process_select.finished == false) {
      Globals.process_select.update()
    }

    if (Globals.process_select.selected == true) {
      if (Globals.process_view === undefined) {
        Globals.process_view = new ProcessView(Globals.process_select.pid, !Config.CAPTURE_MODE)
      }
      Globals.process_view.update()
    }

    requestAnimationFrame( () => { this.animate() } )
  }
}

module.exports = Game