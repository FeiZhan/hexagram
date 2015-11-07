var HEXAGRAM = HEXAGRAM || {};

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
