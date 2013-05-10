Defence.Enemy = function(type, row, col, position, tileSize, gameInfo){
	this.type = type;
	this.row = row;
	this.col = col;
	this.position = position;
	this.distination = position.clone();
	this.tileSize = tileSize;
	this.gameInfo = gameInfo;
	this.getAttribute();
	this.imageSource = this.getImage();	
	this.imageTiles = [[],[],[],[]];
	this.getCurrentImage();

	Img.apply(this,[this.position, this.image, this.tileSize]);
}

Defence.Enemy.prototype = new Img();

Defence.Enemy.prototype.getImage = function (){
	switch (this.type) {
		case "0": return Defence.Source[2];
		case "1": return Defence.Source[10];
	}
}

Defence.Enemy.prototype.getExplodeImage = function() {
	switch (this.type) {
		case "0": return Defence.Source[3];
		case "1": return Defence.Source[3];
	}
}

//获得当前敌人的一些信息
Defence.Enemy.prototype.getAttribute = function (){
	var type = Defence.Enemy.Types[parseInt(this.type)];
	this.imageCount = type.imageCount;
	this.currentImageCount = 0;
	this.speed = type.speed;
	this.hp = this.gameInfo.level * type.hp + Math.floor((10 - this.gameInfo.wave) / 5 * type.hp);
	this.money = type.money;
	this.hpCount = this.hp;
	this.hpPerX = this.tileSize.w / this.hp;
	this.dx = 0;
	this.dy = 0;
	this.direction = null;
	this.reduce = null;
	this.reduceDelay = 0;
	this.continuedAttack = null;
	this.continuedDelay = 0;
}

Defence.Enemy.prototype.getCurrentImage = function(){
	var row = 0;
	if(this.reduce) {row = 2};
	if(this.continuedAttack) {row = 1};
	if(this.reduce && this.continuedAttack) {
		row = 3
	};
	if(!this.imageTiles[row][Math.floor(this.currentImageCount)]) {
		var img = document.createElement("canvas");
		img.width = 100;
		img.height = 100;
		img.getContext("2d").drawImage(this.imageSource, Math.floor(this.currentImageCount) * 100, row * 100, 100, 100, 0, 0, 100, 100);
		this.imageTiles[row][Math.floor(this.currentImageCount)] = img;
	}		
	this.image = this.imageTiles[row][Math.floor(this.currentImageCount)];
	this.currentImageCount +=0.2;
	if(this.currentImageCount >= this.imageCount) this.currentImageCount = 0;
}

//更新敌人的位置并判断是否删除。
Defence.Enemy.prototype.updatePosition = function(enemys, sence, index, userInfo){
	var speed = this.speed, dx = this.dx, dy = this.dy;
	var enemy = this;
	
	//更新敌军图片
	this.getCurrentImage();
	
	//敌军死亡
	if(enemy.hpCount < 0) {
		sence.deleteVector(enemys[index][0]);
		sence.deleteVector(enemys[index][1]);
		enemys.splice(index, 1);
		userInfo.money += this.money;
		//敌军死亡动画
		return 	new Defence.Explode(this.getExplodeImage(), this.imageCount, this.position.clone(), this.tileSize);
	}
	
	//更新敌军位置
	if(dx!=0 || dy!=0) {
		//减速效果
		if(enemy.reduce && enemy.reduceDelay > 0) {
			var sp = (speed + enemy.reduce) > 0 ? (speed + enemy.reduce): 0;
			enemy.position.x += sp * dx;
			enemy.position.y += sp * dy;
			enemy.reduceDelay--;
			if (enemy.reduceDelay == 0) enemy.reduce = null;
		} else {
			enemy.position.x += speed * dx;
			enemy.position.y += speed * dy;	
		}
		//烧伤效果
		if(enemy.continuedAttack && enemy.continuedDelay > 0) {
			enemy.hpCount -= enemy.continuedAttack;
			enemy.continuedDelay--;
			if (enemy.continuedDelay == 0) enemy.continuedAttack = null;
		}
		if(Math.abs(enemy.position.x - enemy.distination.x) < speed && 
		Math.abs(enemy.position.y - enemy.distination.y) < speed){
			enemy.position.x = enemy.distination.x;
			enemy.position.y = enemy.distination.y;
			if(this.checkEnemyEnd(enemy)) {
				sence.deleteVector(enemys[index][0]);
				sence.deleteVector(enemys[index][1]);
				enemys.splice(index, 1);
			}else {
				this.calcDistination(enemy);
			}
		}
	}else{
		this.calcDistination(enemy);
	}
}

