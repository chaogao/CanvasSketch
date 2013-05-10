Defence.Tower = function(type, row, col, position, tileSize){
	this.type = type;
	this.row = row;
	this.col = col;
	this.position = position;
	this.tileSize = tileSize;
	this.delayCount = 0;
	this.level = 0;
	
	this.updateAttribute();
	
	this.towerImages = this.getTowersImage();
	this.image = this.getImage();
	Img.apply(this,[this.position, this.image, this.tileSize]);
}

Defence.Tower.prototype = new Img();

//重置tower的属性。
Defence.Tower.prototype.updateAttribute = function(){
	var towerAtt = Defence.Tower.Type[this.type];
	this.delay = towerAtt.delay;
	this.attackForce = towerAtt.attackForce;
	this.attBounds = towerAtt.attBounds;
	this.attackCount = towerAtt.attackCount;
	this.groupAttack = !!towerAtt.groupAttack;
	this.reduce = !!towerAtt.reduce;
	this.cost = towerAtt.cost;
	this.levelUpCount = towerAtt.levelUpCount;
	
	this.selected = false;
	this.boundsDisplay = false;
	this.enable = false;
}

Defence.Tower.prototype.levelUp = function() {
	var towerAtt = Defence.Tower.Type[this.type];
	this.level++;
	this.attackForce += towerAtt.attackForce * 0.2;
	if(this.levelUpCount && (this.level == 2 || this.level == 4)) this.attackCount++;
	this.delay -= towerAtt.delay * 0.1;
	
	var canvas = document.createElement("canvas");
	canvas.width = 100;
	canvas.height = 100;
	canvas.getContext("2d").drawImage(this.towerImages, this.type * 100, this.level * 100, 100, 100, 0, 0, 100, 100);
	this.image = canvas;
}

Defence.Tower.prototype.getTowersImage = function (){
	return Defence.Source[6];
}

Defence.Tower.prototype.getImage = function (){
	var canvas = document.createElement("canvas");
	canvas.width = 100;
	canvas.height = 100;
	canvas.getContext("2d").drawImage(this.towerImages, this.type * 100, this.level * 100, 100, 100, 0, 0, 100, 100);
	return canvas;
}

//发射子弹。
Defence.Tower.prototype.shot = function(enemys){
	this.delayCount++;
	if(this.delayCount >= this.delay) {
		var bullets = [];
		this.delayCount = 0;
		for(var i = 0, len = enemys.length; i < len; i++) {
			var enemy = enemys[i];
			var bullet = new Defence.Bullet(this, enemy, this.position);
			bullets.push(new Vector(bullet));
		}
		return bullets;
	}
}

//找到可以攻击的敌人
Defence.Tower.prototype.findEnemy = function(enemys) {
	var row = this.row, col = this.col, bounds = this.attBounds;
	var radius = bounds * this.tileSize.w + this.tileSize.w / 2;
	//找到要攻击的敌人们
	var attackEnemys = [];
	for(var i = 0, len = enemys.length; i < len; i++) {
		var enemy = enemys[i][0].geometry;
		var rowEnemys = enemy.row;
		var colEnemys = enemy.col;
		//如果在攻击范围内
		if((enemy.position.x - this.position.x)*(enemy.position.x - this.position.x) + 
			(enemy.position.y - this.position.y)*(enemy.position.y - this.position.y) < radius*radius) {
			//如果是群体攻击则返回所以enmey
			if(this.groupAttack)  {
				if(this.reduce){
					if(enemy.reduce) {
						continue;
					}
					else {
						attackEnemys.push(enemy);
					}
				} else {
					attackEnemys.push(enemy);
				}
			} else {
				//如果是减速塔则采用特殊算法(攻击未被减速的敌人)
				if(this.reduce){
					if(enemy.reduce) {
						continue;
					}
					else {
						attackEnemys.push(enemy);
						if(attackEnemys.length >= this.attackCount) break;
					}
				} else {
					attackEnemys.push(enemy);
					if(attackEnemys.length >= this.attackCount) break;
				}
			}
		}
	}
	return attackEnemys;
}

//返回攻击范围的geo。
Defence.Tower.prototype.getAttackBounds = function() {
	if(this.selected && !this.boundsDisplay) {
		var radius = this.attBounds * this.tileSize.w;
		this.attackBoundsGeo = new Vector(new Circle(this.position.x + this.tileSize.w / 2, this.position.y - this.tileSize.h / 2, radius),
			Defence.Tower.AttackBoundsStype);	
		return this.attackBoundsGeo;
	}
}

//更新攻击范围的位置
Defence.Tower.prototype.updateAttackBounds = function() {
	this.attackBoundsGeo.geometry.updatePostion(this.position.x + this.tileSize.w / 2, this.position.y - this.tileSize.h / 2);
}

//通过当前的row和col设定此时塔是否可以放置
Defence.Tower.prototype.updateStyle = function(gameInfo) {
	var towerMap = gameInfo.towerMap, row = this.row, col = this.col;
	var map = gameInfo.maps;
	var index = row * gameInfo.MaxCol + col;
	if(col < 0 || col > (gameInfo.MaxCol - 1) || row < 0 || row > (gameInfo.MaxRow - 1)) return "red";
	if(map[index] == "1") return "red";
	if(towerMap[row][col] > 0) return "red";
	
}

//前四个为毕设属性。
Defence.Tower.Type = [
	{
		"delay" : 20,
		"attackForce": 15,
		"attBounds": 1.5,
		"attackCount": 1,
		"cost": 30,
		
		"levelUpCount": true
	},{
		"delay" : 60,
		"attackForce": 1,
		"attBounds": 2,
		"attackCount": 1,
		"cost": 30,
		
		"reduce": true,
		"levelUpCount": true
	},{
		"delay" : 90,
		"attackForce": 20,
		"attBounds": 2,
		"attackCount": 2,
		"cost": 120
	},{
		"delay" : 90,
		"attackForce": 10,
		"attBounds": 1,
		"attackCount": 2,
		"cost": 60,
		
		"levelUpCount": true
	}
]

Defence.Tower.AttackBoundsStype = {fillColor:"#13a500", fill:true, stroke:false, fillOpacity:0.2, strokeOpacity:1}
Defence.Tower.AttackBoundsRedStype = {fillColor:"#db0000", fill:true, stroke:false, fillOpacity:0.2, strokeOpacity:1}