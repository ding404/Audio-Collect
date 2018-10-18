var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                var re = /^[\w\.]+@[\w\.]+\.+[\w]{2,4}$/;
                return re.test(v);
            },
            message: 'Not a valid email address'
        }
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                var re = /^[A-Za-z0-9_]{2,15}$/;
                return re.test(v);
            },
            message: 'Not a valid user name'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Not a valid password']
    },
    passwordConf: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return v === this.password;
            },
            message: 'password is not same'
        }
    }
});

//authenticate input against database by email
UserSchema.statics.authenticateByEmail = function(email, password, callback) {
    User.findOne({ email: email })
        .exec(function(err, user) {
            if (!user) {
                err = new Error('User not found.');
                err.status = 401;
            } else if (!err) {
                bcrypt.compare(password, user.password, function(err, result) {
                    if (result === false) {
                        user = null;
                    }
                });
            }
            return callback(err, user);
        });
};

//authenticate input against database by username
UserSchema.statics.authenticateByUsername = function(username, password, callback) {
    User.findOne({ username: username })
        .exec(function(err, user) {
            if (!user) {
                err = new Error('User not found.');
                err.status = 401;
            } else if (!err) {
                bcrypt.compare(password, user.password, function(err, result) {
                    if (result === false) {
                        user = null;
                    }
                });
            }
            return callback(err, user);
        });
};

UserSchema.pre('save', function(next) {
    var user = this;
    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
            return next(err);
        }
        user.password = user.passwordConf = hash;
        return next();
    });
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
