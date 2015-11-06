var HEXAGRAM = HEXAGRAM || {};

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
