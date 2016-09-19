import animate;
import device;
import ui.View;
import ui.ImageView;
import ui.TextView;
import ui.resource.Image as Image;

var boundsWidth = 576;
var boundsHeight = 1024;
var scaleWidth = device.screen.width / boundsWidth;
var scaleHeight = device.screen.height / boundsHeight;
var scale = Math.max(scaleHeight, scaleHeight);
if ((device.isIOS || device.isIOSSimulator) && scaleHeight > 1.1)
{
	var gem_size = 72;
}
else if ((device.isIOS || device.isIOSSimulator) && scaleHeight <= 1.1)
{
	var gem_size = 75;
}
else
{
	var gem_size = 70;
}

exports = Class(ui.ImageView, function (supr) {

	this.init = function (options) {
		options = merge(options, {
			width:	gem_size,
			height: gem_size
		});

		supr(this, 'init', [options]);

		this.row = options.row;
		this.col = options.col;

		this.forbidden_types = options.forbidden_types;

		this.active = false;
		this.isselected = false;

		this.build();
	};

	this.pickGemType = function() {
		var gemtypes = ["gem_01", "gem_02", "gem_03", "gem_04", "gem_05"];
		var num_forbidden = this.forbidden_types.length;

		if (this.forbidden_types.length > 0) {
			this.forbidden_types.forEach(function(type) {
				gemtypes.splice(gemtypes.indexOf(type), 1);
			});
		}

		return gemtypes[parseInt((5 - num_forbidden) * Math.random())];
	};

	this.build = function () {
		this.gemtype = this.pickGemType();

		var gemimage = new Image({ url: "resources/images/gems/" + this.gemtype + ".png" });

		this.gem = new ui.ImageView({
			superview: this,
			image: gemimage,
			x: 0,
			y: 0,
			width: gem_size,
			height: gem_size
		});

		this._inputview = new ui.View({
			superview: this,
			clip: false,
			x: 0,
			y: 0,
			width: gem_size,
			height: gem_size
		});

		this._animator = animate(this.gem);

		this._inputview.on('InputSelect', bind(this, function() {
			this.emit('gem:clicked');
		}));
	};

	this.fallIn = function(position) {
		this.gem.style.y = -position;
		this._animator.now({ y: 0 }, 150, animate.linear);
	}
});
