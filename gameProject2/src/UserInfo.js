Defence.UserInfo = function(info, main) {
	this.main = main;
	this.gameInfo = info;
	this.width = info.size.w;
	this.height = (17 / 120) * this.width;
	this.tileSize = new CanvasSketch.Size(this.width, this.height);
	this.position = new Point(0, this.height);
	this.getImage();
	this.list = [];
	this.towerList = [];
	this.magicList = [];
	this.updateButtonList = [];
	this.display = false;
	this.events = {"select": this.selectTower, "unSelect": this.unSelectTower, "obj": this};
	this.senceEvents = {"select": this.senceSelectTower, "unSelect": this.senceUnSelectTower, "obj": this};
	this.selectedType = null;
	this.selectedTower = null;
	this.money = 1000;
}


Defence.UserInfo.prototype.getImage = function() {
	this.image = Defence.Source[5];
	this.towerImages = Defence.Source[6];
	this.towerSelectedImages = Defence.Source[7];
	this.updateButtonImages = Defence.Source[9];
}

//返回用户信息的vector数组。
Defence.UserInfo.prototype.getList = function() {
	var list = [];
	var towerList = [];
	var updateButtonList = [];
	this.towerTypes = this.getTowerTypes();
	
	//背景图片信息
	this.background =new Vector(new Img(this.position, this.image, this.tileSize));
	//防御塔信息
	var towerListWidth = (42 / 120) * this.width;
	var towerInterval = 0;
	var towerStartX = (8 / 120) * this.width;
	var towerWidth = (towerListWidth - towerInterval * 3) / 4;
	var towerSize = new CanvasSketch.Size(towerWidth, towerWidth);
	for(var i = 0, len = this.towerTypes.length; i < len; i++) {
		var canvas = document.createElement("canvas");
		canvas.width = 100;
		canvas.height = 100;
		canvas.getContext("2d").drawImage(this.towerImages, this.towerTypes[i] * 100, 0, 100, 100, 0, 0, 100, 100);
		var pos = new Point(towerStartX + i * towerInterval + i * towerWidth, this.height / 6 * 5);
		var tower = new Vector(new Img(pos, canvas, towerSize));
		tower.type = this.towerTypes[i];
		towerList.push(tower);
	}
	this.towerList = towerList;
	//升级信息Button
	var buttonWidth = (45 / 1200) * this.width;
	var buttonStartX = (558 / 1200) * this.width;
	var buttonStartY = [((170 - 32) / 170) * this.height, ((170 - 88) / 170) * this.height];
	var buttonSize = new CanvasSketch.Size(buttonWidth, buttonWidth);
	for(var i = 0; i < 2; i++) {
		var canvas = document.createElement("canvas");
		canvas.width = 100;
		canvas.height = 100;
		canvas.getContext("2d").drawImage(this.updateButtonImages, i * 100, 0, 100, 100, 0, 0, 100, 100);
		var pos = new Point(buttonStartX, buttonStartY[i]);
		var button = new Vector(new Img(pos, canvas, buttonSize));
		updateButtonList.push(button);
	}
	this.updateButtonList = updateButtonList;
	
	
	//添加到list当中
	list.push(this.background);
	list = list.concat(this.towerList);
	list = list.concat(this.updateButtonList);
	this.list = list;
	return this.list;
}

Defence.UserInfo.prototype.getTowerTypes = function() {
	if(this.gameInfo.level == 1) return [0, 1, 2, 3];
	if(this.gameInfo.level == 2) return [0, 1, 2, 3];

}

Defence.UserInfo.prototype.changeButtonImage = function(offset) {
	var i = 0;
	if(this.selectedTower && this.selectedTower.geometry.level == 4) {i = 1};
	for(i; i < 2; i++) {
		var canvas = document.createElement("canvas");
		canvas.width = 100;
		canvas.height = 100;
		canvas.getContext("2d").drawImage(this.updateButtonImages, (i + offset) * 100, 0, 100, 100, 0, 0, 100, 100);
		this.updateButtonList[i].geometry.image = canvas;
	}

}

