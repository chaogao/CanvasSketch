Defence.Tile = function (type, row, col, position, tileSize){
	this.type = type;
	this.row = row;
	this.col = col;
	this.position = position;
	this.tileSize = tileSize;
	var image = this.getImage();
	Img.apply(this,[position, image, tileSize]);
}

Defence.Tile.prototype = new Img();

Defence.Tile.prototype.getImage = function (){
	switch (this.type) {
		case "0": return Defence.Source[0];
		case "1": return Defence.Source[1];
	}
}