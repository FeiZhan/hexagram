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
;var HEXAGRAM = HEXAGRAM || {};

HEXAGRAM.CircleRing = function (config) {
	var that = this;
	this.parent = config.parent;
	var RAD = Math.PI * 2;
	var offset = 0;
	var ring = this.parent.canvas
		.append("g")
		.attr("opacity", 1);
	this.circles = [];
	for (var i = 0; i < config.count; ++ i) {
		var completeness = i / config.count;
		var q = 1;
		var circle = ring.append("circle");
		circle
			.attr("r", 0)
			.attr("cx", config.width / 2 + (Math.cos((offset + completeness) * RAD)) * q * config.radius)
			.attr("cy", config.height / 2 + (Math.sin((offset + completeness) * RAD)) * q * config.radius)
			.attr("stroke", this.parent.styles.colors.smallRing)
			.attr("fill", "none")
			.attr("stroke-width", 0.5 + config.innerRadius / 15);
		var transition = circle.transition()
			.duration(this.parent.styles.animation.inSpeed)
			.attr("r", config.innerRadius)
			.each("end", function() {
			  circle.t = undefined;
			});
		circle.t = transition;
		this.circles.push(circle);
	}

	var animation = function () {
		offset = (config.reverse) ? offset - 1 * (config.speed || that.parent.styles.animation.animationSpeed) : offset + 1 * (config.speed || that.parent.styles.animation.animationSpeed);
		ring
			.transition()
			.ease("linear")
			.duration(100)
			.attr("transform", "rotate(" + offset + ", " + config.width / 2 + ", " + config.height / 2 + ")");
	};
	this.parent.animation.add(animation);

	return this;
};

HEXAGRAM.CircleRing.prototype.recolor = function (newColor) {
	$.each(this.circles, function(i, circle) {
		circle
			.attr("stroke", newColor);
	});
};

HEXAGRAM.CircleRing.prototype.fill = function (newColor) {
	$.each(this.circles, function(i, circle) {
		circle
			.attr("fill", newColor);
	});
};

HEXAGRAM.CircleRing.prototype.disperse = function () {
	var deferred = Q.defer();
	this.parent.animation.remove(animation);
	$.each(this.circles, function(i, circle) {
		circle.transition()
			.duration(500)
			.attr("r", 0);
	});
	var transition = ring.transition();
	transition
		.duration(this.parent.styles.animation.inSpeed)
		.attr("opacity", 0)
		.each("end", deferred.resolve, ring);
	return deferred.promise;
};
;var HEXAGRAM = HEXAGRAM || {};

HEXAGRAM.MagicCircle = function (selector, config) {
	this.selector = selector;
	this.config = config || HEXAGRAM.MagicCircle.DefaultConfig;
	this.styles = HEXAGRAM.MagicCircle.DefaultConfig;
	this.id = Math.floor(Math.random() * 10000000);
	this.height = 0;
	this.width = 0;
	this.defs = {};
	this.canvas = undefined;
	this.animation = new HEXAGRAM.Animation();
	this.elements = [];
	this.current = undefined;
	this.currentRadius = 0;
	this.init();
};

HEXAGRAM.MagicCircle.DefaultConfig = {
	colors: {
		ring: "#182645",
		text: "#243a6c",
		smallRing: "#304f93",
	},
	type: {
		leading: 6,
		typecase: "uppercase"
	},
	animation: {
		inSpeed: 666,
		animationSpeed: 6.66
	},
	graphics: {
			blur: {
			level: 0
		},
		shadow: {
			level: 1,
			distance: 0
		}
	}
};

//@deprecated
HEXAGRAM.MagicCircle.prototype.cast = function () {
	return this.run();
};

