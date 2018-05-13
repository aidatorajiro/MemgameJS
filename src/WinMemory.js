/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/
const ffi = require('ffi')
const ref = require('ref')
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

let SystemInfo = Struct({
  'dwOemId': 'ulonglong',
  'wProcessorArchitecture': 'ulong',
  'wReserved': 'ulong',
  'dwPageSize': 'ulonglong',
  'lpMinimumApplicationAddress': 'ulonglong',
  'lpMaximumApplicationAddress': 'ulonglong',
  'dwActiveProcessorMask': 'ulonglong*',
  'dwNumberOfProcessors': 'ulonglong',
  'dwProcessorType': 'ulonglong',
  'dwAllocationGranularity': 'ulonglong',
  'wProcessorLevel': 'ulong',
  'wProcessorRevision': 'ulong'
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
  'VirtualQueryEx': ['ulong', ['ulong', 'ulonglong', 'void *', 'ulong']],
  'IsWow64Process': ['bool', ['ulong', 'bool *']],
  'GetSystemInfo': ['void', ['void *']]
})

let MIN_ADDR, MAX_ADDR;
{
  let info = new SystemInfo()
  Kernel32.GetSystemInfo(info.ref())
  MIN_ADDR = info.lpMinimumApplicationAddress
  MAX_ADDR = info.lpMaximumApplicationAddress
}

class Memory {
  constructor (pid) {
    this.handle = Kernel32.OpenProcess(0x0410, false, pid)
    if (this.handle === 0) {
      throw new Error('OpenProcess errored')
    }

    let iswow64 = ref.alloc('bool');
    if (!Kernel32.IsWow64Process(self.handle, iswow64)) {
      throw new Error('IsWow64Process errored')
    }
    this.iswow64 = iswow64.deref()
  }

  getRegions () {
    let info = new RegionInfo()
    let current = MIN_ADDR
    let regions = []
    while (current < (this.iswow64 ? 0x7FFFFFFF : MAX_ADDR)) {
      let ret = Kernel32.VirtualQueryEx(this.handle, current, info.ref(), info.ref().length)
      if (info.State === 0x1000) {
        regions.push([current, info.RegionSize])
      }
      if (ret !== 48) {
        console.log(info)
        break
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
