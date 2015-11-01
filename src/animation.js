var HEXAGRAM = HEXAGRAM || {};

HEXAGRAM.Animation = function (config) {
	this.config = config || {
		interval: 100
	};
	this.callback_list = [];
	this.timer = undefined;
	this.status = "init";
};

HEXAGRAM.Animation.prototype.run = function () {
	var that = this;
	this.timer = setInterval(function () {
		for (var i = 0; i < that.callback_list.length; ++ i) {
			that.callback_list[i]();
		}
	}, that.config.interval);
	this.status = "running";
};

HEXAGRAM.Animation.prototype.pause = function () {
	this.status = "paused";
};

HEXAGRAM.Animation.prototype.clear = function () {
	this.callback_list = [];
	clearInterval(this.timer);
	this.timer = undefined;
	this.status = "stopped";
};

HEXAGRAM.Animation.prototype.add = function (callback) {
	this.callback_list.push(callback);
};

HEXAGRAM.Animation.prototype.remove = function (callback) {
	this.callback_list.splice(this.callback_list.indexOf(callback), 1);
};
