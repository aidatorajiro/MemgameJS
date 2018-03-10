/**
Copyright (c) 2018 Torajiro Aida

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

module.exports = {
  get_pids () {
    if (process.platform == "darwin") {
      return require("child_process")
        .execSync('ps -A')
        .toString()
        .split("\n")
        .map    ( ( x ) => { return x.match(" *(\\d+)") } )
        .filter ( ( x ) => { return x != null           } )
        .map    ( ( x ) => { return parseInt(x[1])      } )
    } else if (process.platform == "linux") {
      throw new Error("not yet inplemented on linux")
    } else if (process.platform == "win32") {
      throw new Error("not yet inplemented on windows")
    } else {
      throw new Error("not yet inplemented on your operating system")
    }
  }
}