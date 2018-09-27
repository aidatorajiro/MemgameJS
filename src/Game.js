/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

const THREE = require('THREE')

const ProcessView = require('./ProcessView')
const ProcessSelect = require('./ProcessSelect')
const Character = require('./Character')
const Footprints = require('./Footprints')

const Globals = require('./Globals.js')

class Game {
  init () {
    // camera / scene / renderer preparation
    Globals.camera = new THREE.OrthographicCamera(Globals.width / -2, Globals.width / 2, Globals.height / 2, Globals.height / -2, 1, 2000)
    Globals.camera.position.z = 500

    Globals.scene = new THREE.Scene()

    Globals.renderer = new THREE.WebGLRenderer({ antialias: true })
    Globals.renderer.setSize(Globals.width, Globals.height)
    document.body.appendChild(Globals.renderer.domElement)

    // construct objects
    Globals.footprints = new Footprints()
    Globals.character = new Character()
    Globals.processSelect = new ProcessSelect()

    // call animate func
    requestAnimationFrame((time) => {
      // event handlers
      window.addEventListener('resize', () => { this.resize() }, false)

      window.addEventListener('mousedown', function (ev) {
        Globals.character.onClick(new THREE.Vector2(ev.clientX, ev.clientY))
      }, false)

      this.last_time = 0
      this.animate(time)
    })
  }

  resize () {
    Globals.renderer.setSize(Globals.width, Globals.height)
    Globals.camera.left = Globals.width / -2
    Globals.camera.right = Globals.width / 2
    Globals.camera.top = Globals.height / 2
    Globals.camera.bottom = Globals.height / -2
    Globals.camera.updateProjectionMatrix()
  }

  animate (time) {
    Globals.delta = time - this.last_time
    this.last_time = time

    Globals.renderer.render(Globals.scene, Globals.camera)

    Globals.camera.position.x = Globals.character.coordinate.x
    Globals.camera.position.y = Globals.character.coordinate.y
    Globals.footprints.update()
    Globals.character.update()

    if (Globals.processSelect.finished === false) {
      Globals.processSelect.update()
    }

    if (Globals.processSelect.selected === true) {
      if (Globals.processView === undefined) {
        Globals.processView = new ProcessView(Globals.processSelect.pid)
      }
      Globals.processView.update()
    }

    requestAnimationFrame((time) => { this.animate(time) })
  }
}

module.exports = Game
