Defence.gameInfo = {"title": "守卫小屋", "ver": "1.0.0", "author": "doudougou"};

Defence.InitTitle = function(sence, main, config){
	this.sence = sence;
	this.main = main;
	//替换游戏信息
	if(config) {
	
	}
}

Defence.InitTitle.prototype.run = function(){
	this.drawSence();
	this.changeState();
}

Defence.InitTitle.prototype.drawSence = function(){
	this.sence.renderer.context.clearRect(0, 0, 400, 400);
	this.sence.renderer.context.fillText(Defence.gameInfo.title, 200, 100);
	this.sence.renderer.context.fillText(Defence.gameInfo.author, 200, 200);
}

Defence.InitTitle.prototype.changeState = function(){
	this.main.state =new Defence.Loader(this.sence, this.main);
}