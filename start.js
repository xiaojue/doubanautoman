// == start.js == 
//
// OAuth for nodejs
var http = require('http'),
url = require('url'),
OAuth = require('./oauth').OAuth,
fs = require('fs'),
qs = require('querystring');

var clock = require('./clock');

var host = 'www.douban.com';
var hosts = '58.64.180.78';

var OAuthList = {
	request: '/service/auth/request_token',
	authorize: '/service/auth/authorize',
	access: '/service/auth/access_token'
};

var myappStart = false;

var key = '0929824d46a545451b7c86e7d3efcfcf';
var api_key_secret = '9fbeb12856c07858';

function getOAuth(url, callback) {
	http.get({
		host: host,
		port: 80,
		path: url
	},
	function(res) {
		res.setEncoding('utf8');
		var ret = '';
		res.on('data', function(chunk) {
			ret += chunk;
		});
		res.on('end', function() {
			callback(null, ret);
		});
		res.on('error', callback);
	});
}

function getRequestToken(callback) {
	var data = {
		method: 'GET',
		action: 'http://' + host + OAuthList['request'],
		parameters: {
			oauth_consumer_key: key,
			oauth_signature_method: 'HMAC-SHA1',
			oauth_signature: '',
			oauth_timestamp: '',
			oauth_nonce: ''
		}
	};
	OAuth.setTimestampAndNonce(data);
	OAuth.SignatureMethod.sign(data, {
		consumerSecret: api_key_secret
	});
	data = OAuth.getParameterMap(data.parameters);
	getOAuth(OAuthList['request'] + '?' + qs.stringify(data), function(err, ret) {
		if (err) callback(err);
		else callback(null, qs.parse(ret));
	});
}

function getAccessToken(response, backurl) {
	getRequestToken(function(err, ret) {
		if (err) console.log(err);
		else {
			var data = {
				oauth_token: ret['oauth_token'],
				oauth_callback: decodeURIComponent(backurl + '?oauth_token=' + ret['oauth_token'] + '&oauth_token_secret=' + ret['oauth_token_secret'])
			};
			response.writeHead(200, {
				'Content-Type': 'text/html'
			});
			response.end('<script>window.location.href="http://' + host + OAuthList['authorize'] + '?' + qs.stringify(data) + '";</script>');
		}
	});
}

function getAuthToken(ret, callback) {
	var data = {
		method: "GET",
		action: 'http://' + host + OAuthList['access'],
		parameters: {
			oauth_consumer_key: key,
			oauth_token: ret['oauth_token'],
			oauth_signature_method: 'HMAC-SHA1',
			oauth_signature: '',
			oauth_timestamp: '',
			oauth_nonce: ''
		}
	};
	OAuth.setTimestampAndNonce(data);
	OAuth.SignatureMethod.sign(data, {
		consumerSecret: api_key_secret,
		tokenSecret: ret['oauth_token_secret']
	});
	data = OAuth.getParameterMap(data.parameters);
	getOAuth(OAuthList['access'] + '?' + qs.stringify(data), function(err, ret) {
		if (err) callback(err);
		else callback(err, qs.parse(ret));
	});
}

var app = http.createServer(function(req, res) {
	var path = url.parse(req.url),
	pathname = path.pathname,
	query = qs.parse(path.query);
	if (pathname == '/') {
		getAccessToken(res, 'http://' + hosts + ':3000/start');
	} else if (pathname == '/start') {
		getAuthToken(query, function(err, ret) {
			if (err) console.log(err);
			else {
				console.log(ret);
				if (!myappStart) {
					myappStart = true;
					clock.start(ret);
					res.end('automan is started!');
				} else {
					res.end('automan is started yet!');
				}
			}
		});
	} else {
		res.end('wrong path');
	}
}).listen(3000, hosts);

console.log('on 3000');

