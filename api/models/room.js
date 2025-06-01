const { LANGUAGES } = require('../../config/apiConfig');
const { ROOM_MAX_PLAYERS, ROOM_DEFAULT_CHOOSENTIMER, ROOM_DEFAULT_LANGUAGE } = require('../../config/roomConfig');
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
        default: [],
        validate: {
            validator: function(v) {
                return v.length > ROOM_MAX_PLAYERS;
            },
            message: `Players must be an array of maximum ${ROOM_MAX_PLAYERS} items`
        }
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
            default: ROOM_DEFAULT_CHOOSENTIMER
        },
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question'
            }
        ],
        currentQuestionIndex: { 
            type: Number, 
            default: 0
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
            default: ROOM_DEFAULT_LANGUAGE
        }
      }
    ],
    chatHistory: {
        type: [mongoose.Schema.Types.Mixed],
        validate: {
            validator: function(value) {
                return value.every(item => 
                    typeof item === 'string' || 
                    (typeof item === 'object' && LANGUAGES.every(lang => lang in item))
                );
            },
            message: `Each chat history entry must be either a string or an object with properties: ${LANGUAGES.join(', ')}`
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
