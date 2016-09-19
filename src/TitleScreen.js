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

    var startbutton = new ui.View({
      superview: this,
      x: 30,
      y: 600,
      width: 450,
      height: 150
    });

    startbutton.on('InputSelect', bind(this, function () {
      this.emit('titlescreen:start');
    }));
  };

  this.addTitle = function() {
      this.titleView = new ui.TextView({
        superview: this,
        x: 5,
        y: 0,
        width: 740,
        height: 150,
        size: 70,
        text: "Element Match-3",
        horizontalAlign: "center",
        color: "red",
        autoFontSize: true,
        autoSize: true
      });

      this.scoreView = new ui.TextView({
        superview: this,
        x: 5,
        y: 0,
        width: 740,
        height: 1000,
        size: 60,
        text: "Can you get a good score in 120 seconds?",
        horizontalAlign: "center",
        color: "green",
        wrap: true,
        autoFontSize: true,
        autoSize: true
      });
    };
});