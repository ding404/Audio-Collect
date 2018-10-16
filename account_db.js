var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        match: ['^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$', 'Not a valid email address']
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        match: ['^[A-Za-z0-9_]{2,15}$', 'Not a valid user name']
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
                return v.password === v.passwordConf;
            },
            message: 'password is not same'
        }
    }
});

UserSchema.pre('save', function(next) {
    var user = this;
    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        return next();
    });
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
