const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const router = express.Router();
const upload = multer();
const Question = require('../models/question');
const Category = require('../models/category');


/********/
/* GET */
/********/

// Get all questions
router.get('/', async (req, res) => {
    try {
        if (req.query.categories !== undefined) {
            let categories = null;

            if (typeof req.query.categories === 'string') {
                categories = [req.query.categories];
            } else {
                categories = req.query.categories
            }

            if (Array.isArray(categories) && categories.length > 0 && categories.every(item => item !== '' && item !== null)) { 
                let categoryIdsToCheck = [];
                categories.forEach(category => {
                    categoryIdsToCheck.push(new mongoose.Types.ObjectId(category));
                });

                const questionsAll = await Question.find();
                let questions = [];
                questionsAll.forEach(question => { 
                    const includes = categoryIdsToCheck.some(id => id.toString() === question.categoryId.toString());
                    if(includes === true) {
                        questions.push(question)
                    }
                });

                return res.json(questions);
            } else {
                return res.status(500).json({
                    message: 'An error occurred',
                    error: 'Parameter categories should be an array and not contain null or empty values'
                });
            }
        }

        const questions = await Question.find();
        return res.json(questions);
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred', 
            error: err.message 
        });
    }
});

// Get all english questions
router.get('/eng', async (req, res, next) => {
    let categories;
    try {
        categories = await Category.find({ language: 'eng' });
        if (categories === null) {
            return res.status(404).json({ 
                message: 'An error occurred',
                error: 'Category not found'
            });
        }
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred',
            error: err.message 
        });
    }
    res.categories = categories;
    next();
}, async (req, res) => {

    try { 
        let questions = [];
        if (req.query.categories !== undefined) {
            let categories = null;

            if (typeof req.query.categories === 'string') {
                categories = [req.query.categories];
            } else {
                categories = req.query.categories
            }

            if (Array.isArray(categories) && categories.length > 0 && categories.every(item => item !== '' && item !== null)) {
                let categoryIdsToCheck = [];
                categories.forEach(category => {
                    categoryIdsToCheck.push(new mongoose.Types.ObjectId(category));
                });

                const questionsAll = await Question.find();
                questionsAll.forEach(question => { 
                    const includes = categoryIdsToCheck.some(id => id.toString() === question.categoryId.toString());
                    if(includes === true) {
                        questions.push(question)
                    }
                });
            } else {
                return res.status(500).json({
                    message: 'An error occurred',
                    error: 'Parameter categories should not be null'
                });
            }
        } else {
            questions = await Question.find();
        }

        let categoriesIds = [];
        res.categories.forEach(category => {
            if(category.language === 'eng') {
                categoriesIds.push(category)
            }
        });
        let englishQuestions = [];
        questions.forEach(question => {
            const includes = categoriesIds.some(category => category.categoryId.toString() === question.categoryId.toString());
            if(includes === true) {
                englishQuestions.push(question)
            }
        });
        return res.json(englishQuestions);
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred', 
            error: err.message 
        });
    }
});

// Get all french questions
router.get('/fr', async (req, res, next) => {
    let categories;
    try {     
        categories = await Category.find({ language: 'fr' });
        if (categories === null) {
            return res.status(404).json({ 
                message: 'An error occurred',
                error: 'Category not found'
            });
        }
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred',
            error: err.message 
        });
    }
    res.categories = categories;
    next();
}, async (req, res) => {
    try {
        let questions = [];
        if (req.query.categories !== undefined) {
            let categories = null;

            if (typeof req.query.categories === 'string') {
                categories = [req.query.categories];
            } else {
                categories = req.query.categories
            }

            if (Array.isArray(categories) && categories.length > 0 && categories.every(item => item !== '' && item !== null)) {
                let categoryIdsToCheck = [];
                categories.forEach(category => {
                    categoryIdsToCheck.push(new mongoose.Types.ObjectId(category));
                });

                const questionsAll = await Question.find();
                questionsAll.forEach(question => {
                    const includes = categoryIdsToCheck.some(id => id.toString() === question.categoryId.toString());
                    if(includes === true) {
                        questions.push(question)
                    }
                });
            } else {
                return res.status(500).json({
                    message: 'An error occurred',
                    error: 'Parameter categories should not be null'
                });
            }
        } else {
            questions = await Question.find();
        }
        let categoriesIds = [];
        res.categories.forEach(category => {
            if(category.language === 'fr') {
                categoriesIds.push(category)
            }
        });
        let frenchQuestions = [];
        questions.forEach(question => {
            const includes = categoriesIds.some(category => category.categoryId.toString() === question.categoryId.toString());
            if(includes === true) {
                frenchQuestions.push(question)
            }
        });
        return res.json(frenchQuestions);
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred', 
            error: err.message 
        });
    }
});

