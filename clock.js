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
			for (var i = 0; i < Hours; i++) {
				msg.push(timeTxt);
			}
			msg = msg.join(',');
			mysay.say(msg, function(ret) {
				console.log(ret);
			});
		}
	},
	1000 * 5);
};

