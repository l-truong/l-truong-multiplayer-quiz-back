const { QUESTION_QUESTIONTEXT_MIN_LENGTH, QUESTION_QUESTIONTEXT_MAX_LENGTH, QUESTION_MAX_OPTIONS,
    QUESTION_ANSWER_MIX_LENGTH, QUESTION_ANSWER_MAX_LENGTH, QUESTION_EXPLANATION_MIN_LENGTH, 
    QUESTION_EXPLANATION_MAX_LENGTH, QUESTION_IMAGEURL_MIN_LENGTH, QUESTION_IMAGEURL_MAX_LENGTH } = require('../../config/apiConfig');
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        auto: true 
    },
    questionText: { 
        type: String,         
        required: true, 
        unique: true,
        minlength: QUESTION_QUESTIONTEXT_MIN_LENGTH,
        maxlength: QUESTION_QUESTIONTEXT_MAX_LENGTH
    },
    options: { 
        type: [String],
        required: true,     
        validate: {
            validator: function(v) {
                return v.length === QUESTION_MAX_OPTIONS && v.every(option => option.length >= QUESTION_ANSWER_MIX_LENGTH && option.length <= QUESTION_ANSWER_MAX_LENGTH);
            },
            message: `Options must be an array of exactly ${QUESTION_MAX_OPTIONS} items, and each option must have between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`
        }
    },
    correctAnswer: { 
        type: String, 
        required: true,
        minlength: QUESTION_ANSWER_MIX_LENGTH,
        maxlength: QUESTION_ANSWER_MAX_LENGTH        
    },
    explanation: { 
        type: String,         
        required: false,
        minlength: QUESTION_EXPLANATION_MIN_LENGTH,
        maxlength: QUESTION_EXPLANATION_MAX_LENGTH 
    },
    categoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    },
    imageUrl: {
        type: String,         
        required: true,        
        minlength: QUESTION_IMAGEURL_MIN_LENGTH,
        maxlength: QUESTION_IMAGEURL_MAX_LENGTH 
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

module.exports = mongoose.model('Question', questionSchema);