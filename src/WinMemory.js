/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/
const ffi = require('ffi')
const Struct = require('ref-struct')

// 32 bit
// let RegionInfo = Struct({
//   'BaseAddress': 'ulong',
//   'AllocationBase': 'ulong',
//   'AllocationProtect': 'ulong',
//   'RegionSize': 'ulong',
//   'State': 'ulong',
//   'Protect': 'ulong',
//   'Type': 'ulong'
// })

// 64 bit
let RegionInfo = Struct({
  'BaseAddress': 'ulonglong',
  'AllocationBase': 'ulonglong',
  'AllocationProtect': 'ulong',
  '__alignment1': 'ulong',
  'RegionSize': 'ulonglong',
  'State': 'ulong',
  'Protect': 'ulong',
  'Type': 'ulong'
})

// 32 bit
// let Kernel32 = ffi.Library('Kernel32', {
//   'ReadProcessMemory': ['bool', ['ulong', 'ulong', 'void *', 'ulong']],
//   'OpenProcess': ['ulong', ['ulong', 'bool', 'ulong']],
//   'VirtualQueryEx': ['ulong', ['ulong', 'ulong', 'void *', 'ulong']]
// })

// 64 bit
let Kernel32 = ffi.Library('Kernel32', {
  'ReadProcessMemory': ['bool', ['ulong', 'ulonglong', 'void *', 'ulonglong', 'ulonglong']],
  'OpenProcess': ['ulong', ['ulong', 'bool', 'ulong']],
  'VirtualQueryEx': ['ulong', ['ulong', 'ulonglong', 'void *', 'ulong']]
})

class Memory {
  constructor (pid) {
    this.handle = Kernel32.OpenProcess(0x0410, false, pid)
    if (this.handle === 0) {
      throw new Error('OpenProcess errored')
    }
  }

  getRegions () {
    let info = new RegionInfo()
    let current = 0
    let regions = []
    for (let i = 0; i < 20000; i++) {
      Kernel32.VirtualQueryEx(this.handle, current, info.ref(), info.ref().length)
      if (info.State === 0x1000) {
        regions.push([current, info.RegionSize])
      }
      current += info.RegionSize
    }
    return regions
  }

  read (address, length) {
    let buf = Buffer.alloc(length)
    let ret = Kernel32.ReadProcessMemory(this.handle, address, buf, length, 0)
    if (ret === false) {
      throw new Error('ReadProcessMemory errored')
    }
    return buf
  }

  readAsync (address, length) {
  }
}

module.exports = Memory
