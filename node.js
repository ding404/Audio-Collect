var express = require('express');
var http = require('http');
var serveStatic = require('serve-static');

var app = express();
var server = http.createServer(app);

app.use(serveStatic(__dirname + '/public'));


server.listen(3000, getLocalAddress());
server.on('listening', function() {
    console.log('Express server started on http://%s:%s'
        , server.address().address
        , server.address().port);
});

function getLocalAddress() {
    var os = require('os');
    var ifaces = os.networkInterfaces();
    const localhost = 'localhost';
    var address = localhost;
    Object.keys(ifaces).some(function(ifname) {
        ifaces[ifname].some(function(iface) {
            if ('IPv4' === iface.family && iface.internal === false) {
                console.log(ifname, iface.address);
                address = iface.address;
            }
            return address !== localhost;
        });
        return address !== localhost;
    });
    return address;
}
