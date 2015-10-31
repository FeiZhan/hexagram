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
				var circle = new HEXAGRAM.Circle(svg, {
					radius: magicCircle.currentRadius,
					strokeWidth: strokeWidth || 1,
					height: height,
					width:width ,
					magicCircle: magicCircle
				});
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
				var runeRing = new HEXAGRAM.RuneRing(svg, {
					defs: defs,
					height: height,
					width: width,
					magicCircle: magicCircle,
					radius: magicCircle.currentRadius,
					text: text,
					fontSize: textSizeA,
					speed: 0,
					reverse: "0",
					leading: undefined
				});
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
				var circleRing = new HEXAGRAM.CircleRing(svg, {
					parent: magicCircle,
					height: height,
					width: width,
					radius: magicCircle.currentRadius + innerRadius,
					count: count,
					innerRadius: innerRadius,
					speed: speed,
					reverse: reverse
				});
				magicCircle.allElements.push(circleRing);
				magicCircle.currentRadius += innerRadius * 2;
				this.last = circleRing;
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
			text: function(my_height, text, speed, reverse,leading) {
				if (my_height == "autofit") {
					var circumference = this.getCircumference();
					my_height = this.getTextFitSize(text);
					leading = "0";
				}
				var padding = 2;
				var text = new HEXAGRAM.RuneRing(svg, {
					defs: defs,
					height: height,
					width: width,
					magicCircle: magicCircle,
					radius: magicCircle.currentRadius + padding,
					text: text,
					fontSize: my_height,
					speed: speed || 1,
					reverse: reverse,
					leading: leading
				});
				magicCircle.allElements.push(text);
				magicCircle.currentRadius += my_height;
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
						//1
					});
				} else {
					console.warn("Can't attach a listener to this object");
				}
				return this;
			}
		};
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

  this.animate = function() {
    for (var i = 0; i < magicCircle.animationListeners.length; i++) {
      magicCircle.animationListeners[i]();
    }
  };

	this.disperse = function() {

    magicCircle.active = false;

    var elementCount = magicCircle.allElements.length;
    var elementsDispersed = 0;
    _.each(magicCircle.allElements, function(element) {
      element.disperse()
        .then(function(el) {
          elementsDispersed++;
          el.remove();
        });
    });

    magicCircle.allElements = [];
    magicCircle.animationListeners = [];
    clearInterval(animator);
    animator = null;
    magicCircle.currentRadius = 0;

    magicCircle.caster = null;
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

HEXAGRAM.CircleRing = function (svg, config) {
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
			var transition = ring.transition();
			transition
				.duration(config.parent.styles.animation.inSpeed)
				.attr("opacity", 0)
				.each("end", deferred.resolve, ring);
			return deferred.promise;
		}
	};
};

HEXAGRAM.Circle = function(svg, config) {
	var radius = config.radius;
	var strokeWidth = config.strokeWidth;
	var height = config.height;
	var width = config.width;
	var magicCircle = config.magicCircle;

	var circle = svg.append("circle");
	circle
		.attr("r", 0)
		.attr("cx", width / 2)
		.attr("cy", height / 2)
		.attr("opacity", 1)
		.attr("stroke", magicCircle.styles.colors.ring)
		.attr("fill", "none")
		.style("filter", "url(#drop-shadow" + magicCircle.id + ")")
		.attr("stroke-width", strokeWidth || radius / 100);
	if (strokeWidth > 5) {
		circle
			.style("filter", "none");
	}
	var transition = circle.transition()
		.duration(magicCircle.styles.animation.inSpeed)
		.attr("r", radius + strokeWidth / 2)
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
				.duration(magicCircle.styles.animation.inSpeed)
				.attr("opacity", 0)
				.attr("r", 0)
				.each("end", deferred.resolve, circle);
			return deferred.promise;
		}
	};
};

HEXAGRAM.RuneRing = function(svg, config) {
	var defs = config.defs;
	var height = config.height;
	var width = config.width;
	var magicCircle = config.magicCircle;
	var radius = config.radius;
	var text = config.text;
	var fontSize = config.fontSize;
	var speed = config.speed;
	var reverse = config.reverse;
	var leading = config.leading;

	var rotation = 0;
	var runeId = magicCircle.id + Math.floor(Math.random() * 1000000);
	var r = 60;
	var size = radius;
	var centerX = -size;
	var centerY = 0;
	var path = defs.append("path");
	path
		.attr("id", "s3" + runeId)
		.attr("d", "m "+centerX+", "+centerY+" a -"+size+",-"+size+" 1 1,1 "+size*2+",0 a -"+size+",-"+size+" 1 1,1 -"+size*2+",0");
	var timer = magicCircle.onanimate(function() {
		rotation = (reverse) ? rotation - 1 * (speed || magicCircle.styles.animation.animationSpeed) : rotation + 1 * (speed || magicCircle.styles.animation.animationSpeed);
		ring
			.transition()
			.duration(100)
			.ease("linear")
			.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")  rotate(" + rotation + ")");
	});

	var ring = svg.append("g")
		.attr("id", "ring" + runeId)
		.attr('transform', "translate(" + width / 2 + "," + height / 2 + ")  rotate(" + rotation + ")")
		.style("pointer-events", "none");
	var testTextLengthNode = ring.append("text")
		.style("font-size", fontSize + "px")
		.attr("xlink:href", "#s3" + runeId)
		.style("text-transform", magicCircle.styles.type.typecase)
		.style("filter", "url(#drop-shadow" + magicCircle.id + ")")
		.text(text);
	var length = ring.select('text').node().getComputedTextLength();
	testTextLengthNode.remove();
	var text = ring.append("text")
		.append("textPath")
		.style("font-size", fontSize + "px")
		.attr("xlink:href", "#s3" + runeId)
		.style("letter-spacing", leading || magicCircle.styles.type.leading)
		.style("text-transform", magicCircle.styles.type.typecase)
		.style("pointer-events", "none")
		.style("filter", "url(#drop-shadow" + magicCircle.id + ")")
		.text(text)
		.attr("fill", magicCircle.styles.colors.text)
		.attr("opacity", 0);
	var transition = text.transition()
		.duration(magicCircle.styles.animation.inSpeed)
		.ease("linear")
		.attr("opacity", 1)
		.each("end", function() {
			transition = null;
		});
	return {
		ref: ring,
		rotation: function(rot) {
			timer.stop();
			ring
				.transition()
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")  rotate(" + parseFloat(rot + 50) + ")");
		},
		animate: function() {
			timer.start();
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

var MagicCircle = HEXAGRAM.MagicCircle;