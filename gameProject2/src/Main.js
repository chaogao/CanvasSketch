Defence.Main = function(div){
	this.mapSence = this.getSence(div);
	this.sence = this.getSence(div);
	this.userSence = this.getSence(div, false);
	this.state = new Defence.InitTitle(this.sence, this);
	this.loop();
}

//��ȡ����
Defence.Main.prototype.getSence = function(div, controls){
	return new Layer(div, controls);
}

//��ʼ��ѭ��
Defence.Main.prototype.loop = function(){
	this.state.run();
	requestAnimationFrame(this.bind(this.loop, this));
}

Defence.Main.prototype.bind = function(fun, obj){
	return function(){
		return fun.apply(obj);
	}
}