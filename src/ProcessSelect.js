/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

const THREE = require('THREE')

const Pid = require('./Pid')
const suji = require('./suji.json')
const Globals = require('./Globals')
const Memory = require('./Memory')

const width = 90
const height = 90
const intervalX = 150
const intervalY = 150
const font = new THREE.Font(suji)

class ProcessSelect {
  constructor () {
    this.pids = Pid.getPids().filter(
      (x) => {
        try {
          new Memory(x).getRegions()
          return true
        } catch (e) {
          return false
        }
      }
    )
    this.pid = undefined
    this.selected = false
    this.finished = false

    // calculate the index of current selecting block. For exhibits, use random value.
    this.index = Math.floor(Math.random() * this.pids.length)

    this.progress = 0

    this.cols = Math.floor(Math.sqrt(this.pids.length))

    // create overwrap block
    {
      const geometry = new THREE.PlaneGeometry(width - 2, height - 2, 1, 1)
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.visible = false
      mesh.position.z = 1
      Globals.scene.add(mesh)

      this.overwrap = mesh
    }

    // create process blocks
    this.blocks = []
    this.labels = []
    for (let i = 0; i < this.pids.length; i++) {
      const x = (i % this.cols - this.cols / 2 + 0.5) * intervalX
      const y = (Math.floor(i / this.cols) - Math.floor(this.pids.length / this.cols)) * intervalY

      // block
      {
        const geometry = new THREE.PlaneGeometry(width, height, 1, 1)
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const mesh = new THREE.Mesh(geometry, material)

        mesh.position.x = x
        mesh.position.y = y
        mesh.position.z = 0
        Globals.scene.add(mesh)

        this.blocks.push(mesh)
      }

      // label
      {
        const geometry = new THREE.TextGeometry(this.pids[i].toString(), {
          font: font,
          size: 10
        })
        const material = new THREE.MeshBasicMaterial({ color: 0x052344 })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.x = x - width / 2 + 5
        mesh.position.y = y - height / 2 + 5
        mesh.position.z = 2
        Globals.scene.add(mesh)

        this.labels.push(mesh)
      }
    }
  }

  update () {
    if (this.finished === true) {
      return
    }

    // When all heve finished, clean up
    if (this.progress >= 2.2) {
      Globals.scene.remove(this.overwrap)
      this.overwrap.geometry.dispose()
      this.overwrap.material.dispose()

      for (const m of this.blocks) {
        Globals.scene.remove(m)
        m.geometry.dispose()
        m.material.dispose()
      }

      for (const m of this.labels) {
        Globals.scene.remove(m)
        m.geometry.dispose()
        m.material.dispose()
      }

      this.finished = true

      return
    }

    // After selecting
    if (this.progress >= 1) {
      // fade blocks
      for (const m of this.blocks) {
        m.material.opacity -= 0.015
        m.material.transparent = true
      }
      this.progress += 0.015
      this.selected = true
      return
    }

    // decorate block
    const overwrap = this.overwrap

    if (this.index !== null) {
      const mesh = this.blocks[this.index]

      overwrap.position.x = mesh.position.x
      overwrap.position.y = mesh.position.y

      overwrap.visible = true

      overwrap.geometry = new THREE.PlaneGeometry((width - 2) * this.progress, height - 2)

      overwrap.material.color =
        new THREE.Color(
          1 + (0.054 - 1) * this.progress,
          1 + (0.364 - 1) * this.progress,
          1 + (0.698 - 1) * this.progress)

      this.pid = this.pids[this.index]

      this.progress += 0.005
    } else {
      overwrap.visible = false
      this.progress = 0
      this.pid = undefined
    }
  }
}

module.exports = ProcessSelect