HEXAGRAM.MagicCircle.prototype.init = function () {
	this.width = $(this.selector).width();
	this.height = $(this.selector).height();
	this.canvas = d3.select(this.selector)
		.append("svg")
		.attr("width", this.width)
		.attr("height", this.height)
		.attr("class", "main")
		.attr("shape-rendering","optimizeSpeed");
	this.defs = this.canvas.append("defs");

	var blurFilter = this.defs.append("filter")
		.attr("id", "drop-blur" + this.id)
		.attr("height", "130%");
	blurFilter.append("feGaussianBlur")
		.attr("in", "SourceAlpha")
		.attr("stdDeviation", this.styles.graphics.blur.level);
	blurFilter.append("feOffset")
		.attr("in", "blur")
		.attr("dx", 0)
		.attr("dy", 0)
		.attr("result", "offsetBlur");

	var blurFeMerge = blurFilter.append("feMerge");
	blurFeMerge.append("feMergeNode")
		.attr("in", "offsetBlur");
	blurFeMerge.append("feMergeNode")
		.attr("in", "SourceGraphic");

	var shadowFilter = this.defs.append("filter")
		.attr("id", "drop-shadow" + this.id)
		.attr("height", "130%");
	shadowFilter.append("feGaussianBlur")
		.attr("in", "SourceAlpha")
		.attr("stdDeviation", this.styles.graphics.shadow.level)
		.attr("result", "blur");
	shadowFilter.append("feOffset")
		.attr("in", "blur")
		.attr("dx", this.styles.graphics.shadow.distance)
		.attr("dy", this.styles.graphics.shadow.distance)
		.attr("result", "offsetBlur");
	shadowFilter.append("feComponentTransfer")
		.append("feFuncA")
		.attr("type", "linear")
		.attr("slope", "0.2");

	var shadowFeMerge = shadowFilter.append("feMerge");
	shadowFeMerge.append("feMergeNode")
		.attr("in", "offsetBlur")
		.attr("alpha", "0.1");
	shadowFeMerge.append("feMergeNode")
		.attr("in", "SourceGraphic");
	return this;
};

HEXAGRAM.MagicCircle.prototype.run = function () {
	if (! this.animation || "running" != this.animation.status) {
		this.animation.run();
	}
	return this;
};

HEXAGRAM.MagicCircle.prototype.add = function (type, config) {
	switch (type) {
	case "Space":
		this.space(config.length);
		break;
	case "Ring":
		this.addRing(config);
		break;
	case "CircleRing":
		this.addCircleRing(config);
		break;
	case "Text":
		this.addText(config);
		break;
	default:
		this.elements.push(type);
		this.current = type;
		break;
	}
	return this;
};

HEXAGRAM.MagicCircle.prototype.target = function (element) {
	this.current = element;
	return this.current;
};

HEXAGRAM.MagicCircle.prototype.getLast = function () {
	return this.current;
};

HEXAGRAM.MagicCircle.prototype.color = function (color) {
	if (this.current.recolor) {
		this.current.recolor(color);
	} else {
		console.warn("Cant recolor this element", this.current);
	}
	return this;
};

HEXAGRAM.MagicCircle.prototype.fill = function (color) {
	if (this.current.fill) {
		this.current.fill(color);
	} else {
		console.warn("Cant fill this element", this.current);
	}
	return this;
};

HEXAGRAM.MagicCircle.prototype.rotation = function (rotation) {
	if (this.current.rotation) {
		this.current.rotation(rotation);
	} else {
		console.warn("Cant rotate element", this.current);
	}
	return this;
};

HEXAGRAM.MagicCircle.prototype.on = function(event, listener) {
	var target = this.current;
	var returner = this;
	if (this.current.on) {
		this.current.on(event, function() {
			returner.current = target;
			listener(returner, target);
		});
	} else {
		console.warn("Can't attach a listener to this object");
	}
	return this;
},

HEXAGRAM.MagicCircle.prototype.space = function(length) {
	this.currentRadius += length;
	return this;
};

HEXAGRAM.MagicCircle.prototype.backspace = function(length) {
	this.currentRadius -= length;
	return this;
};

