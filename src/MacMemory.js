const ref = require('ref');
const ffi = require('ffi');
const Struct = require('ref-struct');

let RegionInfo = Struct({
  'protection':     'uint32',
  'max_protection':   'uint32',
  'inheritance':    'uint32',
  'shared':       'uint32',
  'reserved':     'uint32',
  'offset':       'ulonglong',
  'behavior':     'uint32',
  'user_wired_count': 'ushort'
});

let RegionInfoPtr = ref.refType(RegionInfo);

let libc = ffi.Library("libc", {
  "mach_task_self": ["uint", []],
  "task_for_pid": ["int", ["uint", "int", "*uint"]],
  "mach_vm_region": ["int", ["uint", "*ulong", "*ulong", "int", RegionInfoPtr, "*uint32", "*uint32"]],
  "mach_vm_read": ["int", ["uint", "ulonglong", "ulonglong", "*void", "*uint32"]]
})

class Memory {
  constructor(pid) {
    let task_ref = ref.alloc("uint", 0)
    let mytask = libc.mach_task_self()
    let ret = libc.task_for_pid(mytask, pid, task_ref)
    if (ret != 0) {
      throw new Error("task_for_pid error " + ret);
    }

    this.task = task_ref.deref()
  }
  
  get_regions() {
    let regions = []
    let address = ref.alloc("ulong", 0)
    let mapsize = ref.alloc("ulong", 0)
    let name  = ref.alloc("uint32", 0)
    let count   = ref.alloc("uint32", RegionInfo.size / 4)
    let info  = new RegionInfo()
    
    while (true) {
      let ret = libc.mach_vm_region(this.task, address, mapsize, 9, info.ref(), count, name)
      if (ret == 1) {
        break;
      }
      if (ret != 0) {
        throw new Error("mach_vm_region error " + ret)
      }
      
      regions.push([address.deref(), mapsize.deref()])
      
      address.writeUInt64LE(address.deref() + mapsize.deref())
    }
    
    return regions;
  }
  
  read(address, length) {
    let detaref = ref.alloc("*void")
    let cnt = ref.alloc("uint32", 0)
    let ret = libc.mach_vm_read(this.task, address, length, detaref, cnt)
    if (ret != 0) {
      throw new Error("mach_vm_read error " + ret)
    }
    return detaref.readPointer(0, length)
  }
}

module.exports = Memory