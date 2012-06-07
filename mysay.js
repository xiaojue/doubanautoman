var http = require('http'),
qs = require('querystring'),
OAuth = require('./oauth').OAuth;

var key = '0929824d46a545451b7c86e7d3efcfcf',
api_key_secret = '9fbeb12856c07858';

function say(config) {
	this.config = config;
}

say.prototype.say = function(msg, callback) {
	var self = this;
	var data = {
		method: "POST",
		action: 'http://api.douban.com/miniblog/saying',
		parameters: {
			oauth_consumer_key: key,
			oauth_token: self.config.oauth_token,
			oauth_signature_method: 'HMAC-SHA1',
			oauth_signature: '',
			oauth_nonce: ''
		}
	};
	OAuth.setTimestampAndNonce(data);
	OAuth.SignatureMethod.sign(data, {
		consumerSecret: api_key_secret,
		tokenSecret: self.config.oauth_token_secret
	});

	var oauth_header = "OAuth realm=\"\", oauth_consumer_key=";
	oauth_header += data.parameters.oauth_consumer_key + ', oauth_nonce=';
	oauth_header += data.parameters.oauth_nonce + ', oauth_timestamp=';
	oauth_header += data.parameters.oauth_timestamp + ', oauth_signature_method=HMAC-SHA1, oauth_signature=';
	oauth_header += data.parameters.oauth_signature + ', oauth_token=';
	oauth_header += data.parameters.oauth_token;

	var request_body = "<entry xmlns:ns0=\"http://www.w3.org/2005/Atom\" xmlns:db=\"http://www.douban.com/xmlns/\">";
	request_body += "<content>"+msg+"</content>";
	request_body += "</entry>";

	var post_req = http.request({
		host: 'api.douban.com',
		port: 80,
		path: '/miniblog/saying',
		method: 'POST',
		headers: {
			'Content-Type': 'application/atom+xml',
            'Content-Length':Buffer.byteLength(request_body,'utf8'),
			'Authorization': oauth_header
		}
	},
	function(res) {
		res.setEncoding('utf8');
		var ret = '';
		res.on('data', function(str) {
			ret += str;
		});
		res.on('end', function() {
			callback(ret);
		});
	});

	post_req.on('error', callback);

	post_req.write(request_body);
	post_req.end();
};

exports.say = say;

