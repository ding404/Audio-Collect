var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var http = require('http');
var serveStatic = require('serve-static');
var User = require('./account_db');
var compression = require('compression');
var timeout = require('connect-timeout');

var sessionStore = new MongoStore({
    host: '127.0.0.1',
    port: '27017',
    db: 'session',
    url: 'mongodb://localhost:27017/demo'
});

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
        var id = req.params.id;
        console.log('account id:' + id);
        console.log(req.session);
        if (req.session.view) {
            req.session.view++;
        } else {
            req.session.view = id;
        }
        console.log(req.session);
        next();
    })
    .get(function(req, res) {
        console.log('get account id:' + req.session.view);
        res.end('' + req.session.view);
    })
    .put(function(req, res) {
        console.log('replace a account id:' + req.session.id);
        res.end();
    })
    .delete(function(req, res) {
        console.log('delete a account id:' + req.session.id);
        res.end();
    });

var app = express();
app.use(serveStatic(__dirname + '/public'))
    .use(session({
        resave: true,
        saveUninitialized: false,
        secret: 'my super secret sign key',
        store: sessionStore
    }))
    .use(express.urlencoded({
        extended: true
    }))
    .use(express.json())
    .use(compression())
    .use('/account', timeout(5000), router);



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




startService();
