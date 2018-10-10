var express = require('express');
var serveStatic = require('serve-static');

var app = express()
    .use(serveStatic(__dirname + '/public'))
    .listen(3000);
console.log('listening at http://10.70.2.246:3000');
