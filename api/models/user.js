const { USER_USERNAME_MIN_LENGTH, USER_USERNAME_MAX_LENGTH, USER_USERNAME_REGEX,
    USER_PASSWORD_MIN_LENGTH, USER_PASSWORD_MAX_LENGTH, USER_PASSWORD_REGEX } = require('../../config/apiConfig');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        auto: true 
    },
    username: { 
        type: String, 
        required: true, 
        unique: true,
        minlength: USER_USERNAME_MIN_LENGTH,
        maxlength: USER_USERNAME_MAX_LENGTH,
        match: [USER_USERNAME_REGEX, 'Invalid username format'],
    },
    password: { 
        type: String,
        required: true,
        minlength: USER_PASSWORD_MIN_LENGTH,
        maxlength: USER_PASSWORD_MAX_LENGTH,
        match: [USER_PASSWORD_REGEX, 'Invalid pasword format'],
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('User', userSchema);