// Get random array of questions of length size
router.get('/random/:random?', async (req, res) => {
    // Check for missing parameters random
    const { random } = req.params;
    if (random === undefined) {
        return res.status(404).json({ 
            message: 'An error occurred', 
            error: 'Parameter is required' 
        });
    }

    // Check if random parameter is a number and positif
    const length = parseInt(random, 10);
    if (isNaN(length) || length < 1) {
        return res.status(404).json({ 
            message: 'An error occurred', 
            error: 'Parameter must be a positive number' 
        });
    }

    try {
        let questions = [];

        if (req.query.categories !== undefined) {
            let categories = null;

            if (typeof req.query.categories === 'string') {
                categories = [req.query.categories];
            } else {
                categories = req.query.categories
            }
            
            if (Array.isArray(categories) && categories.length > 0 && categories.every(item => item !== '' && item !== null)) {
                let categoryIdsToCheck = [];
                categories.forEach(category => {
                    categoryIdsToCheck.push(new mongoose.Types.ObjectId(category));
                });

                const questionsAll = await Question.find();
                questionsAll.forEach(question => {
                    const includes = categoryIdsToCheck.some(id => id.toString() === question.categoryId.toString());
                    if(includes === true) {
                        questions.push(question)
                    }
                });
            } else {
                return res.status(500).json({
                    message: 'An error occurred',
                    error: 'Parameter categories should not be null'
                });
            }
        } else {
            questions = await Question.find();
        }
        const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffledQuestions.slice(0, length);
        return res.json(selectedQuestions);
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred', 
            error: err.message 
        });
    } 
});

// Get stats questions for each categories
router.get('/stats/:lang?', async (req, res, next) => {
    let categories;
    try {
        categories = await Category.find();
        if (categories === null) {
            return res.status(404).json({ 
                message: 'An error occurred',
                error: 'Category not found'
            });
        }
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred',
            error: err.message 
        });
    }
    res.categories = categories;
    next();
}, async (req, res) => {
    const language = req.params.lang || 'all';

    let categories = [];
    if (language === 'all') {
        categories = res.categories;
    } else {
        const categoriesAll = res.categories;
        categoriesAll.forEach(category => {
            if(category.language === language) {
                categories.push(category);
            }
        });

        if (categories.length === 0) {
            return res.status(404).json({
                message: 'An error occurred',
                error: 'Parameter lang is not a valid parameter',
                invalidParams: {
                    language: req.params.lang
                }
            });
        }
    } 

    try {
        const categoriesIds = new Set(categories.map(item => item.categoryId.toString()));
        const questions = await Question.find();
        const filteredQuestions = questions.filter(item => categoriesIds.has(item.categoryId.toString()));

        const categoryCount = {};
        // Loop through the filtered questions and count occurrences of each categoryId
        filteredQuestions.forEach(item => {
            const categoryId = item.categoryId.toString();
            categoryCount[categoryId] = (categoryCount[categoryId] || 0) + 1;
        });

        // Convert the count object to the desired format
        const stats = Object.keys(categoryCount).map(categoryId => {
            const category = categories.find(cat => cat.categoryId.toString() === categoryId);
            return {
                name: category.name,
                categoryId: categoryId,
                occurence: categoryCount[categoryId],
            };
        });

        return res.json(stats);
    } catch (err) {
        return res.status(500).json({
            message: 'An error occurred',
            error: err.message
        });
    }
});

