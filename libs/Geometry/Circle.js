//CLASS:几何类型：圆
function Circle(x, y, radius, threeD) {
    Point.apply(this, [x, y, threeD]);
    this.radius = radius;
}

Circle.prototype = new Point();

Circle.prototype.getBounds = function () {
    if(!this.bounds) {
        this.bounds = new CanvasSketch.Bounds(this.x - this.radius, this.y - this.radius, this.x + this.radius, this.y + this.radius);
        return this.bounds;
    } else {
        return this.bounds;
    }
}

Circle.prototype.updatePostion = function(x, y) {
	this.x = x;
	this.y = y;
	this.bounds = new CanvasSketch.Bounds(this.x - this.radius, this.y - this.radius, this.x + this.radius, this.y + this.radius);
}

Circle.prototype.geoType = "Circle";