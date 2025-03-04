const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        auto: true 
    },
    questionText: { 
        type: String, 
        required: true 
    },
    options: { 
        type: [String], 
        required: true 
    },
    correctAnswer: { 
        type: String, 
        required: true 
    },
    explanation: { 
        type: String, 
        required: false 
    },
    categoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    },
    imageUrl: {
        type: String, 
        required: true 
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