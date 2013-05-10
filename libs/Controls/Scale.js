//CLASS: 缩放控制类
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

