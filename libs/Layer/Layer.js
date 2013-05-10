//CLASS:图层类
function Layer(div, controls, event, threeD) {
    var style = div.style;
    var size = new CanvasSketch.Size(parseInt(style.width), parseInt(style.height));
    this.size = size;
    this.div = div;	
	if(controls !== false) {
		this.scale = new Scale(this);
		this.pan = new Pan(this);
	}	
    this.maxBounds = new CanvasSketch.Bounds(0, 0, size.w, size.h);
    this.bounds = new CanvasSketch.Bounds(0, 0, size.w, size.h);
    this.center = this.bounds.getCenter();
    this.zoom = 100;
    this.getRes();
    this.vectors = {};
    //加入矢量图形的总个数。
    this.vectorsCount = 0;
    //创建一个渲染器。
    this.renderer = new Canvas(this);
	this.threeD = threeD;
}

//这个res代表当前zoom下每像素代表的单位长度。 
//比如当前缩放比率为 200% 则通过计算得到 res为0.5，说明当前zoom下每个像素只表示0.5个单位长度。
Layer.prototype.getRes = function() {
    this.res = 1 / (this.zoom / 100);
    return this.res;
}

Layer.prototype.getResFromZoom = function(zoom) {
    return res = 1 / (zoom / 100);
}

Layer.prototype.addVectors = function (vectors) {
    this.renderer.lock = true;
    for(var i = 0, len = vectors.length; i < len; i++) {
        if(i == len-1) {this.renderer.lock = false;}
        this.vectors[vectors[i].id] = vectors[i];
		this.drawVector(vectors[i]);
    }
    this.vectorsCount += vectors.length;
}

Layer.prototype.deleteVector = function (vector) {
	delete this.vectors[vector.id];
	delete this.renderer.geometrys[vector.geometry.id];
	this.vectorsCount --;
    // this.reDraw();
}

Layer.prototype.drawVector = function (vector) {
    var style;
    if(!vector.style) {
        style = new CanvasSketch.defaultStyle();
    } else {
        style = vector.style;
    }
    this.renderer.drawGeometry(vector.geometry, style, vector.id);
}

Layer.prototype.moveTo = function (zoom, center) {
    if(zoom <= 0) {
        return;
    }
    this.zoom = zoom;
    this.center = center;
    var res = this.getRes();
    var width = this.size.w * res;
    var height = this.size.h * res;
    //获取新的视图范围。
    var bounds = new CanvasSketch.Bounds(center.x - width/2, center.y - height/2, center.x + width/2, center.y + height/2);
    this.bounds = bounds;
    //记录已经绘制vector的个数
    var index = 0;
    this.renderer.lock = true;
    for(var id in this.vectors){
        index++;
        if(index == this.vectorsCount) {
            this.renderer.lock = false;
        }
        this.drawVector(this.vectors[id]);
    }
}

Layer.prototype.reDraw = function() {
	this.moveTo(this.zoom, this.center);
}

//通过屏幕坐标获取世界坐标。
Layer.prototype.getPositionFromPx = function (px) {
    return new Point((px.x + this.bounds.left / this.res) * this.res,
        (this.bounds.top/this.res - px.y) * this.res);
}

//通过屏幕坐标获取世界坐标。
Layer.prototype.clearVector = function (px) {
	this.vectors = {};
	this.renderer.clear();
	this.vectorsCount = 0;
}

Layer.prototype.addSelectControl = function(event) {
	if(event) this.select = new Select(this, event);
}