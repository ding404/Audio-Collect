var express = require('express');
var http = require('http');
var serveStatic = require('serve-static');

var app = express();
app.use(serveStatic(__dirname + '/public'))
    .use(express.urlencoded({
        extended: true
    }))
    .use(express.json());

var router = express.Router();
router.route('/')
    .get(function(req, res) {
        console.log('get accounts');
    })
    .post(function(req, res) {
        console.log('add a account');
        for (var key in req.body) {
            console.log(key + ' : ' + req.body[key]);
        }
    })
    .delete(function(req, res) {
        console.log('delete accounts');
    });
router.route('/:id')
    .all(function(req, res, next) {
        var id = req.params['id'];
        console.log('account id:' + id);
        req.id = id;
        next();
    })
    .get(function(req, res) {
        console.log('get account id:' + req.id);
    })
    .put(function(req, res) {
        console.log('replace a account id:' + req.id);
    })
    .delete(function(req, res) {
        console.log('delete a account id:' + req.id);
    });

app.use('/account', router);



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

function startService() {
    var server = http.createServer(app);
    server.listen(3000, getLocalAddress());
    server.on('listening', function() {
        console.log('Express server started on http://%s:%s'
            , server.address().address
            , server.address().port);
    });
}

var User = require('./account_db');



startService();
