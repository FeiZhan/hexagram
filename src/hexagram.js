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
	this.callback_list = _.without(this.callback_list, callback);
};


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

HEXAGRAM.MagicCircle.prototype.cast = function (rad) {
	var that = this;
	if (! this.animation || "running" != this.animation.status) {
		this.animation.run();
	}
	if (! this.canvas) {
		this.init();
	}
	return that;
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
};

HEXAGRAM.MagicCircle.prototype.run = function () {
};

HEXAGRAM.MagicCircle.prototype.add = function (type, config) {
	switch (type) {
	case "Circle":
		return this.addCircle(config);
		break;
	case "CircleRing":
		return this.addCircleRing(config);
		break;
	case "Text":
		return this.addText(config);
		break;
	}
};

HEXAGRAM.MagicCircle.prototype.addCircle = function (config) {
	var that = this;
	var circle = new HEXAGRAM.Circle(that.canvas, {
		parent: that,
		radius: that.currentRadius,
		strokeWidth: config.strokeWidth || 1
	});
	if (config.spaceBefore) {
		this.space(config.spaceBefore);
	}
	that.elements.push(circle);
	if (config.strokeWidth) {
		that.currentRadius += config.strokeWidth;
	}
	this.current = circle;
	if (config.spaceAfter) {
		this.space(config.spaceAfter);
	}
	return this.caster;
};

HEXAGRAM.MagicCircle.prototype.addCircleRing = function (config) {
	var that = this;
	var circleRing = new HEXAGRAM.CircleRing(that.canvas, {
		parent: that,
		height: that.height,
		width: that.width,
		radius: that.currentRadius + config.innerRadius,
		count: config.count,
		innerRadius: config.innerRadius,
		speed: config.speed,
		reverse: config.reverse
	});
	that.elements.push(circleRing);
	that.currentRadius += config.innerRadius * 2;
	this.current = circleRing;
	return this.caster;
};

HEXAGRAM.MagicCircle.prototype.addText = function (config) {
	var that = this;
	if (config.my_height == "autofit") {
		var circumference = that.currentRadius * 2 * Math.PI;
		config.my_height = this.getTextFitSize(config.text);
		config.leading = "0";
	}
	var padding = 2;
	var text = new HEXAGRAM.TextRing(that.canvas, {
		parent: that,
		radius: that.currentRadius + padding,
		text: config.text,
		fontSize: config.my_height,
		speed: config.speed || 1,
		reverse: config.reverse,
		leading: config.leading
	});
	that.elements.push(text);
	that.currentRadius += config.my_height;
	this.current = text;
	return this.caster;
};