// Get one question
router.get('/:id', async (req, res, next) => {
    let question;
    try {
        question = await Question.findById(req.params.id);
        if (question === null) {
            return res.status(404).json({ 
                message: 'An error occurred', 
                error: 'Question not found' 
            });
        }
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred', 
            error: err.message 
        });
    }
    res.question = question;
    next();
}, (req, res) => {
    return res.json(res.question);
});


/********/
/* POST */
/********/

// Create a new question
router.post('/', async (req, res, next) => {
    let categories;
    try { 
        categories = await Category.find();
        if (categories === null) {
            return res.status(404).json({ 
                message: 'An error occurred',
                error: 'Category not found'
            });
        }
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred',
            error: err.message 
        });
    }
    res.categories = categories;
    next();
}, async (req, res) => { 
    // Check for missing parameters
    const missingParams = [];
    const requiredParams = ['questionText', 'options', 'correctAnswer', 'categoryId', 'imageUrl'];

    requiredParams.forEach(param => {
        if (req.body[param] === undefined || req.body[param] === null || req.body[param] === '') {
            missingParams.push(param);
        }
    });

    if (missingParams.length > 0) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Missing parameters',
            missing: missingParams
        });
    }

    // Check if options parameter is an array and has exactly 4 elements
    if (!Array.isArray(req.body.options) || req.body.options.length !== 4) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Options must be an array of exactly 4 elements',
            invalidParams: {
                options: req.body.options
            }
        });
    }

    // Check for null or empty elements in options parameter
    const hasInvalidOptions = req.body.options.some(option => option === null || option === '');
    if (hasInvalidOptions) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Options cannot contain null or empty elements',
            invalidParams: {
                options: req.body.options
            }
        });
    }

    // Check for unique options
    const uniqueOptions = new Set(req.body.options);
    if (uniqueOptions.size !== req.body.options.length) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Options must be unique',
            invalidParams: {
                options: req.body.options
            }
        });
    }

    // Check if rest of parameters are strings
    const invalidParams = {};
    if (typeof req.body.questionText !== 'string') {
        invalidParams.questionText = req.body.questionText;
    }
    if (typeof req.body.correctAnswer !== 'string') {
        invalidParams.correctAnswer = req.body.correctAnswer;
    }
    if (req.body.explanation !== undefined && typeof req.body.explanation !== 'string') {
        invalidParams.explanation = req.body.explanation;
    }
    if (typeof req.body.categoryId !== 'string') {
        invalidParams.categoryId = req.body.categoryId;
    }
    if (typeof req.body.imageUrl !== 'string') {
        invalidParams.imageUrl = req.body.imageUrl;
    }

    // If there are invalid parameters, return an error response
    if (Object.keys(invalidParams).length > 0) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Parameters must be strings',
            invalidParams
        });
    }

    // Check if correctAnswer parameter is included in options parameter
    if (!req.body.options.includes(req.body.correctAnswer)) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Correct answer must be one of the options',
            invalidParams: {
                correctAnswer: req.body.correctAnswer
            }
        });
    }

    try {
        // Check if categoryId parameters exists in the Category collection
        const categoryExists = res.categories.some(c =>  c.categoryId.toString() === req.body.categoryId);
        if (!categoryExists) {
            return res.status(400).json({
                message: 'An error occurred',
                error: 'Invalid categoryId. Category does not exist',
                invalidParams: {
                    categoryId: req.body.categoryId
                }
            });
        }

        const question = new Question({
            questionText: req.body.questionText,
            options: req.body.options,
            correctAnswer: req.body.correctAnswer,
            explanation: req.body.explanation,
            categoryId: req.body.categoryId,
            imageUrl: req.body.imageUrl
        });

        const newQuestion = await question.save();
        return res.status(201).json(newQuestion);
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred', 
            error: err.message 
        });
    }
});

