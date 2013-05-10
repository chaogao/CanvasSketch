Defence.Bullet = function(tower, enemy, position, tileSize) {
	this.tower = tower;
	this.type = tower.type;
	this.enemy = enemy;
	this.position = position.clone();
	this.position.x += enemy.tileSize.w / 2;
	this.position.y -= enemy.tileSize.h / 2;
	this.tileSize = tileSize || new CanvasSketch.Size(tower.tileSize.w / 2, tower.tileSize.h / 2);

	this.attackForce = tower.attackForce;
	this.bulletImages = this.getbulletImages();
	this.image = this.getImage();
	this.updateAttribute();
	
	Img.apply(this,[this.position, this.image, this.tileSize]);
}

Defence.Bullet.prototype = new Img();

Defence.Bullet.prototype.updateAttribute = function(){
	var bulletAtt = Defence.Bullet.Types[this.type];
	this.speed = bulletAtt.speed;
	this.reduce = bulletAtt.reduce;
	this.reduceDelay = bulletAtt.reduceDelay;
	this.continuedAttack = bulletAtt.continuedAttack;
	this.continuedDelay = bulletAtt.continuedDelay;
}

Defence.Bullet.prototype.updatePos = function(bullets, sence, i){
	//type == 3 为持续伤害
	// if(this.continuedAttack && this.continuedAttack > 0) {
		// this.position.x = this.enemy.position.x;
		// this.position.y = this.enemy.position.y;
		// this.enemy.hpCount -= this.attackForce;
		// this.continuedAttack--;
		// if(this.continuedAttack <= 0 || this.enemy.hpCount < 0) {
			// 击中目标删除子弹		
			// sence.deleteVector(bullets[i]);
			// bullets.splice(i, 1);
			// return;
		// }		
	// } else {
		var distinationX = this.enemy.position.x + this.enemy.tileSize.w / 2 - this.tileSize.w / 2,
			distinationY = this.enemy.position.y - this.enemy.tileSize.h / 2 + this.tileSize.h / 2;
		var dx = distinationX - this.position.x, 
			dy = distinationY - this.position.y;
		var angle = Math.atan2(dy, dx);
		var speedX = Math.cos(angle) * this.speed;
		var speedY = Math.sin(angle) * this.speed;
		this.position.x += speedX;
		this.position.y += speedY;	
		var distance = Math.pow(distinationX - this.position.x, 2) + Math.pow(distinationY - this.position.y, 2);
		if(distance < this.speed * this.speed) {
			this.enemy.hpCount -= this.attackForce;
			if(this.reduce) {
				this.enemy.reduce = this.reduce;
				this.enemy.reduceDelay = this.reduceDelay;
			}
			if(this.continuedAttack) {
				this.enemy.continuedAttack = this.continuedAttack;
				this.enemy.continuedDelay = this.continuedDelay;
			}
			//击中目标删除子弹		
			sence.deleteVector(bullets[i]);
			bullets.splice(i, 1);
			return;
		}
	// }
}

Defence.Bullet.prototype.getbulletImages = function() {
	return Defence.Source[8];
}

Defence.Bullet.prototype.getImage = function (){
	var canvas = document.createElement("canvas");
	canvas.width = 100;
	canvas.height = 100;
	canvas.getContext("2d").drawImage(this.bulletImages, this.type * 100, 0, 100, 100, 0, 0, 100, 100);
	return canvas;
}

Defence.Bullet.Types = [
	{
		"radius": 1,
		"speed": 10
	},{
		"radius": 1,
		"reduce": -2,
		
		"reduceDelay": 100,
		"speed": 10
	},{
		"radius": 1,
		"speed": 10
	},{
		"radius": 1,
		"speed": 10,
		
		"continuedAttack": 0.2,
		"continuedDelay": 100
	}
]