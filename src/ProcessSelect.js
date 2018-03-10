/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

const Pid = require("./Pid")
const suji = require("./suji.json")
const Globals = require("./Globals")
const Memory = require("./Memory")

let width = 90
let height = 90
let interval_x = 150
let interval_y = 150
let font = new THREE.Font(suji)

class ProcessSelect {
  constructor () {
    this.pids = Pid.get_pids().filter(
      (x) => {
        try {
          new Memory(x).get_regions()
          return true
        } catch (e) {
          return false
        }
      }
    )
    this.pid = undefined
    this.selected = false
    this.finished = false

    this.progress = 0

    this.cols = Math.floor(Math.sqrt(this.pids.length))

    // create overwrap block
    {
      let geometry = new THREE.PlaneGeometry( width - 2, height - 2, 1, 1 )
      let material = new THREE.MeshBasicMaterial( { color: 0xff0000 } )
      let mesh = new THREE.Mesh( geometry, material )
      mesh.visible = false
      mesh.position.z = 1
      Globals.scene.add( mesh )

      this.overwrap = mesh
    }

    // create process blocks
    this.blocks = []
    this.labels = []
    for (let i in this.pids) {
      let x = (i % this.cols - this.cols / 2 + 0.5) * interval_x
      let y = (Math.floor(i / this.cols) - Math.floor(this.pids.length / this.cols)) * interval_y

      // block
      {
        let geometry = new THREE.PlaneGeometry( width, height, 1, 1 )
        let material = new THREE.MeshBasicMaterial( { color: 0xffffff } )
        let mesh = new THREE.Mesh( geometry, material )

        mesh.position.x = x
        mesh.position.y = y
        mesh.position.z = 0
        Globals.scene.add( mesh )

        this.blocks.push( mesh )
      }

      // label
      {
        let geometry = new THREE.TextGeometry( this.pids[i].toString(), {
          font: font,
          size: 10
        })
        let material = new THREE.MeshBasicMaterial( { color: 0x052344 } )
        let mesh = new THREE.Mesh( geometry, material )
        mesh.position.x = x - width / 2 + 5
        mesh.position.y = y - height / 2 + 5
        mesh.position.z = 2
        Globals.scene.add( mesh )

        this.labels.push( mesh )
      }
    }
  }

  update () {
    if (this.finished == true) {
      return
    }

    // When all heve finished, clean up
    if (this.progress >= 2.2) {
      Globals.scene.remove(this.overwrap)
      this.overwrap.geometry.dispose()
      this.overwrap.material.dispose()

      for (let m of this.blocks) {
        Globals.scene.remove(m)
        m.geometry.dispose()
        m.material.dispose()
      }

      for (let m of this.labels) {
        Globals.scene.remove(m)
        m.geometry.dispose()
        m.material.dispose()
      }

      this.finished = true

      return
    }

    // After selecting
    if (this.progress >= 1) {
      // make sure that pid is correct
      try {
        new Memory(this.pid).get_regions()
      } catch (e) {
        this.progress = 0
        return
      }
      
      // fade blocks 
      for (let m of this.blocks) {
        m.material.opacity -= 0.015
        m.material.transparent = true
      }
      this.progress += 0.015
      this.selected = true
      return
    }

    // calculate the index of current selecting block
    let index = null
    let c = Globals.character.coordinate
    let ray = new THREE.Raycaster(new THREE.Vector3(c.x, c.y, 0), new THREE.Vector3(0, 0, -1))
    for(let i in this.blocks) {
      if (ray.intersectObject(this.blocks[i]).length > 0) {
        index = i
      }
    }

    // decorate block
    let overwrap = this.overwrap

    if (index !== null) {
      
      let mesh = this.blocks[index]

      overwrap.position.x = mesh.position.x
      overwrap.position.y = mesh.position.y

      overwrap.visible = true

      overwrap.geometry = new THREE.PlaneGeometry((width - 2)*this.progress, height - 2)

      overwrap.material.color =
        new THREE.Color(
          1 + (0.054 - 1)*this.progress, 
          1 + (0.364 - 1)*this.progress,
          1 + (0.698 - 1)*this.progress)

      this.pid = this.pids[index]

      this.progress += 0.005

    } else {

      overwrap.visible = false
      this.progress = 0
      this.pid = undefined

    }
  }
}

module.exports = ProcessSelect