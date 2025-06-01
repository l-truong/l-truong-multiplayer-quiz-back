const { LANGUAGE_MIN_LENGTH, LANGUAGE_MAX_LENGTH, LANGUAGES, LANGUAGE_DEFAULT,
    CATEGORY_NAME_MIN_LENGTH, CATEGORY_NAME_MAX_LENGTH, CATEGORY_DESCRIPTION_MIN_LENGTH,
    CATEGORY_DESCRIPTION_MAX_LENGTH } = require('../../config/apiConfig');
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        auto: true 
    },
    name: { 
        type: String,              
        required: true, 
        unique: true,
        minlength: CATEGORY_NAME_MIN_LENGTH,
        maxlength: CATEGORY_NAME_MAX_LENGTH
    },
    description: { 
        type: String,
        minlength: CATEGORY_DESCRIPTION_MIN_LENGTH,
        maxlength: CATEGORY_DESCRIPTION_MAX_LENGTH
    },
    language: { 
        type: String,               
        required: true, 
        minlength: LANGUAGE_MIN_LENGTH,
        maxlength: LANGUAGE_MAX_LENGTH,  
        enum: LANGUAGES,
        default: LANGUAGE_DEFAULT
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

module.exports = mongoose.model('Category', categorySchema);