// Create a list of questions
router.post('/bulk', async (req, res, next) => { 
    let categories;
    try {
        categories = await Category.find();
        if (categories === null) {
            return res.status(404).json({ 
                message: 'An error occurred',
                error: 'Category not found'
            });
        }
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred',
            error: err.message 
        });
    }
    res.categories = categories;
    next();
}, async (req, res) => { 
    const questions = req.body.questions;

    // Check if the request body is a non-empty array
    if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Questions must be a non-empty array'
        });
    }

    // Start a session for the transaction
    const session = await Question.startSession();
    session.startTransaction();

    try {
        const errors = [];

        for (const questionData of questions) {
            // Check for missing parameters
            const missingParams = [];
            const requiredParams = ['questionText', 'options', 'correctAnswer', 'categoryId', 'imageUrl'];

            requiredParams.forEach(param => {
                if (questionData[param] === undefined || questionData[param] === null || questionData[param] === '') {
                    missingParams.push(param);
                }
            });

            if (missingParams.length > 0) {
                errors.push({
                    error: 'Missing parameters',
                    question: questionData,
                    missing: missingParams
                });
            }

            if (!missingParams.includes('options') && (!Array.isArray(questionData.options) || questionData.options.length !== 4)) {
                errors.push({
                    error: 'Options must be an array of exactly 4 elements',
                    question: questionData,
                    invalidParams: {
                        options: questionData.options
                    }
                });
            }

            if(!missingParams.includes('options')) {
                const hasInvalidOptions = questionData.options.some(option => option === null || option === '');
                if (hasInvalidOptions) {
                    errors.push({
                        error: 'Options cannot contain null or empty elements',
                        question: questionData,
                        invalidParams: {
                            options: questionData.options
                        }
                    });
                }
            }

            if(!missingParams.includes('options')) {
                const uniqueOptions = new Set(questionData.options);
                if (uniqueOptions.size !== questionData.options.length) {
                    errors.push({ 
                        error: 'Options must be unique',
                        question: questionData,
                        invalidParams: {
                            options: questionData.options
                        }
                    });
                }
            }

            const invalidParams = {};
            if (!missingParams.includes('questionText') && typeof questionData.questionText !== 'string') {
                invalidParams.questionText = questionData.questionText;
            }
            if (!missingParams.includes('correctAnswer') && typeof questionData.correctAnswer !== 'string') {
                invalidParams.correctAnswer = questionData.correctAnswer;
            }
            if (!missingParams.includes('explanation') && questionData.explanation !== undefined && typeof questionData.explanation !== 'string') {
                invalidParams.explanation = questionData.explanation;
            }
            if (!missingParams.includes('categoryId') && typeof questionData.categoryId !== 'string') {
                invalidParams.categoryId = questionData.categoryId;
            }
            if (!missingParams.includes('imageUrl') && typeof questionData.imageUrl !== 'string') {
                invalidParams.imageUrl = questionData.imageUrl;
            }
            
            if (Object.keys(invalidParams).length > 0) {
                errors.push({
                    error: 'Parameters must be strings',
                    question: questionData,
                    invalidParams
                });
            }

            if (!missingParams.includes('options') && !missingParams.includes('correctAnswer') && 
                invalidParams.correctAnswer === undefined && questionData.correctAnswer !== undefined && 
                !questionData.options.includes(questionData.correctAnswer)
            ) {
                errors.push({
                    error: 'Correct answer must be one of the options',
                    question: questionData,
                    invalidParams: {
                        correctAnswer: questionData.correctAnswer
                    }
                });
            }

            if (!missingParams.includes('categoryId') && !invalidParams.hasOwnProperty('categoryId')) {
                // Validate categoryId
                const categoryExists = res.categories.some(c => c.categoryId.toString() === questionData.categoryId);
                if (!categoryExists) {
                    errors.push({
                        question: questionData,
                        error: 'Invalid categoryId. Category does not exist',
                        invalidParams: {
                            categoryId: questionData.categoryId
                        }
                    });
                }
            }
        }

        if (errors.length > 0) {
            await session.abortTransaction();
            return res.status(400).json({ 
                message: 'Some questions could not be processed', 
                length: errors.length, 
                errors: errors
            });
        }

        const createdQuestions = [];
        for (const questionData of questions) {
            const question = new Question({
                questionText: questionData.questionText,
                options: questionData.options,
                correctAnswer: questionData.correctAnswer,
                explanation: questionData.explanation,
                categoryId: questionData.categoryId,
                imageUrl: questionData.imageUrl
            });

            const newQuestion = await question.save({ session });
            createdQuestions.push(newQuestion);
        }

        await session.commitTransaction();
        return res.status(201).json({ 
            message: 'Questions created successfully', 
            questions: createdQuestions
        });
    } catch (err) {
        await session.abortTransaction();
        return res.status(500).json({ 
            message: 'An error occurred',
            error: err.message 
        });
    } finally {
        session.endSession();
    }
});

