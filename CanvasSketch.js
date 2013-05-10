CanvasSketch = {
	vesion: "1.0.0",		
	author: "Gao"
}
﻿//工具类型文件
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
	this.fillOpacity = 0.6;
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
}﻿//CLASS: 缩放控制类
function Scale(layer) {
    this.layer = layer;
    this.div = layer.div;
    this.active();
}

Scale.prototype.wheelChange = function(e) {
    var layer = this.layer;
    var delta = e.wheelDelta?(e.wheelDelta / 120) * 30: -e.detail / 3 * 30;
    var deltalX = layer.size.w/2 - (e.offsetX || (e.layerX));
    var deltalY = (e.offsetY || (e.layerY)) - layer.size.h/2;
    
    var px = {x: (e.offsetX || (e.layerX)), y:(e.offsetY || (e.layerY))};
    var zoomPoint = this.layer.getPositionFromPx(px);    
    var zoom = this.layer.zoom + delta;
    var newRes = this.layer.getResFromZoom(zoom);
    
    var center = new CanvasSketch.Position(zoomPoint.x + deltalX * newRes, zoomPoint.y + deltalY * newRes);
    
    
    this.layer.moveTo(zoom, center);
    
    CanvasSketch.stopEventBubble(e);
}

Scale.prototype.DOMScroll = function(e) {
    CanvasSketch.stopEventBubble(e);
}

Scale.prototype.Events = [["mousewheel", Scale.prototype.wheelChange],["DOMMouseScroll", Scale.prototype.wheelChange]];

Scale.prototype.active = function () {
    for(var i = 0, len = this.Events.length; i < len; i++) {
        var type = this.Events[i][0];
        var listener = this.Events[i][1];
        listener = CanvasSketch.bindAsEventListener(listener, this);
        this.div.addEventListener(type, listener, true);        
    }
}

﻿//CLASS:控制平移。
function Pan(layer) {
    this.layer = layer;
    this.div = layer.div;
    this.active();
    this.dragging = false;
}

Pan.prototype.startPan = function(e) {
    this.dragging = true;
    //在一开始保存点击的位置。
    this.lastX = (e.offsetX || e.layerX);
    this.lastY = (e.offsetY || e.layerY);
    //设置鼠标样式。
    this.layer.div.style.cursor = "move";
    CanvasSketch.stopEventBubble(e);
}

Pan.prototype.pan = function(e) {
    if(this.dragging) {
        var layer = this.layer;
        //计算改变的像素值
        var dx = (e.offsetX || e.layerX) - this.lastX;
        var dy = (e.offsetY || e.layerY) - this.lastY;
        this.lastX = (e.offsetX || e.layerX);
        this.lastY = (e.offsetY || e.layerY);
        layer.center.x -= dx * layer.res;
        layer.center.y += dy * layer.res;
        layer.moveTo(layer.zoom, layer.center);
    }
    CanvasSketch.stopEventBubble(e);
}

Pan.prototype.endPan = function(e) {
    this.layer.div.style.cursor = "default";
    this.dragging = false;
    CanvasSketch.stopEventBubble(e);
}

Pan.prototype.Events = [["mousedown", Pan.prototype.startPan],
                        ["mousemove", Pan.prototype.pan],
                        ["mouseup", Pan.prototype.endPan]];

                        