HEXAGRAM.MagicCircle.prototype.getTextFitSize = function (text) {
	var that = this;
	var errorMargin = 2;
	var textSizeA = 10;
	var runeRing = new HEXAGRAM.TextRing(that.canvas, {
		parent: that,
		radius: that.currentRadius,
		text: text,
		fontSize: textSizeA,
		speed: 0,
		reverse: "0",
		leading: undefined
	});
	var length = runeRing.getLength();
	var circumference = that.currentRadius * 2 * Math.PI;
	var fitRatio = circumference / length;
	var textSizeB = textSizeA * fitRatio;
	runeRing.disperse();
	return textSizeB;
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

HEXAGRAM.MagicCircle.prototype.circleRing = function(count, innerRadius, speed, reverse) {
	this.add("CircleRing", {
		count: count,
		innerRadius: innerRadius,
		speed: speed,
		reverse: reverse
	});
	return this;
},

HEXAGRAM.MagicCircle.prototype.ring = function(strokeWidth, spaceBefore, spaceAfter) {
	this.add("Circle", {
		strokeWidth: strokeWidth,
		spaceBefore: spaceBefore,
		spaceAfter: spaceAfter
	});
	return this;
},

HEXAGRAM.MagicCircle.prototype.text = function(my_height, text, speed, reverse,leading) {
	this.add("Text", {
		my_height: my_height,
		text: text,
		speed: speed,
		reverse: reverse,
		leading: leading
	});
	return this;
}

HEXAGRAM.MagicCircle.prototype.disperse = function () {
	var that = this;
	_.each(that.elements, function (element) {
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


HEXAGRAM.Circle = function (canvas, config) {
	var parent = config.parent;
	var circle = canvas.append("circle");
	circle
		.attr("r", 0)
		.attr("cx", parent.width / 2)
		.attr("cy", parent.height / 2)
		.attr("opacity", 1)
		.attr("stroke", parent.styles.colors.ring)
		.attr("fill", "none")
		.style("filter", "url(#drop-shadow" + parent.id + ")")
		.attr("stroke-width", config.strokeWidth || config.radius / 100);
	if (config.strokeWidth > 5) {
		circle
			.style("filter", "none");
	}
	var transition = circle.transition()
		.duration(parent.styles.animation.inSpeed)
		.attr("r", config.radius + config.strokeWidth / 2)
		.each("end", function() {
			transition = null;
		});
	return {
		ref: circle,
		recolor: function(newColor) {
			transition = transition || circle.transition();
			if (newColor == "useNone") {
				transition
					.attr("stroke", "rgba(0,0,0,0)")
					.attr("fill-opacity", "0.0");
				return;
			}
			transition
				.attr("stroke", newColor);
		},
		on: function(event, listener) {
			circle.on(event, listener);
		},
		disperse: function() {
			var deferred = Q.defer();
			circle
				.transition()
				.duration(parent.styles.animation.inSpeed)
				.attr("opacity", 0)
				.attr("r", 0)
				.each("end", deferred.resolve, circle);
			return deferred.promise;
		}
	};
};


HEXAGRAM.CircleRing = function (canvas, config) {
	var RAD = Math.PI * 2;
	var offset = 0;
	var ring = canvas
		.append("g")
		.attr("opacity", 1);
	var circles = [];
	for (var i = 0; i < config.count; ++ i) {
		var completeness = i / config.count;
		var q = 1;
		var circle = ring.append("circle");
		circle
			.attr("r", 0)
			.attr("cx", config.width / 2 + (Math.cos((offset + completeness) * RAD)) * q * config.radius)
			.attr("cy", config.height / 2 + (Math.sin((offset + completeness) * RAD)) * q * config.radius)
			.attr("stroke", config.parent.styles.colors.smallRing)
			.attr("fill", "none")
			.attr("stroke-width", 0.5 + config.innerRadius / 15);
		var transition = circle.transition()
			.duration(config.parent.styles.animation.inSpeed)
			.attr("r", config.innerRadius)
			.each("end", function() {
			  circle.t = undefined;
			});
		circle.t = transition;
		circles.push(circle);
	}

	var animation = function () {
		offset = (config.reverse) ? offset - 1 * (config.speed || config.parent.styles.animation.animationSpeed) : offset + 1 * (config.speed || config.parent.styles.animation.animationSpeed);
		ring
			.transition()
			.ease("linear")
			.duration(100)
			.attr("transform", "rotate(" + offset + ", " + config.width / 2 + ", " + config.height / 2 + ")");
	};
	config.parent.animation.add(animation);

	return {
		ref: ring,
		recolor: function(newColor) {
			_.each(circles, function(circle) {
				circle
					.attr("stroke", newColor);
			});
		},
		fill: function(newColor) {
			_.each(circles, function(circle) {
				circle
					.attr("fill", newColor);
			});
		},
		disperse: function() {
			var deferred = Q.defer();
			config.parent.animation.remove(animation);
			_.each(circles, function(circle) {
				circle.transition()
					.duration(500)
					.attr("r", 0);
			});
			var transition = ring.transition();
			transition
				.duration(config.parent.styles.animation.inSpeed)
				.attr("opacity", 0)
				.each("end", deferred.resolve, ring);
			return deferred.promise;
		}
	};
};


HEXAGRAM.TextRing = function (canvas, config) {
	var parent = config.parent;
	var rotation = 0;
	var runeId = parent.id + Math.floor(Math.random() * 1000000);
	var r = 60;
	var size = config.radius;
	var centerX = -size;
	var centerY = 0;
	var path = parent.defs.append("path");
	path
		.attr("id", "s3" + runeId)
		.attr("d", "m "+centerX+", "+centerY+" a -"+size+",-"+size+" 1 1,1 "+size*2+",0 a -"+size+",-"+size+" 1 1,1 -"+size*2+",0");
	var timer = function() {
		rotation = (config.reverse) ? rotation - 1 * (config.speed || parent.styles.animation.animationSpeed) : rotation + 1 * (config.speed || parent.styles.animation.animationSpeed);
		ring
			.transition()
			.duration(100)
			.ease("linear")
			.attr("transform", "translate(" + parent.width / 2 + "," + parent.height / 2 + ")  rotate(" + rotation + ")");
	};
	parent.animation.add(timer);
	var ring = canvas.append("g")
		.attr("id", "ring" + runeId)
		.attr('transform', "translate(" + parent.width / 2 + "," + parent.height / 2 + ")  rotate(" + rotation + ")")
		.style("pointer-events", "none");
	var testTextLengthNode = ring.append("text")
		.style("font-size", config.fontSize + "px")
		.attr("xlink:href", "#s3" + runeId)
		.style("text-transform", parent.styles.type.typecase)
		.style("filter", "url(#drop-shadow" + parent.id + ")")
		.text(config.text);
	var length = ring.select('text').node().getComputedTextLength();
	testTextLengthNode.remove();
	var text = ring.append("text")
		.append("textPath")
		.style("font-size", config.fontSize + "px")
		.attr("xlink:href", "#s3" + runeId)
		.style("letter-spacing", config.leading || parent.styles.type.leading)
		.style("text-transform", parent.styles.type.typecase)
		.style("pointer-events", "none")
		.style("filter", "url(#drop-shadow" + parent.id + ")")
		.text(config.text)
		.attr("fill", parent.styles.colors.text)
		.attr("opacity", 0);
	var transition = text.transition()
		.duration(parent.styles.animation.inSpeed)
		.ease("linear")
		.attr("opacity", 1)
		.each("end", function() {
			transition = null;
		});
	return {
		ref: ring,
		rotation: function(rot) {
			config.parent.animation.remove(timer);
			ring
				.transition()
				.attr("transform", "translate(" + parent.width / 2 + "," + parent.height / 2 + ")  rotate(" + parseFloat(rot + 50) + ")");
		},
		animate: function() {
			config.parent.animation.add(timer);
		},
		getLength: function() {
			return length;
		},
		recolor: function(newColor) {
			transition = transition || text.transition();
			transition
				.attr("fill", newColor);
		},
		disperse: function() {
			var deferred = Q.defer();
			transition = text.transition();
			transition
				.attr("opacity", 0)
				.each("end", deferred.resolve, text);
			setTimeout(function() {
				ring.remove();
				text.remove();
			}, 500);
			return deferred.promise;
		}
	};
};