// Create a list of questions from csv
router.post('/csv', upload.single('questions'), async (req, res, next) => { 
    let categories;
    try { 
        categories = await Category.find();
        if (categories === null) {
            return res.status(404).json({ 
                message: 'An error occurred',
                error: 'Category not found'
            });
        }
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred',
            error: err.message 
        });
    }
    res.categories = categories;
    next();
}, async (req, res) => {
    try {
        const csvData = req.file.buffer.toString();
        
        // Function to transform CSV to array of objects
        const csvToArray = (csv) => {
            const lines = csv.trim().split('\n');
            const headers = lines[0].split(';');

            return lines.slice(1).map(line => {
                const values = line.split(';');
                return headers.reduce((obj, header, index) => {
                    obj[header.trim()] = values[index].trim();
                    return obj;
                }, {});
            });
        };

        const questions = csvToArray(csvData);

        // Check if the request body is a non-empty array
        if (questions.length === 0) {
            return res.status(400).json({
                message: 'An error occurred',
                error: 'Questions must be a non-empty array'
            });
        }

        // Start a session for the transaction
        const session = await Question.startSession();
        session.startTransaction();

        try {
            const errors = [];

            for (const questionData of questions) {
                // Check for missing parameters
                const missingParams = [];
                const requiredParams = ['questionText', 'correctAnswer', 'categoryId', 'imageUrl'];

                requiredParams.forEach(param => {
                    if (questionData[param] === '') {
                        missingParams.push(param);
                    }
                });

                if(questionData.options != '[]') {
                    questionData.options = questionData.options.slice(1, -1).split(',').map(options => options.trim());

                    if (!Array.isArray(questionData.options) || questionData.options.length !== 4) {
                        errors.push({
                            error: 'Options must be an array of exactly 4 elements',
                            question: questionData,
                            invalidParams: {
                                options: questionData.options
                            }
                        });
                    }

                    const hasInvalidOptions = questionData.options.some(option => option === '');
                    if (hasInvalidOptions) {
                        errors.push({
                            error: 'Options cannot contain null or empty elements',
                            question: questionData,
                            invalidParams: {
                                options: questionData.options
                            }
                        });
                    }
                    
                    const uniqueOptions = new Set(questionData.options);
                    if (uniqueOptions.size !== questionData.options.length) {
                        errors.push({
                            error: 'Options must be unique',
                            question: questionData,
                            invalidParams: {
                                options: questionData.options
                            }
                        });
                    }

                    if (questionData.correctAnswer !== '' && !questionData.options.includes(questionData.correctAnswer)) {
                        errors.push({
                            error: 'Correct answer must be one of the options',
                            question: questionData,
                            invalidParams: {
                                correctAnswer: questionData.correctAnswer
                            }
                        });
                    }
                } else {
                    missingParams.push('options');
                }

                if (missingParams.length > 0) {
                    errors.push({
                        error: 'Missing parameters',
                        question: questionData,
                        missing: missingParams
                    });
                }

                if (!missingParams.includes('categoryId')) {
                    // Validate categoryId
                    const categoryExists = res.categories.some(c => c.categoryId.equals(new mongoose.Types.ObjectId(questionData.categoryId)));
                    if (!categoryExists) {
                        errors.push({
                            question: questionData,
                            error: 'Invalid categoryId. Category does not exist',
                            invalidParams: {
                                categoryId: questionData.categoryId
                            }
                        });
                    }
                }
            }

            if (errors.length > 0) {
                await session.abortTransaction();
                return res.status(400).json({ 
                    message: 'Some questions could not be processed', 
                    length: errors.length, 
                    errors: errors
                });
            }

            const createdQuestions = [];
            for (const questionData of questions) {
                const question = new Question({
                    questionText: questionData.questionText,
                    options: questionData.options,
                    correctAnswer: questionData.correctAnswer,
                    explanation: questionData.explanation,
                    categoryId: questionData.categoryId,
                    imageUrl: questionData.imageUrl
                });

                const newQuestion = await question.save({ session });
                createdQuestions.push(newQuestion);
            }

            await session.commitTransaction();
            return res.status(201).json({ 
                message: 'Questions created successfully', 
                questions: createdQuestions
            });
        } catch (err) {
            await session.abortTransaction();
            return res.status(500).json({ 
                message: 'An error occurred',
                error: err.message 
            });
        } finally {
            session.endSession();
        }

    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred',
            error: 'Failed to process CSV'
        });
    }
})