Pan.prototype.active = function () {
    for(var i = 0, len = this.Events.length; i < len; i++) {
        var type = this.Events[i][0];
        var listener = this.Events[i][1];
        listener = CanvasSketch.bindAsEventListener(listener, this);
        this.div.addEventListener(type, listener, true);        
    }
}                ﻿//CLASS:图层类
function Layer(div, threeD) {
    var style = div.style;
    var size = new CanvasSketch.Size(parseInt(style.width), parseInt(style.height));
    this.size = size;
    this.div = div;
    this.scale = new Scale(this);
    this.pan = new Pan(this);
    this.maxBounds = new CanvasSketch.Bounds(-size.w / 2, -size.h / 2, size.w / 2, size.h / 2);
    this.bounds = new CanvasSketch.Bounds(-size.w / 2, -size.h / 2, size.w / 2, size.h / 2);
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

Layer.prototype.drawVector = function (vector) {
    var style;
    if(!vector.style) {
        style = new CanvasSketch.defaultStyle();
    } else {
        style = vector.style;
    }
    this.renderer.drawGeometry(vector.geometry, style);
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

//通过屏幕坐标设定center。
Layer.prototype.getPositionFromPx = function (px) {
    return new Point((px.x + this.bounds.left / this.res) * this.res,
        (this.bounds.top/this.res - px.y) * this.res);
}﻿//ClASS:渲染器类型
function Canvas (layer) {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    //只有当lock为false的时候才会执行绘制。
    this.lock = true;
    this.layer = layer;
    this.setSize(layer.size);
    this.geometrys = {};
    layer.div.appendChild(this.canvas);
}

//设置canvas元素的大小。
Canvas.prototype.setSize = function(size){
    this.canvas.width = size.w;
    this.canvas.height = size.h;
    this.canvas.style.width = size.w + "px";
    this.canvas.style.height = size.h + "px";
}

//这个方法用于收集所有需要绘制的矢量元素。    
Canvas.prototype.drawGeometry = function(geometry, style){
    this.geometrys[geometry.id] = [geometry, style];
    //如果渲染器没有被锁定则可以进行重绘。
    if(!this.lock){
        this.redraw();
    }
}

//每次绘制都是全部清除，全部重绘。
//todo加入快照后可以大大提高性能。    
Canvas.prototype.redraw = function(){
    this.context.clearRect(0, 0, this.layer.size.w, this.layer.size.h);
    var geometry;
    if(!this.lock){
        for(var id in this.geometrys){
			geometry = this.geometrys[id][0];
			var bounds = geometry.getBounds();
			//如果使用3d方式需要把用于显示的bounds，转化为世界坐标系下的bounds。
			if(layer.threeD) {
				var layerBounds = this.layer.bounds.disToWorldBounds();
			} else {
				var layerBounds = this.layer.bounds;
			}
			if(layerBounds.intersect(bounds)) {			
				style = this.geometrys[id][1];
				this.draw(geometry, style, geometry.id); 
			}
        }
    }    
}

//每一个矢量元素的绘制，这里我们在以后会添加更多的矢量图形。
Canvas.prototype.draw = function(geometry, style, id){
    if(geometry.geoType == "Point"){
        this.drawPoint(geometry, style, id);
    }
    if(geometry.geoType == "Circle") {
        this.drawCircle(geometry, style, id);
    }
    if(geometry.geoType == "Line") {
        this.drawLine(geometry, style, id);
    }
    if(geometry.geoType == "LinerRing") {
        this.drawLinerRing(geometry, style, id);
    }
	if(geometry.geoType == "LinerRing") {
        this.drawLinerRing(geometry, style, id);
    }
	if(geometry.geoType == "Img") {
        this.drawImage(geometry, style, id);
    }
    //{todo} 我们在这里判断各种矢量要素的绘制。        
}

Canvas.prototype.drawLine = function(geometry, style, id) {
    this.setCanvasStyle("stroke", style);
    this.rendererPath(geometry, {fill: false, stroke: true}, id);
    this.setCanvasStyle("reset");
}

Canvas.prototype.drawLinerRing = function(geometry, style, id) {		
	this.rendererPath(geometry, {fill: style.fill, stroke: style.stroke}, id);
	
    //如果我们使用的是3d世界中的绘图，且我们的图形高度大于0。
	if(this.layer.threeD && geometry.threeD && geometry.threeD.height > 0) {
		//绘制顶面。
		var linerRing3d = this.convertPathTothreeD(geometry);
		this.rendererPath(linerRing3d, {fill: style.fill, stroke: style.stroke}, id);
		//绘制侧面。
		var points2d = geometry.points;
		var points3d = linerRing3d.points;
		for(var i = 0, len = points2d.length - 1; i< len; i++) {
			var p1 = new Point3D(points2d[i].x, 0, points2d[i].y);
			var p2 = points3d[i];
			var p3 = points3d[i + 1];
			var p4 = new Point3D(points2d[i + 1].x, 0, points2d[i + 1].y);
			var edgePoints = [p1, p2, p3, p4];
			var edge = new LinerRing(edgePoints);
			this.rendererPath(edge, {fill: style.fill, stroke: style.stroke}, id);
		}
	}
	
    this.setCanvasStyle("reset");
}

Canvas.prototype.convertPathTothreeD = function(geometry) {
	var points = geometry.points;
	var height = geometry.threeD.height;
	var points3d = [];
	for(var i = 0, len = points.length; i < len; i++) {
		//每一个点加入高度。
		var point3d = new Point3D(points[i].x, height, points[i].y);
		points3d.push(point3d);
	}
	var linerRing3d = new LinerRing(points3d);
	return linerRing3d;
}

Canvas.prototype.rendererPath = function(geometry, rendererType, id) {
    //3d信息。
	var points = geometry.points;
    var len = points.length;
    var context = this.context;
    context.beginPath();
    var start = this.getLocalXY(points[0]);
    var x = start.x;
    var y = start.y;
    if (!isNaN(x) && !isNaN(y)) {
        context.moveTo(x, y);
        for (var i=1; i<len; ++i) {
            var pt = this.getLocalXY(points[i]);
            context.lineTo(pt.x, pt.y);
        }
        if (rendererType.fill) {
			this.setCanvasStyle("fill", style);
            context.fill();
        } 
        if (rendererType.stroke) {
			this.setCanvasStyle("stroke", style);
            context.stroke();
        } 
    }
}

//针对点的绘制方法。
Canvas.prototype.drawPoint = function(geometry, style, id){
    var radius = style.pointRadius;
    var twoPi = Math.PI*2;
    var pt = this.getLocalXY(geometry, geometry.threeD);
    //填充
    if(style.fill) {
        this.setCanvasStyle("fill", style)
        this.context.beginPath();
        this.context.arc(pt.x, pt.y, radius, 0, twoPi, true);
        this.context.fill();
    }
    //描边
    if(style.stroke) {
        this.setCanvasStyle("stroke", style)
        this.context.beginPath();
        this.context.arc(pt.x, pt.y, radius, 0, twoPi, true);
        this.context.stroke();
    }
    this.setCanvasStyle("reset");
}

//针对图片的绘制方法。
Canvas.prototype.drawImage = function(geometry, style, id){
    var canvas = this;
	if(!geometry.useUrl) {
		var img = geometry.image;
		imageLoad();
	}else {
		var img = new Image();
		img.onload = imageLoad;
		img.loadErro = imageErro;
		img.src = geometry.image;	
	}
	
	function imageLoad() {
		canvas.setCanvasStyle("fill", style);
		var fixedSize = style.fixedSize;
		var pt = canvas.getLocalXY(geometry.point, geometry.threeD);
		var width = style.width || img.width;
		var height = style.width || img.height;
		if(fixedSize) {
			var offsetX = width / 2;
			var offsetY = height / 2;
			canvas.context.drawImage(img, pt.x - offsetX, pt.y - offsetY, width, height);
		}else {
			var res = canvas.layer.getRes();
			var offsetX = width / 2 / res;
			var offsetY = height / 2 / res;
			canvas.context.drawImage(img, pt.x - offsetX, pt.y - offsetY, width / res, height / res);
		}
		if(geometry.useUrl) {
			geometry.useUrl = false;
			geometry.image = img;
		}
		canvas.setCanvasStyle("reset");
	}
	
	function imageErro() {
	
	}
}

//针对圆的绘制方法。
Canvas.prototype.drawCircle = function(geometry, style, id){
    var radius = geometry.radius
    var twoPi = Math.PI*2;
    var pt = this.getLocalXY(geometry, geometry.threeD);
    //填充
    if(style.fill) {
        this.setCanvasStyle("fill", style);
        this.context.beginPath();
        this.context.arc(pt.x, pt.y, radius / this.layer.res, 0, twoPi, true);
        this.context.fill();
    }
    //描边
    if(style.stroke) {
        this.setCanvasStyle("stroke", style)
        this.context.beginPath();
        this.context.arc(pt.x, pt.y, radius / this.layer.res, 0, twoPi, true);
        this.context.stroke();
    }
    this.setCanvasStyle("reset");
}

//设置canvas的样式。
Canvas.prototype.setCanvasStyle = function(type, style) {
    if (type === "fill") {     
        this.context.globalAlpha = style['fillOpacity'];
        this.context.fillStyle = style['fillColor'];
    } else if (type === "stroke") {  
        this.context.globalAlpha = style['strokeOpacity'];
        this.context.strokeStyle = style['strokeColor'];
        this.context.lineWidth = style['strokeWidth'];
    } else {
        this.context.globalAlpha = 1;
        this.context.lineWidth = 1;
    }
}

//获得一个点的屏幕显示位置。
Canvas.prototype.getLocalXY = function(point, threeD) {
    threeD = threeD || this.layer.threeD;
	if(threeD && this.layer.threeD) {
		if(point.geoType !== "Point3D") {
			point = new Point3D(point.x, threeD.height, point.y);
		}
		point = point.toDisPlayPoint();
	}
	var resolution = this.layer.getRes();
    var extent = this.layer.bounds;
    var x = (point.x / resolution + (-extent.left / resolution));
    var y = ((extent.top / resolution) - point.y / resolution);
    return {x: x, y: y};
}﻿//CLASS:矢量图形类
function Vector(geometry, style, attributes) {
    this.id = CanvasSketch.getId("vector");
    this.geometry = geometry;
	this.style = style;
    if(attributes) {
        this.attributes = attributes;
    }
}﻿//CLASS:基本几何类型。
function Geometry(threeD){
    this.id = CanvasSketch.getId("geomtry_");
	//增加3d的属性。
	if(threeD) {
		this.threeD = threeD;
	}
}

//bounds属性定义了当前Geometry外接矩形范围。
Geometry.prototype.bounds = null;

//定义Geometry的id属性。
Geometry.prototype.id = null;

//定义对bounds基类克隆的方法
Geometry.prototype.clone = function () {
    return new Geometry();
}

//销毁当前的Geometry
Geometry.prototype.destroy = function () {
    this.bounds = null;
    this.id = null;
}﻿//CLASS:几何类型点
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
﻿//CLASS:几何类型：圆
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

Circle.prototype.geoType = "Circle";﻿//CLASS:几何对象线类。
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
}﻿//CLASS：几何对象封闭线类
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

LinerRing.prototype.geoType = "LinerRing";﻿//CLASS:几何图形五角星
function Star(center, r, threeD) {
	this.center = center;
    //五角星的长半径
    this.r = r;
    var points = this.getPoints(center, r);
    LinerRing.apply(this, [points, threeD]);
}

Star.prototype = new LinerRing();

Star.prototype.getPoints = function(center, r) {
    var point, points = [];
    var angle = 0;
    var degree = Math.PI / 180;
    for(var i = 0; i < 10; i++) {
        var radius = (i % 2 == 0)? r : r/2;
        point = new Point(center.x + Math.sin(angle * degree) * radius, center.y + Math.cos(angle * degree) * radius);    
        points.push(point);
        angle+=36;
    }
    return points;
}

Star.prototype.geoType = "LinerRing";﻿//CLASS: 显示图像类。
function Img(point, image) {
	Geometry.apply(this, []);
	this.point = point;
	if(typeof image == Image) {
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
}//CLASS: POINT3D���͡�
function Point3D(x, y, z){
	this.x = x;
	this.y = y;
	this.z = z;
}

Point3D.prototype.toDisPlayPoint = function() {
	var x = this.x - this.z;
	var y = this.y * this.CORRECT + (this.x + this.z) * 0.5;
	return new Point(x, y);
}

Point3D.prototype.CORRECT =  1.2247;

Point3D.prototype.geoType = "Point3D";

Point3D.prototype.clone = function() {
	return new Point3D(this.x, this.y, this.z);
}//CLASS:�Ƚ�����3DЧ����
function ThreeD(height) {
	this.height = height;
}