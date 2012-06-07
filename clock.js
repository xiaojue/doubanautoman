var say = require('./mysay').say;

exports.start = function(accessObject) {
	var mysay = new say(accessObject);
	setInterval(function() {
		var MyDate = new Date(),
		Minutes = MyDate.getMinutes(),
		Hours = MyDate.getHours(),
		timeTxt = '啪',
		msg = [];
		if (Minutes === 0) {
            Hours = Hours < 12 ? Hours : Hours - 12;
			for (var i = 0; i < Hours; i++) {
				msg.push(timeTxt);
			}
			msg = msg.join('! ');
            var sometxt = ['咳咳~','好累噢~','酸了- -||','疼！','无聊…','想爆大笨钟的菊~','谁来陪陪我'];
            msg = msg +'! '+ sometxt[Math.floor(Math.random()*sometxt.length)];
			mysay.say(msg, function(ret) {
				//console.log(ret);
			});
		}
	},
	1000 * 60);
};