HEXAGRAM.MagicCircle.prototype.ring = function(strokeWidth) {
	var that = this;
	var circle = new HEXAGRAM.Ring({
		parent: that,
		radius: that.currentRadius,
		strokeWidth: strokeWidth || 1
	});
	that.elements.push(circle);
	this.current = circle;
	return this;
},

HEXAGRAM.MagicCircle.prototype.circleRing = function(count, innerRadius, speed, reverse) {
	var circleRing = new HEXAGRAM.CircleRing({
		parent: this,
		height: this.height,
		width: this.width,
		radius: this.currentRadius + innerRadius,
		count: count,
		innerRadius: innerRadius,
		speed: speed,
		reverse: reverse
	});
	this.elements.push(circleRing);
	this.currentRadius += innerRadius * 2;
	this.current = circleRing;
	return this;
},

HEXAGRAM.MagicCircle.prototype.text = function(my_height, text, speed, reverse,leading) {
	if (my_height == "autofit") {
		var circumference = this.currentRadius * 2 * Math.PI;
		var errorMargin = 2;
		var textSizeA = 10;
		var runeRing = new HEXAGRAM.TextRing({
			parent: this,
			radius: this.currentRadius,
			text: text,
			fontSize: textSizeA,
			speed: 0,
			reverse: "0",
			leading: undefined
		});
		var length = runeRing.getLength();
		var circumference = this.currentRadius * 2 * Math.PI;
		var fitRatio = circumference / length;
		var textSizeB = textSizeA * fitRatio;
		runeRing.disperse();
		my_height = textSizeB;
		leading = "0";
	}
	var padding = 2;
	var text = new HEXAGRAM.TextRing({
		parent: this,
		radius: this.currentRadius + padding,
		text: text,
		fontSize: my_height,
		speed: speed || 1,
		reverse: reverse,
		leading: leading
	});
	this.elements.push(text);
	this.currentRadius += my_height;
	this.current = text;
	return this;
}

HEXAGRAM.MagicCircle.prototype.disperse = function () {
	var that = this;
	$.each(that.elements, function(i, element) {
		element.disperse()
		.then(function (el) {
			el.remove();
		});
	});
	that.animation.clear();
	that.elements = [];
	that.currentRadius = 0;
	that.caster = null;
};

var MagicCircle = HEXAGRAM.MagicCircle;
;var HEXAGRAM = HEXAGRAM || {};

HEXAGRAM.Ring = function (config) {
	var that = this;
	var parent = config.parent;
	this.circle = parent.canvas.append("circle");
	this.circle
		.attr("r", 0)
		.attr("cx", parent.width / 2)
		.attr("cy", parent.height / 2)
		.attr("opacity", 1)
		.attr("stroke", parent.styles.colors.ring)
		.attr("fill", "none")
		.style("filter", "url(#drop-shadow" + parent.id + ")")
		.attr("stroke-width", config.strokeWidth || config.radius / 100);
	if (config.strokeWidth > 5) {
		this.circle
			.style("filter", "none");
	}
	this.transition = this.circle.transition()
		.duration(parent.styles.animation.inSpeed)
		.attr("r", config.radius + config.strokeWidth / 2)
		.each("end", function() {
			that.transition = null;
		});
	if (config.strokeWidth) {
		parent.currentRadius += config.strokeWidth;
	}
	return this;
};

HEXAGRAM.Ring.prototype.recolor = function (newColor) {
	this.transition = this.transition || this.circle.transition();
	if (newColor == "useNone") {
		this.transition
			.attr("stroke", "rgba(0,0,0,0)")
			.attr("fill-opacity", "0.0");
		return;
	}
	this.transition
		.attr("stroke", newColor);
};

HEXAGRAM.Ring.prototype.on = function(event, listener) {
	this.circle.on(event, listener);
};

