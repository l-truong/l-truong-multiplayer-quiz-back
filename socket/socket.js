const socket = require('socket.io');
const Room = require('../api/models/room');
const { ERROR_MESSAGES } = require('../config/errorMessages');
const { CHAT_MESSAGES } = require('../config/chatMessages');
const { ROOM_MAX_PLAYERS, ROOM_PASSWORD_MAX_LENGTH, ROOM_PASSWORD_ALLOWED_CHARACTERS, ROOM_STATUS, ROOM_CHAT_MESSAGE_MAX_LENGTH } = require('../config/roomConfig');

function initSocket(server) {
  const io = socket(server, {
    cors: {
      origin: '*'
    },
  });
  const rooms = {};

  io.on('connection', (socket) => {
    
    /********/
    /* ROOMS LIFECYCLE */
    /********/
    socket.on('createRoom', (data) => {
      const username = data.username;
      if (!username) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('usernameNotFound')
        });
        return;
      }

      const roomId = generateRandomRoomPassword();
      socket.join(roomId);

      rooms[roomId] = {
        roomId: roomId,
        status: ROOM_STATUS.WAITING,
        players: [],
        currentRound: null,
        rounds: [],
        chatHistory: [],
        createdAt: new Date()
      };
      rooms[roomId].players.push({
        id: socket.id,
        username: username,
        isAdmin: true,
        score: 0
      });

      socket.emit('roomEntered', { isAdmin: true, roomId: roomId });
      io.to(roomId).emit('roomMessageInfo', {
        message: getChatMessages('createdTheGame', username)
      });
      rooms[roomId].chatHistory.push(getChatMessages('createdTheGame', username));
      io.to(roomId).emit('chatUpdate', rooms[roomId].chatHistory);
      io.to(roomId).emit('playersInRoom', {
        maxPlayer: ROOM_MAX_PLAYERS,
        players: rooms[roomId].players
      });
    });

    socket.on('joinRoom', (data) => {
      const roomId = data.roomId;
      if (!roomId) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('roomIdNotFound')
        });
        return;
      }
      if (!rooms[roomId]) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('roomDoesNotExist')
        });
        return;
      }
      if (rooms[roomId].players.length === ROOM_MAX_PLAYERS) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('roomIsFull')
        });
        return;
      }
      const username = data.username;
      if (!username) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('usernameNotFound')
        });
        return;
      }
      const existingPlayer = rooms[roomId].players.find((player) => player.username === username);
      if (existingPlayer) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('usernameAlreadyTaken')
        });
        return;
      }
      if (rooms[roomId].status === ROOM_STATUS.OUTGOING) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('gameAlreadyOutgoing')
        });
        return;
      }

      socket.join(roomId);

      rooms[roomId].players.push({
        id: socket.id,
        username,
        isAdmin: false,
        score: 0
      });

      socket.emit('roomEntered', { isAdmin: false, roomId: roomId });
      io.to(roomId).emit('roomMessageInfo', {
        message: getChatMessages('enteredTheGame', username)
      });
      rooms[roomId].chatHistory.push(getChatMessages('enteredTheGame', username));
      io.to(roomId).emit('chatUpdate', rooms[roomId].chatHistory);
      io.to(roomId).emit('playersInRoom', {
        maxPlayer: ROOM_MAX_PLAYERS,
        players: rooms[roomId].players
      });
    });

    socket.on('disconnectManually', async () => {
      for (const roomId in rooms) {
        let room = rooms[roomId];
        const index = room.players.findIndex((player) => player.id === socket.id);

        if (index !== -1) {
          const playerLeaving = room.players[index];
          room.players.splice(index, 1);
          socket.leave(roomId);
                    
          const currentRound = room.currentRound;

          if(room.players.length > 0) {
            io.to(roomId).emit('roomMessageWarning', {
              message: getChatMessages('leftTheGame', playerLeaving.username)
            });
            room.chatHistory.push(getChatMessages('leftTheGame', playerLeaving.username));

            if (playerLeaving.isAdmin) {
              const newAdmin = room.players[0];
              newAdmin.isAdmin = true;
              room.players.forEach((player) => {
                if (player.id !== newAdmin.id) {
                  player.isAdmin = false;
                }
              });
              io.to(roomId).emit('roomMessageInfo', {
                message: getChatMessages('promotedToAdmin', newAdmin.username)
              });
              room.chatHistory.push(getChatMessages('promotedToAdmin', newAdmin.username));
              io.to(roomId).emit('newAdmin', newAdmin);
            }

            io.to(roomId).emit('playersInRoom', {
              maxPlayer: ROOM_MAX_PLAYERS,
              players: room.players
            });
            
            io.to(roomId).emit('chatUpdate', room.chatHistory);

            if (currentRound >= 0 && room.status === ROOM_STATUS.OUTGOING) {
              let containsPlayer = room.rounds[currentRound].playersAlreadyAnswered.some(item => 
                item.id === playerLeaving.id && item.username === playerLeaving.username
              );              
              if (containsPlayer) {
                room.rounds[currentRound].playersAlreadyAnswered = room.rounds[currentRound].playersAlreadyAnswered.filter(item => 
                  !(item.id === playerLeaving.id && item.username === playerLeaving.username                  
                ));
              }
           
              const allPlayersAnswered = room.rounds[currentRound].playersAlreadyAnswered.length === room.players.length;      

              if (allPlayersAnswered) {
                if (room.rounds[currentRound].currentQuestionIndex < room.rounds[currentRound].questions.length - 1) {                                    
                  room.rounds[currentRound].currentQuestionIndex = room.rounds[currentRound].currentQuestionIndex + 1;
                  io.to(roomId).emit('roomMessage', {
                    message: getChatMessages('questionNb', null, room.rounds[currentRound].currentQuestionIndex + 1)
                  });
                  io.to(roomId).emit('newQuestion', {
                    quizLanguage: room.rounds[currentRound].quizLanguage,
                    choosenTimer: room.rounds[currentRound].choosenTimer,
                    questionsLength: room.rounds[currentRound].questions.length,
                    currentQuestionIndex: room.rounds[currentRound].currentQuestionIndex,
                    currentQuestion: room.rounds[currentRound].questions[room.rounds[currentRound].currentQuestionIndex]
                  });
                  room.rounds[currentRound].playersAlreadyAnswered = [];
                } else {
                  room.status = ROOM_STATUS.WAITING;
                  io.to(roomId).emit('roomMessageSuccess', {
                    message: getChatMessages('quizEnded')
                  });
                  room.chatHistory.push(getChatMessages('quizEnded'));
                  io.to(roomId).emit('chatUpdate', room.chatHistory);
                  io.to(roomId).emit('quizEnded');
                }
              }
            }            
          } else {
            io.to(roomId).emit('roomMessageSuccess', {
              message: getChatMessages('gameEnded')
            });
            room.chatHistory.push(getChatMessages('gameEnded'));

            if (room.rounds[currentRound]?.currentQuestionIndex && room.rounds[currentRound].currentQuestionIndex < room.rounds[currentRound].questions.length - 1) {
              room.status = ROOM_STATUS.UNFINISH
            } else {
              room.status = ROOM_STATUS.COMPLETED;
            }
            room.endedAt = new Date();
            
            try {
              await Room.findOneAndUpdate({ roomId: roomId }, room, { upsert: true });
            } catch (err) {
              io.to(roomId).emit('roomMessageError', {
                message: getErrorMessages('savingRoomData')
              });
            }
            delete rooms[roomId];
          }
          break;
        }
      }
    });

    /********/
    /* CHAT */
    /********/
    socket.on('sendMessage', (roomId, message) => {
      if (!roomId) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('roomIdNotFound')
        });
        return;
      }
      let room = rooms[roomId];
      if (!room) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('roomDoesNotExist')
        });
        return;
      }
      if (!message) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('messageNotFound')
        });
        return;
      }

      const player = room.players.find((player) => player.id === socket.id);

      if (player && message.length <= ROOM_CHAT_MESSAGE_MAX_LENGTH) {
        const playerMessage = `<strong>${player.username}:</strong> ${message}`;
        room.chatHistory.push(playerMessage);
        io.to(roomId).emit('chatUpdate', room.chatHistory);
      }
    });

    socket.on('getPlayersInRoom', (roomId) => {
      if (!roomId) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('roomIdNotFound')
        });
        return;
      }
      let room = rooms[roomId];
      if (!room) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('roomDoesNotExist')
        });
        return;
      }

      socket.emit('playersInRoom', {
        maxPlayer: ROOM_MAX_PLAYERS,
        players: room.players
      });
    });

    /********/
    /* GAME */
    /********/
    socket.on('startQuiz', (roomId, params) => {
      if (!roomId) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('roomIdNotFound')
        });
        return;
      }
      let room = rooms[roomId];
      if (!room) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('roomDoesNotExist')
        });
        return;
      }
      if (!params) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('quizParamsNotFound')
        });
        return;
      }
      const requiredParams = [
        'choosenNbQuestions',
        'choosenCategory',
        'choosenTimer',
        'questions',
        'quizLanguage'
      ];
      const missingParams = requiredParams.filter((param) => !params?.[param]);
      if (missingParams.length > 0) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('missingQuizParams', `${missingParams.join(', ')}`)
        });
        return;
      }

      const admin = room.players.find((player) => player.isAdmin);
      const username = admin ? admin.username : 'Admin';

      io.to(roomId).emit('roomMessageInfo', {
        message: getChatMessages('startedTheGame', username)
      });
      room.chatHistory.push(getChatMessages('startedTheGame', username));
      room.status = ROOM_STATUS.OUTGOING;

      if (room.currentRound === null) {
        room.currentRound = 0;
      } else {
        room.currentRound = room.currentRound + 1;
      }

      const currentRound = room.currentRound;
      room.rounds[currentRound] = {};
      room.rounds[currentRound].choosenCategory = params.choosenCategory;
      room.rounds[currentRound].choosenTimer = params.choosenTimer;
      room.rounds[currentRound].questions = params.questions;
      room.rounds[currentRound].currentQuestionIndex = 0;
      room.rounds[currentRound].playerAnswers = [];
      room.rounds[currentRound].playersAlreadyAnswered = [];
      room.rounds[currentRound].quizLanguage = params.quizLanguage;

      io.to(roomId).emit('roomMessage', {
        message: getChatMessages('questionNb', null, room.rounds[currentRound].currentQuestionIndex + 1)
      });
      io.to(roomId).emit('chatUpdate', room.chatHistory);
      io.to(roomId).emit('quizStarted');
      io.to(roomId).emit('newQuestion', {
        quizLanguage: room.rounds[currentRound].quizLanguage,
        choosenTimer: room.rounds[currentRound].choosenTimer,
        questionsLength: room.rounds[currentRound].questions.length,
        currentQuestionIndex: room.rounds[currentRound].currentQuestionIndex,
        currentQuestion: room.rounds[currentRound].questions[room.rounds[currentRound].currentQuestionIndex]
      });
    });

    socket.on('submitAnswer', (roomId, answer) => {
      if (!roomId) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('roomIdNotFound')
        });
        return;
      }
      let room = rooms[roomId];
      if (!room) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('roomDoesNotExist')
        });
        return;
      }

      const player = room.players.find((player) => player.id === socket.id);
      const currentRound = room.currentRound;

      if (player) {
        let playerAlreadyExist = room.rounds[currentRound].playerAnswers.find((item) => item.player === player.username);

        if (!playerAlreadyExist) {
          room.rounds[currentRound].playerAnswers.push({
            player: player.username,
            answers: [answer]
          });
        } else {
          playerAlreadyExist.answers.push(answer);
        }
        room.rounds[currentRound].playersAlreadyAnswered.push(player);

        if (answer === null) {
          io.to(roomId).emit('roomMessageWarning', {
            message: getChatMessages('didntAnswer', player.username)
          });
          io.to(roomId).emit('chatUpdate', room.chatHistory);
        } else {
          socket.emit('playerAlreadyAnswered', {});
          io.to(roomId).emit('roomMessageInfo', {
            message: getChatMessages('answered', player.username)
          });
          io.to(roomId).emit('chatUpdate', room.chatHistory);
        }

        const allPlayersAnswered = room.rounds[currentRound].playersAlreadyAnswered.length === room.players.length;

        if (allPlayersAnswered) {
          if (room.rounds[currentRound].currentQuestionIndex < room.rounds[currentRound].questions.length - 1) {
            room.rounds[currentRound].currentQuestionIndex = room.rounds[currentRound].currentQuestionIndex + 1;

            io.to(roomId).emit('roomMessage', {
              message: getChatMessages('questionNb', null, room.rounds[currentRound].currentQuestionIndex + 1)
            });
            io.to(roomId).emit('newQuestion', {
              quizLanguage: room.rounds[currentRound].quizLanguage,
              choosenTimer: room.rounds[currentRound].choosenTimer,
              questionsLength: room.rounds[currentRound].questions.length,
              currentQuestionIndex: room.rounds[currentRound].currentQuestionIndex,
              currentQuestion: room.rounds[currentRound].questions[room.rounds[currentRound].currentQuestionIndex]
            });

            room.rounds[currentRound].playersAlreadyAnswered = [];
          } else {
            room.status = ROOM_STATUS.WAITING;
            io.to(roomId).emit('roomMessageSuccess', {
              message: getChatMessages('quizEnded')
            });
            room.chatHistory.push(getChatMessages('quizEnded'));
            io.to(roomId).emit('chatUpdate', room.chatHistory);
            io.to(roomId).emit('quizEnded');
          }
        }
      }
    });

    socket.on('getResults', (roomId) => {
      if (!roomId) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('roomIdNotFound')
        });
        return;
      }
      let room = rooms[roomId];
      if (!room) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('roomDoesNotExist')
        });
        return;
      }

      const currentRound = room.currentRound;      
      const allPlayersScores = room.rounds.map((round, roundIndex) => {
        const playersScore = round.playerAnswers.map((player) => {
          let score = 0;
          player.answers.forEach((answer, index) => {
            if (answer !== null && round.questions[index]?.correctAnswer && answer === round.questions[index].correctAnswer) {
              score += 1;
            }
          });
          return {
            username: player.player,
            answers: player.answers,
            score: score
          };
        });
        
        return {
          roundIndex: roundIndex,
          playersScore: playersScore,
          questions: round.questions
        };
      });

      let playerScores = {};
      allPlayersScores.forEach((round) => {
        round.playersScore.forEach((player) => {
          if (!playerScores[player.username]) {
            playerScores[player.username] = 0;
          }
          playerScores[player.username] += player.score;
        });
      });
      let allPlayersFinalResult = Object.keys(playerScores).map((username) => {
        return {
          username: username,
          finalScore: playerScores[username]
        };
      });

      io.to(roomId).emit('resultsInRoom', {
        allPlayersScores: allPlayersScores,
        allPlayersFinalResult: allPlayersFinalResult
      });
    });
    
    socket.on('navigateEveryPlayerToMultiPlayerSettings', (roomId) => {
      if (!roomId) {
        socket.emit('roomMessageError', {
          message: getErrorMessages('roomIdNotFound')
        });
        return;
      }
      io.to(roomId).emit('navigateEveryPlayerToMultiPlayerSettings', {});
    });
  });

  /********/
  /* FUNCTIONS */
  /********/
  function generateRandomRoomPassword() {
    let randomRoomPassword = '';
    for (let i = 0; i < ROOM_PASSWORD_MAX_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * ROOM_PASSWORD_ALLOWED_CHARACTERS.length);
      randomRoomPassword += ROOM_PASSWORD_ALLOWED_CHARACTERS[randomIndex];
    }
    return randomRoomPassword;
  }

  function getErrorMessages(key, additionalMessage) {
    let errorMessages = {};
    const languages = Object.keys(ERROR_MESSAGES);
    languages.forEach((language) => {
      if (ERROR_MESSAGES[language] && ERROR_MESSAGES[language][key]) {
        let message = ERROR_MESSAGES[language][key];
        if (additionalMessage) {
          message += ` ${additionalMessage}`;
        }
        errorMessages[language] = message;
      }
    });
    return errorMessages;
  }

  function getChatMessages(key, username, additionalMessage) {
    let chatMessages = {};
    const languages = Object.keys(CHAT_MESSAGES);
    languages.forEach((language) => {
      let message = username ? `${username} ` + CHAT_MESSAGES[language][key] : CHAT_MESSAGES[language][key];
      if (additionalMessage) {
        message += ` ${additionalMessage}`;
      }
      chatMessages[language] = message;
    });
    return chatMessages;
  }
}

module.exports = { initSocket };
