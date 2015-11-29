var http = require('http');
var express = require('express');
var svnc = require('../index.js');

/* serve your app */
var app = express();
var httpServer = http.createServer(app);
app.use(express.static(__dirname + '/static/'));
httpServer.listen(8080);
console.log('Listening on port', 8080);

/* fire up simplevnc server */
var server = new svnc.Server(httpServer);
server.on('connect', function(client){
  console.log('svnc client connected');
})
server.on('disconnect', function(client){
  console.log('svnc client disconnected');
})
server.on('error', function(err){
  console.error('svnc error', err)
})
