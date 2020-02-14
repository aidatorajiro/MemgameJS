/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

const ref = require('ref')
const ffi = require('ffi')
const Struct = require('ref-struct')

const RegionInfo = Struct({
  protection: 'uint32',
  max_protection: 'uint32',
  inheritance: 'uint32',
  shared: 'uint32',
  reserved: 'uint32',
  offset: 'ulonglong',
  behavior: 'uint32',
  user_wired_count: 'ushort'
})

const RegionInfoPtr = ref.refType(RegionInfo)

const libc = ffi.Library('libc', {
  mach_task_self: ['uint', []],
  task_for_pid: ['int', ['uint', 'int', '*uint']],
  mach_vm_region: ['int', ['uint', '*ulong', '*ulong', 'int', RegionInfoPtr, '*uint32', '*uint32']],
  mach_vm_read: ['int', ['uint', 'ulonglong', 'ulonglong', '*void', '*uint32']]
})

class Memory {
  constructor (pid) {
    const taskRef = ref.alloc('uint', 0)
    const mytask = libc.mach_task_self()
    const ret = libc.task_for_pid(mytask, pid, taskRef)
    if (ret !== 0) {
      throw new Error('task_for_pid error ' + ret)
    }

    this.task = taskRef.deref()
  }

  getRegions () {
    const regions = []
    const address = ref.alloc('ulong', 0)
    const mapsize = ref.alloc('ulong', 0)
    const name = ref.alloc('uint32', 0)
    const count = ref.alloc('uint32', RegionInfo.size / 4)
    const info = new RegionInfo()

    while (true) {
      const ret = libc.mach_vm_region(this.task, address, mapsize, 9, info.ref(), count, name)
      if (ret === 1) {
        break
      }
      if (ret !== 0) {
        throw new Error('mach_vm_region error ' + ret)
      }

      regions.push([address.deref(), mapsize.deref()])

      address.writeUInt64LE(address.deref() + mapsize.deref())
    }

    return regions
  }

  read (address, length) {
    const dataref = ref.alloc('*void')
    const cnt = ref.alloc('uint32', 0)

    const ret = libc.mach_vm_read(this.task, address, length, dataref, cnt)
    if (ret !== 0) {
      throw new Error('mach_vm_read error ' + ret)
    }
    return dataref.readPointer(0, length)
  }

  readAsync (address, length) {
    const detaref = ref.alloc('*void')
    const cnt = ref.alloc('uint32', 0)

    return new Promise((resolve, reject) => {
      libc.mach_vm_read.async(this.task, address, length, detaref, cnt, (err, ret) => {
        if (err) {
          reject(new Error('mach_vm_read error ' + err))
        }
        if (ret !== 0) {
          reject(new Error('mach_vm_read error ' + ret))
        }
        resolve(detaref.readPointer(0, length))
      })
    })
  }
}

module.exports = Memory
