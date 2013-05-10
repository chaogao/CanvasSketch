//工具类型文件
CanvasSketch.lastId = 0;
//取得id。
CanvasSketch.getId = function (preString) {
	CanvasSketch.lastId += 1;
	return preString + CanvasSketch.lastId;
}

//图形的范围
CanvasSketch.Bounds = function (x1, y1, x2, y2) {
	this.left = x1;
	this.right = x2;
	this.bottom = y1;
	this.top = y2;
}

CanvasSketch.Bounds.prototype.getCenter = function (){
	var w = this.right - this.left;
	var h = this.top - this.bottom;
	return new CanvasSketch.Position(this.left + w/2, this.bottom + h/2);
}

CanvasSketch.Bounds.prototype.intersect = function (bounds) {
	var inBottom = (
		((bounds.bottom >= this.bottom) && (bounds.bottom <= this.top)) ||
		((this.bottom >= bounds.bottom) && (this.bottom <= bounds.top))
	);
	var inTop = (
		((bounds.top >= this.bottom) && (bounds.top <= this.top)) ||
		((this.top > bounds.bottom) && (this.top < bounds.top))
	);
	var inLeft = (
		((bounds.left >= this.left) && (bounds.left <= this.right)) ||
		((this.left >= bounds.left) && (this.left <= bounds.right))
	);
	var inRight = (
		((bounds.right >= this.left) && (bounds.right <= this.right)) ||
		((this.right >= bounds.left) && (this.right <= bounds.right))
	);
	intersects = ((inBottom || inTop) && (inLeft || inRight));
	return intersects;
}

CanvasSketch.Bounds.prototype.extend = function (bounds) {
	if(this.left > bounds.left) {
		this.left = bounds.left;
	}
	if(this.bottom > bounds.bottom) {
		this.bottom = bounds.bottom;
	}
	if(this.right < bounds.right) {
		this.right = bounds.right;
	}
	if(this.top < bounds.top) {
		this.top = bounds.top;
	}
}

CanvasSketch.Bounds.prototype.disToWorldBounds = function() {
	var leftbottom = new Point(this.left, this.bottom);
	var rightTop = new Point(this.right, this.top);
	var leftTop = new Point(this.left, this.top);
	var rightBottom = new Point(this.right, this.bottom);
	
	var p1 = leftbottom.disToWorldPoint();
	var p2 = rightTop.disToWorldPoint();
	var p3 = leftTop.disToWorldPoint();
	var p4 = rightBottom.disToWorldPoint();
	
	return new CanvasSketch.Bounds(p1.x, p4.y, p2.x, p3.y);
}

//位置信息类
CanvasSketch.Position = function (x, y) {
	this.x = x;
	this.y = y;
}

CanvasSketch.Position.prototype.clone = function (x, y) {
	return new CanvasSketch.Position(this.x, this.y);
}

//大小类
CanvasSketch.Size = function (w, h) {
	this.w = w;
	this.h = h;
}

//矢量图形的默认样式
CanvasSketch.defaultStyle = function () {
	this.fill = true;
	this.stroke = true;
	this.pointRadius = 5;
	this.fillOpacity = 1;
	this.strokeOpacity = 1;
	this.fillColor = "red";
	this.strokeColor = "black";
	this.fixedSize = false;
}

//保存时间的this。
CanvasSketch.bindAsEventListener = function(func, object) {
	return function(event) {
		return func.call(object, event || window.event);
	};
}

//阻止事件冒泡
CanvasSketch.stopEventBubble = function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }

    if (e && e.stopPropagation)
        e.stopPropagation();
    else
        window.event.cancelBubble=true;
}

CanvasSketch.cloneObj = function (obj) {
	var reObj = {};
	for(var id in obj) {
		reObj[id] = obj[id];
	}
	return reObj;	
}