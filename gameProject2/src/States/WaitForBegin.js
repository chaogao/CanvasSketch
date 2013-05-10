Defence.WaitForBegin = function(sence, main) {
	this.sence = sence;
	this.main = main;
	this.listenEvents();
	//建立游戏和玩家信息类,并监听事件
	this.main.gameInfo = new Defence.GameInfo(sence.size);
	this.main.userInfo = new Defence.UserInfo(this.main.gameInfo, this.main);
	this.main.userSence.addSelectControl(this.main.userInfo.events);
	this.main.sence.addSelectControl(this.main.userInfo.senceEvents);
}

Defence.WaitForBegin.prototype.listenEvents = function(){
	var waitforbegin = this;
	function keydown(event){
		if(event.keyCode == 32){
			$(document).unbind("keydown", keydown);
			waitforbegin.changeState();
		}
		//其他逻辑
	}
	$(document).bind("keydown", keydown);
}

Defence.WaitForBegin.prototype.run = function(){
	this.drawSence();
}

Defence.WaitForBegin.prototype.drawSence = function(){
	this.sence.renderer.context.clearRect(0, 0, 400, 400);
	this.sence.renderer.context.fillText(Defence.gameInfo.title, 200, 100);
	this.sence.renderer.context.fillText(Defence.gameInfo.author, 200, 200);
	this.sence.renderer.context.fillText("单击空格键继续", 200, 300);
}

Defence.WaitForBegin.prototype.changeState = function(){
	this.sence.renderer.context.clearRect(0, 0, 400, 400);
	this.main.state = new Defence.NewGameLevel(this.sence, this.main);
}
