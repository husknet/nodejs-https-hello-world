var https = require('https');
var http = require('http');
var express = require('express');

var app = express();
var fs = require('fs');

var options = {
  key: fs.readFileSync('certs/ssl.key'),
  cert: fs.readFileSync('certs/ssl.crt')
}; 

console.log("Nodejs https test");

app.use(function(req, res) {
	console.log("REQ URL - ",req.url," - ", new Date());
	res.json({msg: "up"});
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);

httpServer.listen(80);
httpsServer.listen(443);

