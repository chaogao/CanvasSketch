Defence.NewGameLevel = function(sence, main){
	this.sence = sence;
	this.main = main;
	this.updateGameInfo();
}

//清除所有信息，并增加当前level的信息。
Defence.NewGameLevel.prototype.updateGameInfo = function(){
	this.main.gameInfo.reset();
	this.sence.clearVector();
	this.main.userSence.clearVector();
	this.addObjects();
}

Defence.NewGameLevel.prototype.addObjects = function(){
	var vectors = [];
	var gameInfo = this.main.gameInfo;
	var userInfo = this.main.userInfo;
	var titles = gameInfo.titles;
	
	vectors = vectors.concat(titles);
	this.main.mapSence.addVectors(vectors);
	this.main.userSence.addVectors(userInfo.getList());
	this.beginTime = +new Date();
}

Defence.NewGameLevel.prototype.run = function(){
	if((+new Date()) - this.beginTime > 4000) {
		this.changeState();
	} else {
		this.drawSence();
	}
}

Defence.NewGameLevel.prototype.drawSence = function(){
	this.updateTempTower();
	this.sence.reDraw();
	this.sence.renderer.context.fillText(Math.floor((4000 - (+new Date() - this.beginTime))/1000), 200, 200);
	this.updateUserInfo();
}

Defence.NewGameLevel.prototype.updateUserInfo = function() {
	this.main.userSence.reDraw();
	this.main.userSence.renderer.context.fillText(this.main.userInfo.money, 400, 20);
}

Defence.NewGameLevel.prototype.updateTempTower = function() {
	if(this.main.gameInfo.tempTower && !this.main.gameInfo.tempTower.geometry.boundsDisplay) {
		this.main.gameInfo.tempTower.geometry.boundsDisplay = true;
		this.sence.addVectors([this.main.gameInfo.tempTower, this.main.gameInfo.tempTower.geometry.attackBoundsGeo]);
	}
}

Defence.NewGameLevel.prototype.changeState = function(){
	this.main.state = new Defence.PlayLevel(this.sence, this.main);
}