//CLASS：几何对象封闭线类
function LinerRing(points, threeD) {
    Line.apply(this, arguments);
    if(points) {
        this.points = points;
        var len = this.points.length;
        if(this.points[0].x != this.points[len-1].x || this.points[0].y != this.points[len-1].y) {
            this.points.push(this.points[0].clone());
        }
    }
}

LinerRing.prototype = new Line();

LinerRing.prototype.geoType = "LinerRing";