var HEXAGRAM = HEXAGRAM || {};

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
			$.each(circles, function(i, circle) {
				circle
					.attr("stroke", newColor);
			});
		},
		fill: function(newColor) {
			$.each(circles, function(i, circle) {
				circle
					.attr("fill", newColor);
			});
		},
		disperse: function() {
			var deferred = Q.defer();
			config.parent.animation.remove(animation);
			$.each(circles, function(i, circle) {
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