/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

class Pid {
  static getPids () {
    if (process.platform === 'darwin') {
      return require('child_process')
        .execSync('ps -A')
        .toString()
        .split('\n')
        .map(x => x.match(' *(\\d+)'))
        .filter(x => x != null)
        .map(x => parseInt(x[1]))
    } else if (process.platform === 'linux') {
      return require('child_process')
        .execSync('ps -A')
        .toString()
        .split('\n')
        .map(x => x.match(' *(\\d+)'))
        .filter(x => x != null)
        .map(x => parseInt(x[1]))
    } else if (process.platform === 'win32') {
      return require('child_process')
        .execSync('wmic process get ProcessId')
        .toString()
        .split('\n')
        .map(x => x.match('\\d+'))
        .filter(x => x != null)
        .map(x => parseInt(x[0]))
    } else {
      throw new Error('not yet inplemented on your operating system')
    }
  }
}

module.exports = Pid