//选中tower的回调函数
Defence.UserInfo.prototype.selectTower = function(e){
	if(e.vector != this.background) {
		//换图片为选择状态
		if(e.type == "mousemove") {
			if(e.vector && this.updateButtonList[0] != e.vector && this.updateButtonList[1] != e.vector) {
				var tower = e.vector;
				var type = tower.type;
				var canvas = document.createElement("canvas");
				canvas.width = 100;
				canvas.height = 100;
				canvas.getContext("2d").drawImage(this.towerSelectedImages, type * 100, 0, 100, 100, 0, 0, 100, 100);
				tower.geometry.image = canvas;
				this.selectedType = type;
			}
			
			if(this.gameInfo.tempTower) {
				//获取坐标
				var info = this.gameInfo;
				var point = this.main.sence.getPositionFromPx(e.xy);
				
				var row = Math.floor(point.y / info.tileSize.w);
				var col = Math.floor(point.x / info.tileSize.h);
				var tower = this.gameInfo.tempTower.geometry;
				tower.row = row;
				tower.col = col;
				tower.position.x = col * info.tileSize.w;
				tower.position.y = (row + 1) * info.tileSize.h;
				tower.updateAttackBounds();
				if(tower.updateStyle(info) == "red"){
					tower.enable = false;
					this.gameInfo.tempTower.geometry.attackBoundsGeo.style = Defence.Tower.AttackBoundsRedStype;
				}else {
					tower.enable = true;
					this.gameInfo.tempTower.geometry.attackBoundsGeo.style = Defence.Tower.AttackBoundsStype;
				}
			}
		}
		
		if(e.type == "mousedown") {
			if(!this.gameInfo.tempTower && this.selectedType != null) {
				//产生一个tempTower用于建造
				//获取坐标
				var info = this.gameInfo;
				var point = this.main.sence.getPositionFromPx(e.xy);
				var row = Math.floor(point.y / info.tileSize.w);
				var col = Math.floor(point.x / info.tileSize.h);
				var pos = new Point(col * info.tileSize.w, (row + 1) * info.tileSize.h);
				var tower = new Vector(new Defence.Tower(this.selectedType, row, col, pos, info.tileSize));
				tower.geometry.selected = true;
				tower.geometry.getAttackBounds();
				if(this.money - tower.geometry.cost > 0) {this.gameInfo.tempTower = tower;}
			}else if(this.gameInfo.tempTower && this.gameInfo.tempTower.geometry.enable) {
				//再次点击时候就确实建造这个tower
				this.main.sence.deleteVector(this.gameInfo.tempTower.geometry.attackBoundsGeo);
				var tempTower = this.gameInfo.tempTower.geometry;
				tempTower.selected = false;
				tempTower.boundsDisplay = false;
				this.main.gameInfo.towers.push(this.gameInfo.tempTower);
				this.main.gameInfo.towerMap[tempTower.row][tempTower.col] += 1;
				this.gameInfo.tempTower = null;
				this.money -= tempTower.cost;
			} else if(this.gameInfo.tempTower && !this.gameInfo.tempTower.geometry.enable) {
				//如果此时地形不可用则删除
				this.main.sence.deleteVector(this.gameInfo.tempTower.geometry.attackBoundsGeo);
				this.main.sence.deleteVector(this.gameInfo.tempTower);
				this.gameInfo.tempTower = null;
			}
			
			//升级tower
			if(this.selectedTower && (e.vector == this.updateButtonList[0])) {
				var tower = this.selectedTower.geometry;
				if(tower.level < 4 && (this.money - tower.cost > 0)) {
					tower.levelUp();
					this.money -= tower.cost;
				}
			}
			
			//删除tower
			if(this.selectedTower && (e.vector == this.updateButtonList[1])) {
				var tower = this.selectedTower.geometry;
				this.main.sence.deleteVector(this.selectedTower);
				this.main.sence.deleteVector(this.selectedTower.geometry.attackBoundsGeo);
				var towers = this.main.gameInfo.towers;
				for(var i = 0, len = towers.length; i < len; i++) {
					if(towers[i] == this.selectedTower) {
						towers.splice(i, 1);
						break;
					}
				}
				this.main.gameInfo.towerMap[tower.row][tower.col] -= 1;
			}
		}
	}
}

//取消选中tower的回调函数
Defence.UserInfo.prototype.unSelectTower = function(e) {
	if(e.vector != this.background && this.updateButtonList[0] != e.vector && this.updateButtonList[1] != e.vector) {
		//换图片为选择状态
		if(e.type == "mousemove") {
			var tower = e.vector;
			var type = tower.type;
			var canvas = document.createElement("canvas");
			canvas.width = 100;
			canvas.height = 100;
			canvas.getContext("2d").drawImage(this.towerImages, type * 100, 0, 100, 100, 0, 0, 100, 100);
			tower.geometry.image = canvas;
			this.selectedType = null;
		}
	}
}

//选中tower的回调函数
Defence.UserInfo.prototype.senceSelectTower = function(e){
	if(e.type == "mousedown") {
		if(this.selectedTower && e.vector!= this.selectedTower) {
			var tempTower = this.selectedTower.geometry;
			tempTower.selected = false;
			tempTower.boundsDisplay = false;
			this.main.sence.deleteVector(tempTower.attackBoundsGeo);
			this.selectedTower = null;
			this.changeButtonImage(0);
		}else if(e.vector && e.vector.geometry instanceof Defence.Tower) {
			e.vector.geometry.selected = true;
			this.selectedTower = e.vector;
			this.changeButtonImage(2);
		}
	}
}

//取消选中tower的回调函数
Defence.UserInfo.prototype.senceUnSelectTower = function(e) {
}

