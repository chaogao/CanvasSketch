//CLASS:几何对象线类。
function Line(points, threeD) {
    Geometry.call(this, threeD);
    this.points = points;
}

Line.prototype = new Geometry();

Line.prototype.geoType = "Line";

Line.prototype.getBounds = function () {
	if(!this.bounds) {
		var p0 = this.points[0];
		this.bounds = new CanvasSketch.Bounds(p0.x, p0.y, p0.x, p0.y);
		for(var i = 1, len = this.points.length; i< len; i++) {
			var point = this.points[i];
			var bounds = new CanvasSketch.Bounds(point.x, point.y, point.x, point.y);
			this.bounds.extend(bounds);
		}
	}
	return this.bounds;
}

Line.prototype.updateBounds = function () {
	var p0 = this.points[0];
	this.bounds = new CanvasSketch.Bounds(p0.x, p0.y, p0.x, p0.y);
	for(var i = 1, len = this.points.length; i< len; i++) {
		var point = this.points[i];
		var bounds = new CanvasSketch.Bounds(point.x, point.y, point.x, point.y);
		this.bounds.extend(bounds);
	}
}