/********/
/* UPDATE */
/********/

// Change toutes les id d'une categorie à une autre
router.patch('/categories//', async (req, res) =>{
    return res.status(400).json({ 
        message: 'An error occurred',
        error: 'Both oldCategoryId and newCategoryId are required' 
    });
});
router.patch('/categories//:newCategoryId', async (req, res) =>{
    return res.status(400).json({ 
        message: 'An error occurred',
        error: 'Both oldCategoryId and newCategoryId are required' 
    });
});
router.patch('/categories/:oldCategoryId/', async (req, res) =>{
    return res.status(400).json({ 
        message: 'An error occurred',
        error: 'Both oldCategoryId and newCategoryId are required' 
    });
});
router.patch('/categories/:oldCategoryId/:newCategoryId?', async (req, res, next) => {
    let questions;
    let categories;
    try {
        questions = await Question.find();
        if (questions === null) {
            return res.status(404).json({ 
                message: 'An error occurred',
                error: 'Questions not found'
            });
        }

        categories = await Category.find();
        if (categories === null) {
            return res.status(404).json({ 
                message: 'An error occurred',
                error: 'Category not found'
            });
        }
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred',
            error: err.message 
        });
    }
    res.questions = questions;
    res.categories = categories;
    next();
}, async (req, res) => {
    // Check if rest of oldCategoryId and newCategoryId are valid for mongoose
    const invalidParams = {};

    if (!mongoose.Types.ObjectId.isValid(req.params.oldCategoryId)) {
        invalidParams.oldCategoryId = req.params.oldCategoryId;
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.newCategoryId)) {
        invalidParams.newCategoryId = req.params.newCategoryId;
    }

    if (Object.keys(invalidParams).length > 0) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Invalid ObjectId format',
            invalidParams
        });
    }

    // Check if oldCategoryId and newCategoryId are different
    if (req.params.oldCategoryId === req.params.newCategoryId) {
        return res.status(200).json({
            message: 'No change occured;oldCategoryId and newCategoryId are the same'
        });
    }

    // Check if oldCategoryId exists in the list of questions
    const oldCategoryExists = res.questions.some(q => q.categoryId.toString() === req.params.oldCategoryId);
    if (!oldCategoryExists) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'oldCategoryId does not exist in any questions'
        });
    } 

    // Check if newCategoryId exist somewhere in Categories
    const categoryExists = res.categories.some(c => c.categoryId.toString() === req.params.newCategoryId);
    if (!categoryExists) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Invalid categoryId. Category does not exist',
            invalidParams: {
                categoryId: req.params.newCategoryId
            }
        });
    } 
 
    try {
        await Question.updateMany(
            { categoryId: req.params.oldCategoryId }, 
            { 
                $set: {
                    categoryId: req.params.newCategoryId,
                    updatedAt: new Date()
                }
            }
        );
        const updatedCategories = await Question.find({ categoryId: req.params.newCategoryId });

        return res.status(201).json({ 
            message: 'CategoryId updated successfully', 
            categories: updatedCategories
        });
    } catch (error) {
        return res.status(500).json({ 
            message: 'An error occurred while updating CategoryId', 
            error: error.message
        });
    }
});

