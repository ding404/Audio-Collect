var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var http = require('http');
var User = require('./account_db');
var compression = require('compression');
var timeout = require('connect-timeout');

mongoose.connect('mongodb://localhost:27017/demo', { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
});

var sessionStore = new MongoStore({
    host: '127.0.0.1',
    port: '27017',
    db: 'session',
    mongooseConnection: db
});

var account_router = express.Router();
account_router.route('/')
    .get(function(req, res, next) {
        console.log('get accounts');
        return res.end('get accounts');
    })
    .post(function(req, res, next) {
        for (var key in req.body) {
            console.log(key + ' : ' + req.body[key]);
        }
        if (req.body.email && req.body.password2) {
            console.log('start create account');
            var userData = {
                email: req.body.email,
                username: req.body.name,
                password: req.body.password,
                passwordConf: req.body.password2,
            };
            User.create(userData, function(error, user) {
                if (error) {
                    return next(error);
                } else {
                    console.log('create user by id ' + user._id);
                    req.session.userId = user._id;
                    req.session.redirectTo = '/collection/main';
                    return res.redirect('/account/profile');
                }
            });
        } else if (req.body.name_or_email && !req.body.password2) {
            console.log('start account authentication');
            var email_re = /^[\w\.]+@[\w\.]+\.+[\w]{2,4}$/;
            var username_re = /^[A-Za-z0-9_]{2,15}$/;
            if (email_re.test(req.body.name_or_email)) {
                User.authenticateByEmail(req.body.name_or_email, req.body.password, function(error, user) {
                    if (error || !user) {
                        var err = new Error('Wrong email or password.');
                        err.status = 401;
                        return next(err);
                    } else {
                        req.session.userId = user._id;
                        return res.redirect('/collection/main');
                    }
                });
            } else if (username_re.test(req.body.name_or_email)) {
                User.authenticateByUsername(req.body.name_or_email, req.body.password, function(error, user) {
                    if (error || !user) {
                        var err = new Error('Wrong username or password.');
                        err.status = 401;
                        return next(err);
                    } else {
                        req.session.userId = user._id;
                        return res.redirect('/collection/main');
                    }
                });
            }
        }
    })
    .delete(function(req, res) {
        console.log('delete accounts');
    });

account_router.get('/profile', isAuthenticated, function(req, res, next) {
    User.findById(req.session.userId)
        .exec(function(error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    return next(err);
                } else {
                    if (req.headers.referer.includes('/account/profile') ||
                        req.headers.referer.includes('/collection/main') ||
                        req.headers.referer.includes('/collection/setting')) {
                        var redirectTo = req.session.redirectTo;
                        delete req.session.redirectTo;
                        return res.json({
                            'username': user.username,
                            'email': user.email,
                            'redirectTo': redirectTo
                        });
                    } else {
                        return res.sendFile(__dirname + '/public/profile.html');
                    }
                }
            }
        });
});

function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        console.log('authenticated');
        next();
    } else {
        console.log('not authenticated');
        res.redirect('/');
    }
}

account_router.get('/logout', function(req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

account_router.route('/:userId')
    .all(function(req, res, next) {
        var userId = req.params.userId;
        console.log('account id:' + userId);
        console.log(req.session);
        req.session.userId = userId;
        console.log(req.session);
        next();
    })
    .get(function(req, res) {
        console.log('get account id:' + req.session.userId);
        res.end('' + req.session.userId);
    })
    .put(function(req, res) {
        console.log('replace a account id:' + req.session.userId);
        res.end();
    })
    .delete(function(req, res) {
        console.log('delete a account id:' + req.session.userId);
        res.end();
    });

var collection_router = express.Router();
collection_router.use(isAuthenticated);
collection_router.route('/main')
    .get(function(req, res) {
        return res.sendFile(__dirname + '/public/main.html');
    });
collection_router.route('/setting')
    .get(function(req, res) {
        return res.sendFile(__dirname + '/public/collection_setting.html');
    })
    .post(function(req, res) {
        if (req.headers.referer.includes('/collection/setting')) {
            for (var key in req.body) {
                console.log(key + ' : ' + req.body[key]);
            }
            return res.redirect('/collection/list');
        } else {
            return next();
        }
    });
collection_router.route('/list')
    .get(function(req, res) {
        return res.sendFile(__dirname + '/public/recorder_list.html');
    });

var app = express();
app.use(express.static(__dirname + '/public'))
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
    .use('/account', timeout(5000), account_router)
    .use('/collection', timeout(5000), collection_router)
    .use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send(err.message);
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
