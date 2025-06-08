const { 
    LANGUAGE_MIN_LENGTH, LANGUAGE_MAX_LENGTH, LANGUAGES, LANGUAGE_DEFAULT,
    CATEGORY_NAME_MIN_LENGTH, CATEGORY_NAME_MAX_LENGTH, 
    CATEGORY_DESCRIPTION_MIN_LENGTH, CATEGORY_DESCRIPTION_MAX_LENGTH,
    QUESTION_QUESTIONTEXT_MIN_LENGTH, QUESTION_QUESTIONTEXT_MAX_LENGTH, 
    QUESTION_MAX_OPTIONS, QUESTION_ANSWER_MIX_LENGTH, QUESTION_ANSWER_MAX_LENGTH, 
    QUESTION_EXPLANATION_MIN_LENGTH, QUESTION_EXPLANATION_MAX_LENGTH, 
    QUESTION_IMAGEURL_MIN_LENGTH, QUESTION_IMAGEURL_MAX_LENGTH,
    USER_USERNAME_MIN_LENGTH, USER_USERNAME_MAX_LENGTH, USER_USERNAME_REGEX,
    USER_PASSWORD_MIN_LENGTH, USER_PASSWORD_MAX_LENGTH, USER_PASSWORD_REGEX
} = require('./apiConfig');    
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Quiz app api',
        version: '1.1',
        description: 'Quiz app api swagger doc',
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            Category: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        description: 'MongoDB ObjectId of the category',
                        example: '682f9d3c38631fe978df85cf'
                    },
                    categoryId: {
                        type: 'string',
                        description: 'Custom category identifier',
                        example: '682f9d3c38631fe978df85ce'
                    },
                    name: {
                        type: 'string',
                        description: 'Name of the category',
                        minLength: CATEGORY_NAME_MIN_LENGTH,
                        maxLength: CATEGORY_NAME_MAX_LENGTH
                    },
                    description: {
                        type: 'string',
                        description: 'Description of the category',
                        minLength: CATEGORY_DESCRIPTION_MIN_LENGTH,
                        maxLength: CATEGORY_DESCRIPTION_MAX_LENGTH
                    },
                    language: {
                        type: 'string',
                        description: 'Language of the category',
                        enum: LANGUAGES,
                        default: LANGUAGE_DEFAULT,
                        minLength: LANGUAGE_MIN_LENGTH,
                        maxLength: LANGUAGE_MAX_LENGTH
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Creation timestamp',
                        example: '2025-05-22T21:55:08.237Z'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Last update timestamp',
                        example: '2025-05-22T21:55:08.237Z'
                    },
                    __v: {
                        type: 'integer',
                        description: 'Internal version key',
                        example: 0
                    }
                },
                required: ['name', 'language']
            },
           Question: {
            type: 'object',
            properties: {
                _id: {
                    type: 'string',
                    description: 'MongoDB ObjectId of the question',
                    example: '67ca1bd9fa661fcb08480485'
                },
                questionId: {
                    type: 'string',
                    description: 'Custom question identifier',
                    example: '67ca1bd9fa661fcb08480484'
                },
                questionText: {
                    type: 'string',
                    description: 'Text of the question',
                    example: 'What is the largest ocean on Earth?',                    
                    minLength: QUESTION_QUESTIONTEXT_MIN_LENGTH,
                    maxLength: QUESTION_QUESTIONTEXT_MAX_LENGTH
                },
                options: {
                    type: 'array',
                    description: `An array of possible answers (exactly ${QUESTION_MAX_OPTIONS} items)`,
                    items: {
                        type: 'string'
                    },
                    example: [
                        'Atlantic Ocean',
                        'Indian Ocean',
                        'Arctic Ocean',
                        'Pacific Ocean'
                    ]
                },
                correctAnswer: {
                    type: 'string',
                    description: 'Correct answer to the question',
                    example: 'Pacific Ocean',                            
                    minlength: QUESTION_ANSWER_MIX_LENGTH,
                    maxlength: QUESTION_ANSWER_MAX_LENGTH   
                },
                explanation: {
                    type: 'string',
                    description: 'Explanation for the correct answer',
                    example: 'The Pacific Ocean covers more area than all the landmasses combined',                    
                    minlength: QUESTION_EXPLANATION_MIN_LENGTH,
                    maxlength: QUESTION_EXPLANATION_MAX_LENGTH 
                },
                categoryId: {
                    type: 'string',
                    description: 'Category ID the question belongs to',
                    example: '67c747aaf2b67cb4de5c3f05'
                },
                imageUrl: {
                    type: 'string',
                    format: 'uri',
                    description: 'Optional image URL related to the question',
                    example: 'https://exemple/photo-123',                    
                    minlength: QUESTION_IMAGEURL_MIN_LENGTH,
                    maxlength: QUESTION_IMAGEURL_MAX_LENGTH 
                },
                createdAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Creation timestamp',
                    example: '2025-03-06T22:04:09.969Z'
                },
                updatedAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Last update timestamp',
                    example: '2025-03-06T22:04:09.969Z'
                },
                __v: {
                    type: 'integer',
                    description: 'Internal version key',
                    example: 0
                }
            },
            required: ['questionText', 'options', 'correctAnswer', 'categoryId']
            },
            User: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        description: 'MongoDB ObjectId of the user',
                        example: '68349f6b98b867e61770548f',
                    },
                    userId: {
                        type: 'string',
                        description: 'Custom user identifier',
                        example: '68349f6b98b867e61770548e'
                    },
                    username: {
                        type: 'string',
                        description: 'Username of the user',
                        example: 'admin01',                        
                        minlength: USER_USERNAME_MIN_LENGTH,
                        maxlength: USER_USERNAME_MAX_LENGTH,                        
                        pattern: USER_USERNAME_REGEX.toString()
                    },
                    password: {
                        type: 'string',
                        description: 'Hashed password of the user',
                        example: '$2b$10$qVU5Gw3xb.fDDsvLqXHrZuNsVn91hN17YVbe2japu9HnjiSSBmPiu',
                        format: 'password',
                        minlength: USER_PASSWORD_MIN_LENGTH,
                        maxlength: USER_PASSWORD_MAX_LENGTH,
                        pattern: USER_PASSWORD_REGEX.toString()
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'User creation timestamp',
                        example: '2025-05-26T17:05:47.546Z'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'User last update timestamp',
                        example: '2025-05-26T17:05:47.546Z'
                    },
                    __v: {
                        type: 'integer',
                        description: 'Internal version key',
                        example: 0
                    }
                },
                required: ['username', 'password']
            },
            Room: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        description: 'MongoDB ObjectId of the room',
                        example: '682ecf15d97d71c8b51a5720'
                    },
                    roomId: {
                        type: 'string',
                        description: 'Unique string identifier for the room',
                        example: '970VcXOQo5sT'
                    },
                    status: {
                        type: 'integer',
                        description: 'Status of the room (e.g., 0 = waiting, 1 = outgoing, 2 = unfinish, 3 = finished)',
                        example: 3
                    },
                    players: {
                        type: 'array',
                        description: 'List of usernames of players in the room',
                        items: {
                            type: 'string'
                        },
                        example: []
                    },
                    currentRound: {
                        type: 'integer',
                        description: 'Index of the current round (0-based)',
                        example: 0
                    },
                    rounds: {
                        type: 'array',
                        description: 'List of rounds played in the room',
                        items: {
                            type: 'object',
                            properties: {
                            choosenCategory: {
                                type: 'array',
                                description: 'List of category ObjectIds used in the round',
                                items: {
                                    type: 'string'
                                },
                                example: [
                                    '67c747aaf2b67cb4de5c3ef6',
                                    '67c747aaf2b67cb4de5c3ef9',
                                    '67c747aaf2b67cb4de5c3efc'
                                ]
                            },
                            choosenTimer: {
                                type: 'integer',
                                description: 'Timer in seconds for answering questions',
                                example: 10
                            },
                            questions: {
                                type: 'array',
                                description: 'List of Question ObjectIds for this round',
                                items: {
                                type: 'string'
                                },
                                example: [
                                '67ca1bdbfa661fcb08480542',
                                '67ca1bdbfa661fcb08480569'
                                ]
                            },
                            currentQuestionIndex: {
                                type: 'integer',
                                description: 'Current question index within the round',
                                example: 19
                            },
                            playerAnswers: {
                                type: 'array',
                                description: 'List of players and their answers for this round',
                                items: {
                                    type: 'object',
                                    properties: {
                                        player: {
                                        type: 'string',
                                        description: 'Username of the player',
                                        example: 'contact'
                                        },
                                        answers: {
                                        type: 'array',
                                        description: 'Array of answers submitted by the player',
                                        items: {
                                            type: 'string'
                                        },
                                        example: ['Suède', '1918', 'Marcel Proust']
                                        }
                                    },
                                    required: ['player', 'answers']
                                }
                            },
                            playerAlreadyAnswered: {
                                type: 'integer',
                                description: 'Number of players who have answered the current question',
                                example: 0
                            },
                            quizLanguage: {
                                type: 'string',
                                description: 'Language code for the quiz content',
                                example: 'fr'
                            }
                            },
                            required: ['choosenCategory', 'questions', 'quizLanguage']
                        }
                    },
                    chatHistory: {
                        type: 'array',
                        description: 'Multilingual chat history as a mix of strings and objects with translations',
                        items: {
                            type: 'object',
                            properties: {
                            eng: { type: 'string', example: 'Quiz ended, play again ?' },
                            fr: { type: 'string', example: 'Le quiz est terminé, rejouer ?' }
                            },
                            additionalProperties: true
                        }
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'When the room was created',
                        example: '2025-05-22T07:13:23.839Z'
                    },
                    endedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'When the room ended',
                        example: '2025-05-22T07:15:33.641Z'
                    },
                    __v: {
                        type: 'integer',
                        description: 'Mongoose document version key',
                        example: 0
                    }
                },
                required: ['_id', 'roomId', 'status']
            }
        }
    }
};

const options = {
    swaggerDefinition,
    apis: [
        './middlewares/*.js', 
        './api/routes/*.js'
    ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;