Defence.Enemy.prototype.checkEnemyEnd = function(enemy){
	var end = this.gameInfo.enemyEnd;
	if(enemy.col == end[0].col && enemy.row == end[0].row) 
		return true;
	else 
		return false;
}

Defence.Enemy.prototype.calcDistination = function(enemy){
	var dir = enemy.direction, size = enemy.tileSize;
	var gameInfo = this.gameInfo;
	var directionArray = this.getDirectionArray(enemy);
	if(!dir) {
		for(var i = 0; i < 3; i++) {
			if(directionArray[i] == 10) {
				dir = i;
				break;
			}
		}
	}
	dir = this.calcDirection(dir, directionArray);	
	enemy.direction = dir;
	if(dir == 0){
		enemy.row = (enemy.row + 1) > (gameInfo.MaxRow - 1) ? gameInfo.MaxRow : enemy.row + 1;
		enemy.dx = 0;
		enemy.dy = 1;
		enemy.distination.x += 0;
		enemy.distination.y += size.h;
	}
	if(dir == 1){
		enemy.col = (enemy.col + 1) > (gameInfo.MaxCol + 1) ? gameInfo.MaxCol : enemy.col + 1;
		enemy.dx = 1;
		enemy.dy = 0;
		enemy.distination.x += size.w;
		enemy.distination.y += 0;
	}
	if(dir == 2){
		enemy.row = (enemy.row - 1) < 0 ? 0 : enemy.row - 1;
		enemy.dx = 0;
		enemy.dy = -1;
		enemy.distination.x += 0;
		enemy.distination.y -= size.h;
	}
	if(dir == 3){
		enemy.col = (enemy.col - 1) < 0 ? 0 : enemy.col - 1;
		enemy.dx = -1;
		enemy.dy = 0;
		enemy.distination.x -= size.w;
		enemy.distination.y += 0;
	}
}

Defence.Enemy.prototype.getDirectionArray = function(enemy){
	var gameInfo = this.gameInfo, maps = gameInfo.maps, direction = [];
	var index = enemy.row * gameInfo.MaxCol + enemy.col;
	//上
	if(!maps[index + gameInfo.MaxCol] || maps[index + gameInfo.MaxCol] == "0"){
		direction[0] = 0;
	}else {
		direction[0] = 10;
	}
	//右
	if(!maps[index + 1] || maps[index + 1] == "0" || (Math.floor((index + 1)/gameInfo.MaxCol) != enemy.row)){
		direction[1] = 0;
	}else {
		direction[1] = 10;
	}
	//下
	if(!maps[index - gameInfo.MaxCol] || maps[index - gameInfo.MaxCol] == "0"){
		direction[2] = 0;
	}else {
		direction[2] = 10;
	}
	//左
	if(!maps[index - 1] || maps[index - 1] == "0" || (Math.floor((index - 1)/gameInfo.MaxCol) != enemy.row)){
		direction[3] = 0;
	}else {
		direction[3] = 10;
	}
	return direction;
}

Defence.Enemy.prototype.calcDirection = function(dir, dirArray){
	if(dir == 0){
		dirArray[0] += 2;
		dirArray[1] += 1;
		dirArray[2] += 0;
		dirArray[3] += 1;
	}
	if(dir == 1){
		dirArray[0] += 1;
		dirArray[1] += 2;
		dirArray[2] += 1;
		dirArray[3] += 0;
	}
	if(dir == 2){
		dirArray[0] += 0;
		dirArray[1] += 1;
		dirArray[2] += 2;
		dirArray[3] += 1;
	}
	if(dir == 3){
		dirArray[0] += 1;
		dirArray[1] += 0;
		dirArray[2] += 1;
		dirArray[3] += 2;
	}
	var dirIndex = 0, maxValue = 0;
	for (var i = 0; i < 4; i++) {
		if(dirArray[i] > maxValue){
			dirIndex = i;
			maxValue = dirArray[i];
		}
	}
	return dirIndex;
}

Defence.Enemy.Types = [
	{
		"imageCount": 8,
		"speed": 2,
		"hp": 50,
		"money": 2
	},
	{
		"imageCount": 8,
		"speed": 4,
		"hp": 80,
		"money": 2
	}
]