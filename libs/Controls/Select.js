//CLASS:控制平移。
function Select(layer, event) {
    this.layer = layer;
    this.div = layer.div;
    this.active();
    this.dragging = false;
	this.selectedVector = null;
	this.callbacks = {};
	this.callbacks["select"] = event.select; 
	this.callbacks["unSelect"] = event.unSelect;
	this.obj = event.obj;
}

Select.prototype.callBack = function(e) {
    var x = (e.layerX || e.offsetX);
    var y = (e.layerY || e.offsetY);
	
	var evt = {'x': x, 'y': y};
    var vector = this.layer.renderer.getFeatureIdFromEvent(evt);
	this.unSelect({'vector': vector, 'xy': evt, 'type': e.type});
	this.select({'vector': vector, 'xy': evt, 'type': e.type});
    CanvasSketch.stopEventBubble(e);
}

Select.prototype.select = function(e) {
	this.selectedVector = e.vector;
	this.callbacks["select"].call(this.obj, e);
}

Select.prototype.unSelect = function(e) {
	if(this.selectedVector == null || this.selectedVector == e.vector){
		return;
	}else{
		e.vector = this.selectedVector;
		this.callbacks["unSelect"].call(this.obj, e);
	}
}

Select.prototype.Events = [["mousedown", Select.prototype.callBack],["mousemove", Select.prototype.callBack]];
                       
Select.prototype.active = function () {
    for(var i = 0, len = this.Events.length; i < len; i++) {
        var type = this.Events[i][0];
        var listener = this.Events[i][1];
        listener = CanvasSketch.bindAsEventListener(listener, this);
        this.div.addEventListener(type, listener, true);        
    }
}                