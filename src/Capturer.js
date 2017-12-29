class Capturer {
  constructor (path) {
    var desktopCapturer = require('electron').desktopCapturer;

    desktopCapturer.getSources({
      types: [
        'window',
        'screen'
      ]
    }, function(error, sources){
      if (error) {
        return;
      }

      let id = sources.filter((x) => (x.name=="Memgame"))[0].id
    });
  }
}

module.exports = Capturer