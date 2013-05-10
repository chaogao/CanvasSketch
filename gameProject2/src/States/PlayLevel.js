Defence.PlayLevel = function(sence, main){
	this.sence = sence;
	this.main = main;
	this.enemys = [];
	this.bullets = [];
	this.explodes = [];
	this.attackBoundes = [];
	var gameInfo = this.main.gameInfo;
	this.enemyCreater = new Defence.EnemyCreater(gameInfo);
}


Defence.PlayLevel.prototype.run = function(){
	this.vectors = [];
	this.updateTempTower();
	this.updateEnemy();
	this.updateTower();
	this.updateBullet();
	this.updateExplodes();
	this.checkLevel();
	this.addVectors();
	this.drawSence();
	this.updateUserInfo();
}


Defence.PlayLevel.prototype.updateUserInfo = function() {
	this.main.userSence.reDraw();
	this.main.userSence.renderer.context.fillText(this.main.userInfo.money, 400, 20);
}

Defence.PlayLevel.prototype.addEnemy = function(enemy){
	this.enemys.push(enemy)
	this.vectors = this.vectors.concat(enemy);
}

Defence.PlayLevel.prototype.addBullets = function(bullets){
	this.bullets = this.bullets.concat(bullets);
	this.vectors = this.vectors.concat(bullets);
}

Defence.PlayLevel.prototype.addExplodes = function(explodes){
	this.explodes = this.explodes.concat(explodes);
	this.vectors = this.vectors.concat(explodes);
}

Defence.PlayLevel.prototype.addAttackBounds = function(attackBoundes) {
	this.attackBoundes = this.attackBoundes.concat(attackBoundes);
	this.vectors = this.vectors.concat(attackBoundes);
}

Defence.PlayLevel.prototype.addVectors = function() {
	if(this.vectors.length > 0) this.sence.addVectors(this.vectors);
}

Defence.PlayLevel.prototype.updateBullet = function() {
	for(var i = 0; i < this.bullets.length; i++) {
		var bullet = this.bullets[i].geometry;
		bullet.updatePos(this.bullets, this.sence, i);
	}
}

Defence.PlayLevel.prototype.updateExplodes = function() {
	for(var i = 0; i < this.explodes.length; i++) {
		var explode = this.explodes[i].geometry;
		explode.getCurrentImage(this.explodes, this.sence, i);
	}
}

Defence.PlayLevel.prototype.updateTower = function() {
	var bullets = [];
	var attackBoundes = [];
	var towers = this.main.gameInfo.towers;
	for(var i = 0, len = towers.length; i < len; i++) {
		var attackBounds;
		var tower = towers[i].geometry;		
		//找到要攻击的敌人们
		var enemys = tower.findEnemy(this.enemys);
		//获取攻击敌人的子弹
		if(enemys.length > 0) {
			var shotBullets = tower.shot(enemys);
			if(shotBullets) bullets = bullets.concat(shotBullets);
		}
		//获取塔的射程范围并显示(如果当前塔被选中)
		attackBounds = tower.getAttackBounds();
		if(attackBounds && !tower.boundsDisplay) {
			attackBoundes.push(attackBounds);
			tower.boundsDisplay = true;
		}
	}
	if(bullets.length > 0) this.addBullets(bullets);
	if(attackBoundes.length > 0) this.addAttackBounds(attackBoundes);
}

Defence.PlayLevel.prototype.updateEnemy = function(){
	var enemy = this.enemyCreater.create();
	if(enemy) this.addEnemy(enemy);

	var enemys = this.enemys;
	var explodes = [];
	for(var i = 0; i < enemys.length; i++) {
		var enemy = enemys[i][0].geometry;
		var hp = enemys[i][1].geometry;
		//更新敌军和血条		
		this.updateHpPosition(enemy, hp);
		//判断是否死亡和是否有死亡动画
		var explode = enemy.updatePosition(enemys, this.sence, i, this.main.userInfo);
		if(explode) explodes.push(new Vector(explode));
	}
	if(explodes.length > 0) this.addExplodes(explodes);
}

Defence.PlayLevel.prototype.updateHpPosition = function(enemy, hp) {
	var x = enemy.position.x, y = enemy.position.y;
	var perX = enemy.hpPerX;
	
	var points = [new Point(x, y + 4), new Point(x + perX * enemy.hpCount, y + 4), 
		new Point(x + perX * enemy.hpCount, y + 2), new Point(x, y + 2)];
	hp.points = points;
	hp.updateBounds();
}

Defence.PlayLevel.prototype.updateTempTower = function() {
	if(this.main.gameInfo.tempTower && !this.main.gameInfo.tempTower.geometry.boundsDisplay) {
		this.main.gameInfo.tempTower.geometry.boundsDisplay = true;
		this.sence.addVectors([this.main.gameInfo.tempTower, this.main.gameInfo.tempTower.geometry.attackBoundsGeo]);
	}
}

Defence.PlayLevel.prototype.checkLevel = function() {
	if(this.enemys.length <= 0 && this.explodes.length <= 0 && this.main.gameInfo.wave < 0) {
		this.main.gameInfo.level++;
		this.changeState();
	}
}

Defence.PlayLevel.prototype.drawSence = function(){
	this.sence.reDraw();
}

Defence.PlayLevel.prototype.changeState = function(){
	this.main.state = new Defence.NewGameLevel(this.sence, this.main);
}

Defence.EnemyCreater = function(gameInfo){
	this.delay = Defence.Const.EnemyBaseDelay - gameInfo.level;
	this.start = gameInfo.enemyStart;
	this.size = gameInfo.tileSize;	
	
	this.types = gameInfo.getEnemys();
	this.gameInfo = gameInfo;
	this.delayCount = 0;
}

//产生并获取敌军。
Defence.EnemyCreater.prototype.create = function(){
	this.delayCount++;
	if(this.delayCount >= this.delay && this.types.length > 0) {
		this.delayCount = 0;
		var type = this.types.shift(), row = this.start[0].row, col = this.start[0].col;
		var position = new CanvasSketch.Position((col) * this.size.w, (row+1) * this.size.h);
		var enemy = new Defence.Enemy(type, row, col, position, this.size, this.gameInfo);
		var hp = this.createHp(enemy);
		return [new Vector(enemy), hp];
	} else if(this.types.length <= 0) {
		this.delayCount = -200;
		this.types = this.gameInfo.getEnemys();
	}
}

Defence.EnemyCreater.prototype.createHp = function(enemy) {
	var x = enemy.position.x, y = enemy.position.y;
	var points = [new Point(x, y + 4), new Point(x + enemy.tileSize.w, y + 4), 
		new Point(x + enemy.tileSize.w, y + 2), new Point(x, y + 2)];
	var hp = new LinerRing(points);
	return new Vector(hp, Defence.EnemyCreater.HPStype);
}

Defence.EnemyCreater.HPStype = {fillColor:"#ff1111", fill:true, stroke:false, fillOpacity:0.4, strokeOpacity:1}