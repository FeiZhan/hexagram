var HEXAGRAM = HEXAGRAM || {};

HEXAGRAM.MagicCircle = function (selector, config) {
	this.selector = selector;
	this.config = config || HEXAGRAM.MagicCircle.default_config;

	this.styles = HEXAGRAM.MagicCircle.default_config;
	var RAD = Math.PI * 2;
	var magicCircle = this;
	var caster = undefined;
	var width, defs,
	height;
	var svg;
	this.id = Math.floor(Math.random() * 10000000);
	this.draw = {};
	var animator = undefined;
	this.animationListeners = [];
	this.allElements = [];
	this.currentRadius = 0;

	this.cast = function (rad) {
		var draw = this.draw;
		if (!animator) animator = setInterval(magicCircle.animate, 100);
		if (!svg) this.init();
		magicCircle.active = true;

		magicCircle.caster = {
			selector: selector,
			last: null,
			ring: function(strokeWidth, spaceBefore, spaceAfter) {
				var circle = draw.circle(magicCircle.currentRadius, strokeWidth || 1);
				if (spaceBefore) this.space(spaceBefore);
				magicCircle.allElements.push(circle);
				if (strokeWidth) magicCircle.currentRadius += strokeWidth;
				this.last = circle;
				if (spaceAfter) this.space(spaceAfter);
				return this;
			},
			getTextFitSize: function (text) {
				var errorMargin = 2;
				var textSizeA = 10;
				var runeRing = magicCircle.draw.runeRing(magicCircle.currentRadius, text, textSizeA, 0, "0");
				var length = runeRing.getLength();
				var circumference = this.getCircumference();
				var fitRatio = circumference / length;
				var textSizeB = textSizeA * fitRatio;
				runeRing.disperse();
				return textSizeB;
			},
			getCircumference: function () {
				return magicCircle.currentRadius * 2 * Math.PI;
			},
			target: function(element) {
				this.last = element;
				return this;
			},
			color: function(color) {
				if (this.last.recolor) {
					this.last.recolor(color);
				} else {
					console.warn("Cant recolor this element", this.last);
				}
				return this;
			},
			getLast: function() {
				return this.last;
			},
			fill: function(color) {
				if (this.last.fill) {
					this.last.fill(color);
				} else {
					console.warn("Cant fill this element", this.last);
				}
				return this;
			},
			rotation: function(rotation) {
				if (this.last.rotation) {
					this.last.rotation(rotation);
				} else {
					console.warn("Cant rotate element", this.last);
				}
				return this;
			},
			circleRing: function(count, innerRadius, speed, reverse) {
				var circle_ring = circleRing(svg, {
					parent: magicCircle,
					height: height,
					width: width,
					radius: magicCircle.currentRadius + innerRadius,
					count: count,
					innerRadius: innerRadius,
					speed: speed,
					reverse: reverse
				});
				magicCircle.allElements.push(circle_ring);
				magicCircle.currentRadius += innerRadius * 2;
				this.last = circle_ring;
				return this;
			},
			space: function(length) {
				magicCircle.currentRadius += length;
				return this;
			},
			backspace: function(length) {
				magicCircle.currentRadius -= length;
				return this;
			},
			text: function(height, text, speed, reverse,leading) {
				if (height == "autofit") {
					var circumference = this.getCircumference();
					height = this.getTextFitSize(text);
					leading = "0";
				}
				var padding = 2;
				var text = draw.runeRing(magicCircle.currentRadius + padding, text, height, speed || 1, reverse, leading);
				magicCircle.allElements.push(text);
				magicCircle.currentRadius += height;
				this.last = text;
				return this;
			},
			disperse: function() {
				magicCircle.disperse();
			},
			on: function(event, listener) {
				var target = this.last;
				var returner = this;
				if (this.last.on) {
					this.last.on(event, function() {
						returner.last = target;
						listener(returner, target);
						1
					})
				} else {
					console.warn("Can't attach a listener to this object");
				}
				return this;
			}
		}
		return magicCircle.caster;
	};

	this.init = function() {
		width = $(this.selector).width();
		height = $(this.selector).height();
		svg = d3.select(this.selector)
			.append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("class", "main")
			.attr("shape-rendering","optimizeSpeed");
		defs = svg.append("defs");

		var blurFilter = defs.append("filter")
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

		var shadowFilter = defs.append("filter")
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


};
HEXAGRAM.MagicCircle.default_config = {
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
//HEXAGRAM.MagicCircle.prototype.init = function () {};

HEXAGRAM.MagicCircle.prototype.onanimate = function(l) {
	this.animationListeners.push(l);
	return {
		stop: function() {
			this.animationListeners = _.without(this.animationListeners, l);
		},
		start: function() {
			this.animationListeners.push(l);
		}
	};
};

var circleRing = function (svg, config) {
	var RAD = Math.PI * 2;
	var offset = 0;
	var ring = svg.append("g")
		.attr("opacity", 1);
	var circles = [];
	for (var i = 0; i < config.count; i++) {
		var completeness = i / config.count;
		var q = 1;
		var circle = ring.append("circle");
		circle
			.attr("r", 0)
			.attr("cx", config.width / 2 + (Math.cos((offset + completeness) * RAD)) * q * config.radius)
			.attr("cy", config.height / 2 + (Math.sin((offset + completeness) * RAD)) * q * config.radius)
			.attr("stroke", config.parent.styles.colors.smallRing)
			.attr("fill", "none")
			.attr("stroke-width", 0.5 + config.count / 15);
		var transition = circle.transition()
			.duration(config.parent.styles.animation.inSpeed)
			.attr("r", config.count)
			.each("end", function() {
			  circle.t = undefined;
			});
		circle.t = transition;
		circles.push(circle);
	}

	var animation = config.parent.onanimate(function() {
		offset = (config.reverse) ? offset - 1 * (config.speed || config.parent.styles.animation.animationSpeed) : offset + 1 * (config.speed || config.parent.styles.animation.animationSpeed);
		ring
			.transition()
			.ease("linear")
			.duration(100)
			.attr("transform", "rotate(" + offset + ", " + config.width / 2 + ", " + config.height / 2 + ")");
	});

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
			animation.stop();
			_.each(circles, function(circle) {
				circle.transition()
					.duration(500)
					.attr("r", 0);
			});
			var transition = ring.transition()
			transition
				.duration(config.parent.styles.animation.inSpeed)
				.attr("opacity", 0)
				.each("end", deferred.resolve, ring);
			return deferred.promise;
		}
	};
};

