//CLASS: 显示图像类。
function Img(point, image, size) {
	Geometry.apply(this, []);
	this.point = point;
	this.size = size;
	if(typeof image == "object") {
		this.useUrl = false;
		this.image = image;
	}else {
		this.useUrl = true;
		this.image = image;
	}
}

Img.prototype = new Geometry();

Img.prototype.geoType = "Img";

Img.prototype.getBounds = function () {
	return new CanvasSketch.Bounds(this.point.x, this.point.y, this.point.x, this.point.y);
}