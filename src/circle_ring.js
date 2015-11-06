var HEXAGRAM = HEXAGRAM || {};

HEXAGRAM.CircleRing = function (config) {
	var that = this;
	this.parent = config.parent;
	var RAD = Math.PI * 2;
	var offset = 0;
	this.ring = this.parent.canvas
		.append("g")
		.attr("opacity", 1);
	this.circles = [];
	for (var i = 0; i < config.count; ++ i) {
		var completeness = i / config.count;
		var q = 1;
		var circle = this.ring.append("circle");
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

	this.animation = function () {
		offset = (config.reverse) ? offset - 1 * (config.speed || that.parent.styles.animation.animationSpeed) : offset + 1 * (config.speed || that.parent.styles.animation.animationSpeed);
		that.ring
			.transition()
			.ease("linear")
			.duration(100)
			.attr("transform", "rotate(" + offset + ", " + config.width / 2 + ", " + config.height / 2 + ")");
	};
	this.parent.animation.add(this.animation);

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
	this.parent.animation.remove(this.animation);
	$.each(this.circles, function(i, circle) {
		circle.transition()
			.duration(500)
			.attr("r", 0);
	});
	var transition = this.ring.transition();
	transition
		.duration(this.parent.styles.animation.inSpeed)
		.attr("opacity", 0)
		.each("end", deferred.resolve, this.ring);
	return deferred.promise;
};
