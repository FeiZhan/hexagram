var HEXAGRAM = HEXAGRAM || {};

HEXAGRAM.Rectangle = function (config) {
	var that = this;
	this.config = config || {};
	this.parent = config.parent;
	this.circle = this.parent.canvas.append("rect");
	this.circle
		.attr("width", config.radius + config.strokeWidth / 2)
		.attr("height", config.radius + config.strokeWidth / 2)
		.attr("opacity", 1)
		.attr("stroke", config.stroke || this.parent.styles.colors.ring)
		.attr("fill", config.fill || "none")
		.style("filter", "url(#drop-shadow" + this.parent.id + ")")
		.attr("stroke-width", config.strokeWidth || config.radius / 100);
	this.transition = this.circle.transition()
		.duration(this.parent.styles.animation.inSpeed)
		.each("end", function() {
			that.transition = null;
		});
	if (config.strokeWidth) {
		this.parent.currentRadius += config.strokeWidth;
	}
	return this;
};

HEXAGRAM.Rectangle.prototype.recolor = function (newColor) {
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

HEXAGRAM.Rectangle.prototype.on = function(event, listener) {
	this.circle.on(event, listener);
};

HEXAGRAM.Rectangle.prototype.disperse = function() {
	var deferred = Q.defer();
	this.circle
		.transition()
		.duration(this.parent.styles.animation.inSpeed)
		.attr("opacity", 0)
		.attr("r", 0)
		.each("end", deferred.resolve, this.circle);
	return deferred.promise;
};
