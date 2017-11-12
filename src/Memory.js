if (process.platform == "darwin") {
  module.exports = require("./MacMemory")
} else if (process.platform == "linux") {
  throw new Error("not yet inplemented on linux")
} else if (process.platform == "win32") {
  throw new Error("not yet inplemented on windows")
} else {
  throw new Error("not yet inplemented on your operating system")
}