// Update question
router.patch('/:id', async (req, res, next) => {
    let question;
    let categories;
    try {
        question = await Question.findById(req.params.id);
        if (question === null) {
            return res.status(404).json({ 
                message: 'An error occurred',
                error: 'Question not found'
            });
        }

        categories = await Category.find();
        if (categories === null) {
            return res.status(404).json({ 
                message: 'An error occurred',
                error: 'Category not found'
            });
        }
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred',
            error: err.message 
        });
    }
    res.question = question;
    res.categories = categories;
    next();
}, async (req, res) => {
    let updated = false;

    try {
        // Check options parameter if provided
        if (req.body.options !== undefined && req.body.options !== null) {
            
            // Check if options parameters is an array and has exactly 4 elements
            if (!Array.isArray(req.body.options) || req.body.options.length !== 4) {
                return res.status(400).json({
                    message: 'An error occurred',
                    error: 'Options must be an array of exactly 4 elements',
                    invalidParams: {
                        options: req.body.options
                    }
                });
            }

            // Check for null or empty elements in options parameters
            const hasInvalidOptions = req.body.options.some(option => option === null || option === '');
            if (hasInvalidOptions) {
                return res.status(400).json({
                    message: 'An error occurred',
                    error: 'Options cannot contain null or empty elements',
                    invalidParams: {
                        options: req.body.options
                    }
                });
            }  

            // Check if every option is unique
            const uniqueOptions = new Set(req.body.options);
            if (uniqueOptions.size !== req.body.options.length) {
                return res.status(400).json({
                    message: 'An error occurred',
                    error: 'Options must be unique',
                    invalidParams: {
                        options: req.body.options
                    }
                });
            }

            // Check if correctAnswer parameters is included in options
            if (!req.body.options.includes(res.question.correctAnswer) && req.body.correctAnswer === undefined) {
                return res.status(400).json({
                    message: 'An error occurred',
                    error: 'Correct answer must be one of the options',
                    invalidParams: {
                        options: req.body.options,
                        correctAnswer: res.question.correctAnswer
                    }
                });
            }

            // Check if option parameters was updated
            if (req.body.options !== null && JSON.stringify(req.body.options) !== JSON.stringify(res.question.options)) {
                res.question.options = req.body.options;
                updated = true;
            }
        }    

        // Check if rest of parameter are strings
        const invalidParams = {};
        
        // Check if rest of parameters are strings
        if (req.body.questionText !== undefined && req.body.questionText !== null && req.body.questionText !== '' && typeof req.body.questionText !== 'string') {
            invalidParams.questionText = req.body.questionText;
        }
        if (req.body.correctAnswer !== undefined && req.body.correctAnswer !== null && req.body.correctAnswer !== '' && typeof req.body.correctAnswer !== 'string') {
            invalidParams.correctAnswer = req.body.correctAnswer;
        }
        if (req.body.explanation !== undefined && req.body.explanation !== null && req.body.explanation !== '' && typeof req.body.explanation !== 'string') {
            invalidParams.explanation = req.body.explanation;
        }    
        if (req.body.categoryId !== undefined && req.body.categoryId !== null && req.body.categoryId !== '' && typeof req.body.categoryId !== 'string') {
            invalidParams.categoryId = req.body.categoryId;
        }
        if (req.body.imageUrl !== undefined && req.body.imageUrl !== null && req.body.imageUrl !== '' && typeof req.body.imageUrl !== 'string') {
            invalidParams.imageUrl = req.body.imageUrl;
        }
        
        // If there are invalid parameters, return an error response
        if (Object.keys(invalidParams).length > 0) {
            return res.status(400).json({
                message: 'An error occurred',
                error: 'Parameters must be strings',
                invalidParams
            });
        }

        // Check if correctAnswer parameters is included in options
        if (req.body.correctAnswer !== undefined && req.body.correctAnswer !== null
            && req.body.options === undefined
            && !res.question.options.includes(req.body.correctAnswer) ) {
            return res.status(400).json({
                message: 'An error occurred',
                error: 'Correct answer must be one of the options',
                invalidParams: {
                    options: res.question.options,
                    correctAnswer: req.body.correctAnswer
                }
            });
        } else if (req.body.correctAnswer !== undefined && req.body.correctAnswer !== null
            && req.body.options !== undefined && req.body.options !== null
            && !req.body.options.includes(req.body.correctAnswer) ) {
            return res.status(400).json({
                message: 'An error occurred',
                error: 'Correct answer must be one of the options',
                invalidParams: {
                    options: req.body.options,
                    correctAnswer: req.body.correctAnswer
                }
            });
        }

        // Check categoryId parameter if provided
        if (req.body.categoryId !== undefined && req.body.categoryId !== null) { 
            // Validate categoryId
            const categoryExists = res.categories.some(c => c.categoryId.toString() === req.body.categoryId);
            if (!categoryExists) {
                return res.status(400).json({
                    message: 'An error occurred',
                    error: 'Invalid categoryId. Category does not exist',
                    invalidParams: {
                        categoryId: req.body.categoryId
                    }
                });
            }
            // Check if categoryId parameter was updated
            if (req.body.categoryId !== res.question.categoryId.toString()) {
                res.question.categoryId = req.body.categoryId;
                updated = true;
            }
        }

        if (req.body.questionText !== undefined && req.body.questionText !== null && req.body.questionText !== res.question.questionText) {
            res.question.questionText = req.body.questionText;
            updated = true;
        }
        if (req.body.correctAnswer !== undefined && req.body.correctAnswer !== null && req.body.correctAnswer !== res.question.correctAnswer) { 
            res.question.correctAnswer = req.body.correctAnswer;
            updated = true;
        }
        if (req.body.explanation !== undefined && req.body.explanation !== null && req.body.explanation !== res.question.explanation) {
            res.question.explanation = req.body.explanation;
            updated = true;
        }
        if (req.body.imageUrl !== undefined && req.body.imageUrl !== null && req.body.imageUrl !== res.question.imageUrl) {
            res.question.imageUrl = req.body.imageUrl;
            updated = true;
        }
        
        if (!updated) {
            return res.status(200).json({
                message: 'No fields were updated' 
            });
        }

        // Update the updatedAt field to the current time
        res.question.updatedAt = new Date();
        
        const updatedQuestion = await res.question.save();
        return res.json(updatedQuestion);
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred',
            error: err.message
        });
    }
});


