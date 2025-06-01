 it('should return 400 error if parameters length not respected', async () => { 
        const shortQuestionText = generateString(QUESTION_QUESTIONTEXT_MIN_LENGTH - 1);
        const newShortQuestionText =  { 
            questionText: shortQuestionText, 
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 'answer 1',
            explanation: 'explanation',
            categoryId: '6702a8418357fa576c95ea43',        
            imageUrl: 'http//imageUrl0'
        };
        Question.prototype.save.mockResolvedValue(newShortQuestionText);
        const resShortQuestionText = await authPost(app, '/questions', newShortQuestionText);
        expect(resShortQuestionText.status).toBe(400);
        expect(resShortQuestionText.body.message).toBe('An error occurred');
        expect(resShortQuestionText.body.error).toBe('Validation failed');
        expect(resShortQuestionText.body.invalidLength).toEqual([`Question Text must be between ${QUESTION_QUESTIONTEXT_MIN_LENGTH} and ${QUESTION_QUESTIONTEXT_MAX_LENGTH} characters`]);

        const longQuestionText = generateString(QUESTION_QUESTIONTEXT_MAX_LENGTH + 1);
        const newLongQuestionText =  { 
            questionText: longQuestionText, 
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 'answer 1',
            explanation: 'explanation',
            categoryId: '6702a8418357fa576c95ea43',        
            imageUrl: 'http//imageUrl0'
        };
        Question.prototype.save.mockResolvedValue(newLongQuestionText);
        const resLongQuestionText = await authPost(app, '/questions', newLongQuestionText);
        expect(resLongQuestionText.status).toBe(400);
        expect(resLongQuestionText.body.message).toBe('An error occurred');
        expect(resLongQuestionText.body.error).toBe('Validation failed');
        expect(resLongQuestionText.body.invalidLength).toEqual([`Question Text must be between ${QUESTION_QUESTIONTEXT_MIN_LENGTH} and ${QUESTION_QUESTIONTEXT_MAX_LENGTH} characters`]);

        const shortOptions = generateString(QUESTION_ANSWER_MIX_LENGTH - 1);
        const newShortOptions =  { 
                questionText: 'Question text', 
                options: ['answer 1', 'answer 2', 'answer 3', shortOptions],
                correctAnswer: 'answer 1',
                explanation: 'explanation',
                categoryId: '6702a8418357fa576c95ea43',        
                imageUrl: 'http//imageUrl0'
        };
        Question.prototype.save.mockResolvedValue(newShortOptions);
        const resShortOptions = await authPost(app, '/questions', newShortOptions);
        expect(resShortOptions.status).toBe(400);
        expect(resShortOptions.body.message).toBe('An error occurred');
        expect(resShortOptions.body.error).toBe('Validation failed');
        expect(resShortOptions.body.invalidLength).toEqual([`All options answers must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`]);

        const longOptions = generateString(QUESTION_ANSWER_MAX_LENGTH + 1);
        const newLongOptions =  { 
                questionText: 'Question text', 
                options: ['answer 1', 'answer 2', longOptions, 'answer 4'],
                correctAnswer: 'answer 1',
                explanation: 'explanation',
                categoryId: '6702a8418357fa576c95ea43',        
                imageUrl: 'http//imageUrl0'
        };
        Question.prototype.save.mockResolvedValue(newLongOptions);
        const resLongOptions = await authPost(app, '/questions', newLongOptions);
        expect(resLongOptions.status).toBe(400);
        expect(resLongOptions.body.message).toBe('An error occurred');
        expect(resLongOptions.body.error).toBe('Validation failed');
        expect(resLongOptions.body.invalidLength).toEqual([`All options answers must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`]);

        const shortCorrectAnswer = generateString(QUESTION_ANSWER_MIX_LENGTH - 1);
        const newShortCorrectAnswer =  { 
                questionText: 'Question text', 
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: shortCorrectAnswer,
                explanation: 'explanation',
                categoryId: '6702a8418357fa576c95ea43',        
                imageUrl: 'http//imageUrl0'
        };
        Question.prototype.save.mockResolvedValue(newShortCorrectAnswer);
        const resShortCorrectAnswer = await authPost(app, '/questions', newShortCorrectAnswer);
        expect(resShortCorrectAnswer.status).toBe(400);
        expect(resShortCorrectAnswer.body.message).toBe('An error occurred');
        expect(resShortCorrectAnswer.body.error).toBe('Validation failed');
        expect(resShortCorrectAnswer.body.invalidLength).toEqual([`Correct Answer must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`]);

        const longCorrectAnswer = generateString(QUESTION_ANSWER_MAX_LENGTH + 1);
        const newLongCorrectAnswer =  { 
                questionText: 'Question text', 
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: longCorrectAnswer,
                explanation: 'explanation',
                categoryId: '6702a8418357fa576c95ea43',        
                imageUrl: 'http//imageUrl0'
        };
        Question.prototype.save.mockResolvedValue(newLongCorrectAnswer);
        const resLongCorrectAnswer = await authPost(app, '/questions', newLongCorrectAnswer);
        expect(resLongCorrectAnswer.status).toBe(400);
        expect(resLongCorrectAnswer.body.message).toBe('An error occurred');
        expect(resLongCorrectAnswer.body.error).toBe('Validation failed');
        expect(resLongCorrectAnswer.body.invalidLength).toEqual([`Correct Answer must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`]);

        const shortExplanation = generateString(QUESTION_EXPLANATION_MIN_LENGTH - 1);
        const newShortExplanation =  { 
                questionText: 'Question text', 
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 1',
                explanation: shortExplanation,
                categoryId: '6702a8418357fa576c95ea43',        
                imageUrl: 'http//imageUrl0'
        };
        Question.prototype.save.mockResolvedValue(newShortExplanation);
        const resShortExplanation = await authPost(app, '/questions', newShortExplanation);
        expect(resShortExplanation.status).toBe(400);
        expect(resShortExplanation.body.message).toBe('An error occurred');
        expect(resShortExplanation.body.error).toBe('Validation failed');
        expect(resShortExplanation.body.invalidLength).toEqual([`Explanation must be between ${QUESTION_EXPLANATION_MIN_LENGTH} and ${QUESTION_EXPLANATION_MAX_LENGTH} characters`]);

        const longExplanation = generateString(QUESTION_EXPLANATION_MAX_LENGTH + 1);
        const newLongExplanation =  { 
                questionText: 'Question text', 
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 1',
                explanation: longExplanation,
                categoryId: '6702a8418357fa576c95ea43',        
                imageUrl: 'http//imageUrl0'
        };
        Question.prototype.save.mockResolvedValue(newLongExplanation);
        const resLongExplanation = await authPost(app, '/questions', newLongExplanation);
        expect(resLongExplanation.status).toBe(400);
        expect(resLongExplanation.body.message).toBe('An error occurred');
        expect(resLongExplanation.body.error).toBe('Validation failed');
        expect(resLongExplanation.body.invalidLength).toEqual([`Explanation must be between ${QUESTION_EXPLANATION_MIN_LENGTH} and ${QUESTION_EXPLANATION_MAX_LENGTH} characters`]);

        const newInvalidCategoryId =  { 
            questionText: 'Question text', 
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 'answer 1',
            explanation: 'explanation',
            categoryId: 'invalid-format',        
            imageUrl: 'http//imageUrl0'
        };
        Question.prototype.save.mockResolvedValue(newInvalidCategoryId);
        const resInvalidCategoryId = await authPost(app, '/questions', newInvalidCategoryId);
        expect(resInvalidCategoryId.status).toBe(400);
        expect(resInvalidCategoryId.body.message).toBe('An error occurred');
        expect(resInvalidCategoryId.body.error).toBe('Validation failed');
        expect(resInvalidCategoryId.body.invalidLength).toEqual(['Invalid category ID format']);

        const shortImageUrl = generateString(QUESTION_IMAGEURL_MIN_LENGTH - 1);
        const newShortImageUrl =  { 
                questionText: 'Question text', 
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 1',
                explanation: 'explanation',
                categoryId: '6702a8418357fa576c95ea43',        
                imageUrl: shortImageUrl
        };
        Question.prototype.save.mockResolvedValue(newShortImageUrl);
        const resShortImageUrl = await authPost(app, '/questions', newShortImageUrl);
        expect(resShortImageUrl.status).toBe(400);
        expect(resShortImageUrl.body.message).toBe('An error occurred');
        expect(resShortImageUrl.body.error).toBe('Validation failed');
        expect(resShortImageUrl.body.invalidLength).toEqual([`Image Url must be between ${QUESTION_IMAGEURL_MIN_LENGTH} and ${QUESTION_IMAGEURL_MAX_LENGTH} characters`]);

        const longImageUrl = generateString(QUESTION_IMAGEURL_MAX_LENGTH + 1);
        const newLongImageUrl =  { 
                questionText: 'Question text', 
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 1',
                explanation: 'explanation',
                categoryId: '6702a8418357fa576c95ea43',        
                imageUrl: longImageUrl
        };
        Question.prototype.save.mockResolvedValue(newLongImageUrl);
        const resLongImageUrl = await authPost(app, '/questions', newLongImageUrl);
        expect(resLongImageUrl.status).toBe(400);
        expect(resLongImageUrl.body.message).toBe('An error occurred');
        expect(resLongImageUrl.body.error).toBe('Validation failed');
        expect(resLongImageUrl.body.invalidLength).toEqual([`Image Url must be between ${QUESTION_IMAGEURL_MIN_LENGTH} and ${QUESTION_IMAGEURL_MAX_LENGTH} characters`]);

        const newInvalidQuestion =  { 
                questionText: longQuestionText, 
                options: [shortOptions, longOptions, 'answer 3', 'answer 4'],
                correctAnswer: shortCorrectAnswer,
                explanation: shortExplanation,
                categoryId: 'invalid-format',        
                imageUrl: longImageUrl
        };
        Question.prototype.save.mockResolvedValue(newInvalidQuestion);
        const res = await authPost(app, '/questions', newInvalidQuestion);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Validation failed');
        expect(res.body.invalidLength).toEqual([            
            `Question Text must be between ${QUESTION_QUESTIONTEXT_MIN_LENGTH} and ${QUESTION_QUESTIONTEXT_MAX_LENGTH} characters`,
            `All options answers must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`,
            `Correct Answer must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`,
            `Explanation must be between ${QUESTION_EXPLANATION_MIN_LENGTH} and ${QUESTION_EXPLANATION_MAX_LENGTH} characters`,
            'Invalid category ID format',
            `Image Url must be between ${QUESTION_IMAGEURL_MIN_LENGTH} and ${QUESTION_IMAGEURL_MAX_LENGTH} characters`
        ]);
    });