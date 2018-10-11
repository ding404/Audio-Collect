var mongoose = require('mongoose');
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
var User = mongoose.model('User', UserSchema);
module.exports = User;
