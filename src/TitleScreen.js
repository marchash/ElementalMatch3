import device;
import ui.View;
import ui.ImageView;
import ui.TextView;

var boundsWidth = 576;
var boundsHeight = 1024;
var scale = Math.max(device.screen.width / boundsWidth, device.screen.height / boundsHeight);

exports = Class(ui.ImageView, function (supr) {
  this.init = function (opts) {
    opts = merge(opts, {
      x: 0,
      y: 0,
      scale: scale,
      image: "resources/images/ui/titlescreen.png"
    });

    supr(this, 'init', [opts]);

    this.addTitle();

    var startbutton = new ui.ImageView({
      superview: this,
      x: 167.5,
      centerX: true,
      y: 600,
      width: 241,
      height: 105,
      image: "resources/images/ui/play.png"
    });

    startbutton.on('InputSelect', bind(this, function () {
      this.emit('titlescreen:start');
    }));
  };

  this.addTitle = function() {
      this.scoreView = new ui.TextView({
        superview: this,
        centerX: true,
        y: 0,
        width: boundsWidth,
        height: 100,
        size: 60,
        text: "Do your best in 120 seconds!",
        horizontalAlign: "center",
        color: "blue",
        wrap: true,
        autoFontSize: true,
        autoSize: true
      });
    };
});