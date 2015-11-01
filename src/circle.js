var HEXAGRAM = HEXAGRAM || {};

HEXAGRAM.Ring = function (canvas, config) {
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
	if (config.strokeWidth) {
		parent.currentRadius += config.strokeWidth;
	}
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