HEXAGRAM.Ring.prototype.disperse = function() {
	var deferred = Q.defer();
	this.circle
		.transition()
		.duration(parent.styles.animation.inSpeed)
		.attr("opacity", 0)
		.attr("r", 0)
		.each("end", deferred.resolve, this.circle);
	return deferred.promise;
};
;var HEXAGRAM = HEXAGRAM || {};

HEXAGRAM.TextRing = function (config) {
	var that = this;
	this.config = config;
	this.parent = config.parent;
	var rotation = 0;
	var runeId = this.parent.id + Math.floor(Math.random() * 1000000);
	var r = 60;
	var size = config.radius;
	var centerX = -size;
	var centerY = 0;
	var path = this.parent.defs.append("path");
	path
		.attr("id", "s3" + runeId)
		.attr("d", "m "+centerX+", "+centerY+" a -"+size+",-"+size+" 1 1,1 "+size*2+",0 a -"+size+",-"+size+" 1 1,1 -"+size*2+",0");
	this.timer = function() {
		rotation = (config.reverse) ? rotation - 1 * (config.speed || that.parent.styles.animation.animationSpeed) : rotation + 1 * (config.speed || that.parent.styles.animation.animationSpeed);
		that.ring
			.transition()
			.duration(100)
			.ease("linear")
			.attr("transform", "translate(" + that.parent.width / 2 + "," + that.parent.height / 2 + ")  rotate(" + rotation + ")");
	};
	this.parent.animation.add(this.timer);
	this.ring = this.parent.canvas.append("g")
		.attr("id", "ring" + runeId)
		.attr('transform', "translate(" + this.parent.width / 2 + "," + this.parent.height / 2 + ")  rotate(" + rotation + ")")
		.style("pointer-events", "none");
	var testTextLengthNode = this.ring.append("text")
		.style("font-size", config.fontSize + "px")
		.attr("xlink:href", "#s3" + runeId)
		.style("text-transform", this.parent.styles.type.typecase)
		.style("filter", "url(#drop-shadow" + this.parent.id + ")")
		.text(config.text);
	this.length = this.ring.select('text').node().getComputedTextLength();
	testTextLengthNode.remove();
	this.text = this.ring.append("text")
		.append("textPath")
		.style("font-size", config.fontSize + "px")
		.attr("xlink:href", "#s3" + runeId)
		.style("letter-spacing", config.leading || this.parent.styles.type.leading)
		.style("text-transform", this.parent.styles.type.typecase)
		.style("pointer-events", "none")
		.style("filter", "url(#drop-shadow" + this.parent.id + ")")
		.text(config.text)
		.attr("fill", this.parent.styles.colors.text)
		.attr("opacity", 0);
	this.transition = this.text.transition()
		.duration(this.parent.styles.animation.inSpeed)
		.ease("linear")
		.attr("opacity", 1)
		.each("end", function() {
			that.transition = null;
		});
	return this;
};

HEXAGRAM.TextRing.prototype.rotation = function (rot) {
	this.parent.animation.remove(this.timer);
	this.ring
		.transition()
		.attr("transform", "translate(" + this.parent.width / 2 + "," + this.parent.height / 2 + ")  rotate(" + parseFloat(rot + 50) + ")");
};

HEXAGRAM.TextRing.prototype.animate = function () {
	this.parent.animation.add(this.timer);
};

HEXAGRAM.TextRing.prototype.getLength = function () {
	return this.length;
};

HEXAGRAM.TextRing.prototype.recolor = function (newColor) {
	this.transition = this.transition || this.text.transition();
	this.transition
		.attr("fill", newColor);
};
HEXAGRAM.TextRing.prototype.disperse = function() {
	var that = this;
	var deferred = Q.defer();
	this.transition = this.text.transition();
	this.transition
		.attr("opacity", 0)
		.each("end", deferred.resolve, this.text);
	setTimeout(function() {
		that.ring.remove();
		that.text.remove();
	}, 500);
	return deferred.promise;
};