/********/
/* DELETE */
/********/

// Delete all questions
router.delete('/all', async (req, res) => {
    try {
        const result = await Question.deleteMany({});

        return res.json({
            message: 'All questions deleted',
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        return res.status(500).json({
            message: 'An error occurred',
            error: err.message,
        });
    }
});

// Delete question
router.delete('/:id', async (req, res, next) => {
    let question;
    try {
        question = await Question.findById(req.params.id);
        if (question === null) {
            return res.status(404).json({
                message: 'An error occurred',
                error: 'Question not found' 
            });
        }
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred',
            error: err.message
        });
    }
    res.question = question;
    next();
}, async (req, res) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
        
        if (!deletedQuestion) {
            return res.status(404).json({ 
                message: 'An error occurred',
                error: 'Question not found'
            });
        }

        return res.json({
            message: 'Question deleted',
            deletedQuestion: {
                _id: deletedQuestion._id,
                questionText: deletedQuestion.questionText,
                options: deletedQuestion.options,
                correctAnswer: deletedQuestion.correctAnswer,
                explanation: deletedQuestion.explanation,
                categoryId: deletedQuestion.categoryId,
                imageUrl: deletedQuestion.imageUrl,
                createdAt: deletedQuestion.createdAt,
                updatedAt: deletedQuestion.updatedAt,
                __v: deletedQuestion.__v
            }
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'An error occurred',
            error: err.message 
        });
    }
});

module.exports = router;