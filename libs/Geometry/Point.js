//CLASS:几何类型点
function Point(x, y, threeD) {
    Geometry.call(this, threeD);
    this.x = x;
    this.y = y;
}

Point.prototype = new Geometry();
//point类的横坐标。
Point.prototype.x = null;
//point类的纵坐标。
Point.prototype.y = null;

//得到点的范围。
Point.prototype.getBounds = function () {
    if(!this.bounds) {
        var x = this.x;
        var y = this.y;
        this.bounds = new CanvasSketch.Bounds(x, y, x, y);
        return this.bounds;
    } else {
        return this.bounds;
    }
}

//clone方法。
Point.prototype.clone = function () {
    return new Point(this.x, this.y);
}

//做所显示用的point，转换为3d下的point值。
Point.prototype.disToWorldPoint3D = function(height) {
    var x = this.y + this.x * 0.5;
    var y = height || 0;
    var z = this.y - this.x * 0.5;
    return new Point3D(x, y, z);
}

//做所显示用的point，转换为世界坐标系下的point(x,0,z)值。
Point.prototype.disToWorldPoint = function(height) {
    var x = this.y + this.x * 0.5;
    var z = this.y - this.x * 0.5;
    return new Point(x, z);
}

Point.prototype.geoType = "Point";
