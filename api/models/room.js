const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomId: { 
        type: String, 
        required: true
    },
    status: { 
        type: Number, 
        required: true 
    },
    players: { 
        type: [String], 
        default: []
    },
    currentRound: { 
        type: Number, 
        default: 0 
    },
    rounds: [
      {
        _id: false,
        choosenCategory: [String],
        choosenTimer: { 
            type: Number, 
            default: 15
        },
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question'
            }
        ],
        currentQuestionIndex: { 
            type: Number, 
            default: 20
        },
        playerAnswers: [
            {
                _id: false,
                player: { type: String, required: true },
                answers: { type: [String], required: true }
            }
        ],
        playerAlreadyAnswered: { 
            type: Number, 
            default: 0
        },
        quizLanguage: { 
            type: String, 
            default: 'fr'
        }
      }
    ],
    chatHistory: {
        type: [mongoose.Schema.Types.Mixed],
        validate: {
          validator: function(value) {
            return value.every(item => 
              typeof item === 'string' || 
              (typeof item === 'object' && item.hasOwnProperty('eng') && item.hasOwnProperty('fr'))
            );
          },
          message: 'Each chat history entry must be either a string or an object with "eng" and "fr" properties.'
        }
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    endedAt: { 
        type: Date, 
        default: Date.now 
    }
  }  
);

module.exports = mongoose.model("Room", roomSchema);
