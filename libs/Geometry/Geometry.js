//CLASS:基本几何类型。
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
}