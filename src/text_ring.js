var HEXAGRAM = HEXAGRAM || {};

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