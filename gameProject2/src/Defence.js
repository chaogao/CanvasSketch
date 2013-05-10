(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] 
        || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, 
            timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

(function() {
	window.Defence = {
		vesion: "1.0.0",		
		author: "doudougou",
	};
	
	var scriptName = "Defence.js";
	
	Defence.getScriptLocation = (function() {
		var r = new RegExp("(^|(.*?\\/))(" + scriptName + ")(\\?|$)"),
			s = document.getElementsByTagName('script'),
			src, m, l = "";
		for(var i=0, len=s.length; i<len; i++) {
			src = s[i].getAttribute('src');
			if(src) {
				var m = src.match(r);
				if(m) {
					l = m[1];
					break;
				}
			}
		}
		return (function() { return l; });
	})()
	
	var jsFile = [
		"Main.js",
		"GameInfo.js",
		"UserInfo.js",
		"Objects/Tile.js",
		"Objects/Enemy.js",
		"Objects/Tower.js",
		"Objects/Bullet.js",
		"Objects/Explode.js",
		"States/InitTitle.js",
		"States/Loader.js",
		"States/WaitForBegin.js",
		"States/NewGameLevel.js",
		"States/PlayLevel.js"
	];
	
	var jsTags = "";
	var host = Defence.getScriptLocation();
	for(var i = 0, len = jsFile.length; i < len; i++) {
		jsTags += "<script src='"+ host + jsFile[i] +"'></script>"
	}
	
	document.write(jsTags);
})();