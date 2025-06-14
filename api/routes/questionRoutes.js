const { QUESTION_QUESTIONTEXT_MIN_LENGTH, QUESTION_QUESTIONTEXT_MAX_LENGTH, QUESTION_MAX_OPTIONS,
    QUESTION_ANSWER_MIX_LENGTH, QUESTION_ANSWER_MAX_LENGTH, QUESTION_EXPLANATION_MIN_LENGTH, 
    QUESTION_EXPLANATION_MAX_LENGTH, QUESTION_IMAGEURL_MIN_LENGTH, QUESTION_IMAGEURL_MAX_LENGTH } = require('../../config/apiConfig');
// Core modules
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
// Custom middlewares and models
const authenticateToken = require('../../middlewares/authenticateToken');
const Question = require('../models/question');
const Category = require('../models/category');
// Router and upload setup
const router = express.Router();
const upload = multer();
// Utility functions
const { checkMissingParams, checkInvalidTypes, validateStringLength } = require('../../utils/validators');

const EXPECTED_TYPES = {
    questionText: 'string',
    explanation: 'string',
    options: 'string',
    correctAnswer: 'string',
    categoryId: 'string',
    imageUrl: 'string'
};

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: API for questions
 */

/********/
/* GET */
/********/
/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Retrieve all questions or filter by category IDs
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: categories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *         style: form
 *         explode: true
 *         description: Filter questions by one or more category IDs (MongoDB ObjectId)
 *         example: ["67c747aaf2b67cb4de5c3f05", "67ca1bd9fa661fcb08480484"]
 *     responses:
 *       200:
 *         description: A list of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       500:
 *         description: Server error or invalid category query format
 */
router.get('/', async (req, res) => {
    try {
        if (req.query.categories !== undefined) {
            let categories = null;

            if (typeof req.query.categories === EXPECTED_TYPES.categoryId) {
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

/**
 * @swagger
 * /questions/eng:
 *   get:
 *     summary: Retrieve English-language questions, optionally filtered by category IDs
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: categories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *         style: form
 *         explode: true
 *         description: Filter English-language questions by one or more category IDs (MongoDB ObjectId)
 *         example: ["67c747aaf2b67cb4de5c3f05", "67ca1bd9fa661fcb08480484"]
 *     responses:
 *       200:
 *         description: A list of English-language questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       500:
 *         description: Server error or invalid category query format
 */
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

            if (typeof req.query.categories === EXPECTED_TYPES.categoryId) {
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

/**
 * @swagger
 * /questions/fr:
 *   get:
 *     summary: Retrieve French-language questions, optionally filtered by category IDs
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: categories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *         style: form
 *         explode: true
 *         description: Filter French-language questions by one or more category IDs (MongoDB ObjectId)
 *         example: ["67c747aaf2b67cb4de5c3f05", "67ca1bd9fa661fcb08480484"]
 *     responses:
 *       200:
 *         description: A list of French-language questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       404:
 *         description: No French-language categories found
 *       500:
 *         description: Server error or invalid category query format
 */
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

            if (typeof req.query.categories === EXPECTED_TYPES.categoryId) {
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

/**
 * @swagger
 * /questions/random/{random}:
 *   get:
 *     summary: Retrieve a random selection of questions
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: random
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of random questions to return (1–50)
 *       - in: query
 *         name: categories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *         style: form
 *         explode: true
 *         description: Optional category ID filter
 *     responses:
 *       200:
 *         description: A list of randomly selected questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       404:
 *         description: Missing or invalid `random` parameter
 *       500:
 *         description: Server error or invalid query format
 */
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
    if (isNaN(length) || length < 1 || length > 50) {
        return res.status(404).json({ 
            message: 'An error occurred', 
            error: 'Parameter must be a positive number and under 50' 
        });
    }

    try {
        let questions = [];

        if (req.query.categories !== undefined) {
            let categories = null;

            if (typeof req.query.categories === EXPECTED_TYPES.categoryId) {
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

/**
 * @swagger
 * /questions/stats:
 *   get:
 *     summary: Get question count
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: Statistics about question occurrences per category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the category
 *                     example: Geography
 *                   categoryId:
 *                     type: string
 *                     format: objectId
 *                     description: ID of the category
 *                   occurence:
 *                     type: integer
 *                     description: Number of questions in this category
 *       404:
 *         description: Language not found or no categories for the specified language
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /questions/stats/{lang}:
 *   get:
 *     summary: Get question count per category
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: lang
 *         required: false
 *         schema:
 *           type: string
 *           example: eng
 *         description: Optional language code to filter categories (e.g. 'eng', 'fr'); defaults to all languages
 *     responses:
 *       200:
 *         description: Statistics about question occurrences per category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the category
 *                     example: Geography
 *                   categoryId:
 *                     type: string
 *                     format: objectId
 *                     description: ID of the category
 *                   occurence:
 *                     type: integer
 *                     description: Number of questions in this category
 *       404:
 *         description: Language not found or no categories for the specified language
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     summary: Get a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID of the question to retrieve
 *     responses:
 *       200:
 *         description: Question found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         description: Invalid question ID format
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Invalid question ID format'
        });
    }

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
/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionText
 *               - options
 *               - correctAnswer
 *               - categoryId
 *               - imageUrl
 *             properties:
 *               questionText:
 *                 type: string
 *                 description: The text of the question
 *               options:
 *                 type: array
 *                 description: Array of possible answer options (must be unique and exactly 4)
 *                 items:
 *                   type: string
 *               correctAnswer:
 *                 type: string
 *                 description: The correct answer (must be one of the options)
 *               explanation:
 *                 type: string
 *                 description: Optional explanation for the correct answer
 *               categoryId:
 *                 type: string
 *                 description: The category ID the question belongs to
 *               imageUrl:
 *                 type: string
 *                 description: Image URL for the question
 *     responses:
 *       201:
 *         description: Question created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, async (req, res, next) => {
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
    const requiredParams = ['questionText', 'options', 'correctAnswer', 'categoryId', 'imageUrl'];
    const missingParams = checkMissingParams(req.body, requiredParams);

    if (missingParams.length > 0) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Missing parameters',
            missing: missingParams
        });
    }

    // Check if options parameter is an array and has exactly QUESTION_MAX_OPTIONS elements
    if (!Array.isArray(req.body.options) || req.body.options.length !== QUESTION_MAX_OPTIONS) {
        return res.status(400).json({
            message: 'An error occurred',
            error: `Options must be an array of exactly ${QUESTION_MAX_OPTIONS} elements`,
            invalidParams: {
                options: req.body.options
            }
        });
    }

    // Check for invalid elements in options parameter
    const hasInvalidOptions = req.body.options.some(option => option === null || option === '' || typeof option !== EXPECTED_TYPES.options);
    if (hasInvalidOptions) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Options are in wrong format, it\'s cannot contain null or empty elements either',
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

    // Check if parameters are  in valid format
    const expectedTypes = Object.fromEntries(
        Object.entries(EXPECTED_TYPES).filter(([key]) => key !== 'options')
    );
    const invalidParams = checkInvalidTypes(req.body, expectedTypes);
    if (req.body.explanation !== undefined && typeof req.body.explanation !== EXPECTED_TYPES.explanation) {
        invalidParams.explanation = req.body.explanation;
    }

    if (Object.keys(invalidParams).length > 0) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Parameters are in wrong formats',
            invalidParams
        });
    }

    // Performance and abuse safeguard
    const invalidLength = [];

    const questionTextError = validateStringLength('Question Text', req.body.questionText, QUESTION_QUESTIONTEXT_MIN_LENGTH, QUESTION_QUESTIONTEXT_MAX_LENGTH);
    if (questionTextError) {
        invalidLength.push(questionTextError);
    }
    const optionsError = req.body.options.some(option => option.length < QUESTION_ANSWER_MIX_LENGTH || option.length > QUESTION_ANSWER_MAX_LENGTH);
    if (optionsError) {
        invalidLength.push(`All options answers must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`);
    }
    const correctAnswerError = validateStringLength('Correct Answer', req.body.correctAnswer, QUESTION_ANSWER_MIX_LENGTH, QUESTION_ANSWER_MAX_LENGTH);
    if (correctAnswerError) {
        invalidLength.push(correctAnswerError);
    }    
    const explanationError = validateStringLength('Explanation', req.body.explanation, QUESTION_EXPLANATION_MIN_LENGTH, QUESTION_EXPLANATION_MAX_LENGTH);
    if (explanationError) {
        invalidLength.push(explanationError);
    }
    if (!mongoose.Types.ObjectId.isValid(req.body.categoryId)) {
        invalidLength.push('Invalid category ID format');
    }
    const imageUrlError = validateStringLength('Image Url', req.body.imageUrl, QUESTION_IMAGEURL_MIN_LENGTH, QUESTION_IMAGEURL_MAX_LENGTH);
    if (imageUrlError) {
        invalidLength.push(imageUrlError);
    }
        
    if (invalidLength.length > 0) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Validation failed',
            invalidLength
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

/**
 * @swagger
 * /questions/bulk:
 *   post:
 *     summary: Create multiple questions in bulk
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questions
 *             properties:
 *               questions:
 *                 type: array
 *                 description: List of questions to be created
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionText
 *                     - options
 *                     - correctAnswer
 *                     - categoryId
 *                     - imageUrl
 *                   properties:
 *                     questionText:
 *                       type: string
 *                       description: The text of the question
 *                     options:
 *                       type: array
 *                       description: Array of possible answer options (must be unique and exactly 4)
 *                       items:
 *                         type: string
 *                     correctAnswer:
 *                       type: string
 *                       description: The correct answer (must be one of the options)
 *                     explanation:
 *                       type: string
 *                       description: Optional explanation for the correct answer
 *                     categoryId:
 *                       type: string
 *                       description: The category ID the question belongs to
 *                     imageUrl:
 *                       type: string
 *                       description: Image URL for the question
 *     responses:
 *       201:
 *         description: Questions created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Questions created successfully
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *       400:
 *         description: Bad request - validation errors in input data
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.post('/bulk', authenticateToken, async (req, res, next) => { 
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
            const requiredParams = ['questionText', 'options', 'correctAnswer', 'categoryId', 'imageUrl'];
            const missingParams = checkMissingParams(questionData, requiredParams);

            if (missingParams.length > 0) {
                errors.push({
                    error: 'Missing parameters',
                    question: questionData,
                    missing: missingParams
                });
            }

            if (!missingParams.includes('options') && (!Array.isArray(questionData.options) || questionData.options.length !== QUESTION_MAX_OPTIONS)) {
                errors.push({
                    error: `Options must be an array of exactly ${QUESTION_MAX_OPTIONS} elements`,
                    question: questionData,
                    invalidParams: {
                        options: questionData.options
                    }
                });
            }

            if(!missingParams.includes('options')) {
                const hasInvalidOptions = questionData.options.some(option => option === null || option === '' || typeof option !== EXPECTED_TYPES.options);
                if (hasInvalidOptions) {
                    errors.push({
                        error: 'Options are in wrong format, it\'s cannot contain null or empty elements either',
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

            // Check if parameters are  in valid format
            const expectedTypes = Object.fromEntries(
                Object.entries(EXPECTED_TYPES).filter(([key]) => key !== 'options' && key !== 'explanation')
            );
            const invalidParams = checkInvalidTypes(questionData, expectedTypes, { missingParams });
            if (!missingParams.includes('explanation') && questionData.explanation !== undefined && typeof questionData.explanation !== EXPECTED_TYPES.explanation) {
                invalidParams.explanation = questionData.explanation;
            }
            
            if (Object.keys(invalidParams).length > 0) {
                errors.push({
                    error: 'Parameters are in wrong formats',
                    question: questionData,
                    invalidParams
                });
            }

            // Performance and abuse safeguard
            const questionTextError = validateStringLength('Question Text', questionData.questionText, QUESTION_QUESTIONTEXT_MIN_LENGTH, QUESTION_QUESTIONTEXT_MAX_LENGTH);
            if (questionTextError) {
                errors.push({
                    error: questionTextError,
                    question: questionData,
                    invalidParams: {
                        'questionText': questionData.questionText
                    }
                });
            }
            if (!missingParams.includes('options')) {
                const optionsError = questionData.options.some(option => option.length < QUESTION_ANSWER_MIX_LENGTH || option.length > QUESTION_ANSWER_MAX_LENGTH);
                if (optionsError) {
                    errors.push({
                        error: `All options answers must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`,
                        question: questionData,
                        invalidParams: {
                            'options': questionData.options
                        }
                    });
                }
            }
            const correctAnswerError = validateStringLength('Correct Answer', questionData.correctAnswer, QUESTION_ANSWER_MIX_LENGTH, QUESTION_ANSWER_MAX_LENGTH);
            if (correctAnswerError) {
                errors.push({
                    error: correctAnswerError,
                    question: questionData,
                    invalidParams: {
                        'correctAnswer': questionData.correctAnswer
                    }
                });
            }    
            const explanationError = validateStringLength('Explanation', questionData.explanation, QUESTION_EXPLANATION_MIN_LENGTH, QUESTION_EXPLANATION_MAX_LENGTH);
            if (explanationError) {
                errors.push({
                    error: explanationError,
                    question: questionData,
                    invalidParams: {
                        'explanation': questionData.explanation
                    }
                });
            }
            const categoryIdError = !missingParams.includes('categoryId') && !invalidParams.hasOwnProperty('categoryId') && !mongoose.Types.ObjectId.isValid(questionData.categoryId);
            if (categoryIdError) {
                errors.push({
                    error: 'Invalid category ID format',
                    question: questionData,
                    invalidParams: {
                        'categoryId': questionData.categoryId
                    }
                });
            }
            const imageUrlError = validateStringLength('Image Url', questionData.imageUrl, QUESTION_IMAGEURL_MIN_LENGTH, QUESTION_IMAGEURL_MAX_LENGTH);
            if (imageUrlError) {
                errors.push({
                    error: imageUrlError,
                    question: questionData,
                    invalidParams: {
                        'imageUrl': questionData.imageUrl
                    }
                });
            }

            // Check if correctAnswer parameter is included in options parameter
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

            if (!missingParams.includes('categoryId') && !invalidParams.hasOwnProperty('categoryId') && !categoryIdError) {
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

/**
 * @swagger
 * /questions/csv:
 *   post:
 *     summary: Upload and create multiple questions from a CSV file
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               questions:
 *                 type: string
 *                 format: binary
 *                 description: CSV file containing the questions
 *     responses:
 *       201:
 *         description: Questions created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Questions created successfully
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *       400:
 *         description: Bad request - validation errors in uploaded CSV
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some questions could not be processed
 *                 length:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       error:
 *                         type: string
 *                       question:
 *                         type: object
 *                       invalidParams:
 *                         type: object
 *                       missing:
 *                         type: array
 *                         items:
 *                           type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error or failed to process CSV
 */
router.post('/csv', authenticateToken, upload.single('questions'), async (req, res, next) => { 
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
                const requiredParams = ['questionText', 'options', 'correctAnswer', 'categoryId', 'imageUrl'];
                const missingParams = checkMissingParams(questionData, requiredParams);

                if(questionData.options != '[]') {
                    questionData.options = questionData.options.slice(1, -1).split(',').map(options => options.trim());

                    if (!Array.isArray(questionData.options) || questionData.options.length !== QUESTION_MAX_OPTIONS) {
                        errors.push({
                            error: `Options must be an array of exactly ${QUESTION_MAX_OPTIONS} elements`,
                            question: questionData,
                            invalidParams: {
                                options: questionData.options
                            }
                        });
                    }

                    const hasInvalidOptions = questionData.options.some(option => option === '');
                    if (hasInvalidOptions) {
                        errors.push({
                            error: 'Options are in wrong format, it\'s cannot contain null or empty elements either',
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

                // Performance and abuse safeguard
                const questionTextError = validateStringLength('Question Text', questionData.questionText, QUESTION_QUESTIONTEXT_MIN_LENGTH, QUESTION_QUESTIONTEXT_MAX_LENGTH);
                if (questionTextError) {
                    errors.push({
                        error: questionTextError,
                        question: questionData,
                        invalidParams: {
                            'questionText': questionData.questionText
                        }
                    });
                }
                if (!missingParams.includes('options')) {
                    const optionsError = questionData.options.some(option => option.length < QUESTION_ANSWER_MIX_LENGTH || option.length > QUESTION_ANSWER_MAX_LENGTH);     
                    if (optionsError) {
                        errors.push({
                            error: `All options answers must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`,
                            question: questionData,
                            invalidParams: {
                                'options': questionData.options
                            }
                        });
                    }
                }
                const correctAnswerError = validateStringLength('Correct Answer', questionData.correctAnswer, QUESTION_ANSWER_MIX_LENGTH, QUESTION_ANSWER_MAX_LENGTH);
                if (correctAnswerError) {
                    errors.push({
                        error: correctAnswerError,
                        question: questionData,
                        invalidParams: {
                            'correctAnswer': questionData.correctAnswer
                        }
                    });
                }    
                const explanationError = validateStringLength('Explanation', questionData.explanation, QUESTION_EXPLANATION_MIN_LENGTH, QUESTION_EXPLANATION_MAX_LENGTH);
                if (explanationError) {
                    errors.push({
                        error: explanationError,
                        question: questionData,
                        invalidParams: {
                            'explanation': questionData.explanation
                        }
                    });
                }
                if (!missingParams.includes('categoryId')) {
                    if (!mongoose.Types.ObjectId.isValid(questionData.categoryId)) {
                        errors.push({
                            error: 'Invalid category ID format',
                            question: questionData,
                            invalidParams: {
                                'categoryId': questionData.categoryId
                            }
                        });
                    }                    
                }
                const imageUrlError = validateStringLength('Image Url', questionData.imageUrl, QUESTION_IMAGEURL_MIN_LENGTH, QUESTION_IMAGEURL_MAX_LENGTH);
                if (imageUrlError) {
                    errors.push({
                        error: imageUrlError,
                        question: questionData,
                        invalidParams: {
                            'imageUrl': questionData.imageUrl
                        }
                    });
                }

                if (!missingParams.includes('categoryId') && mongoose.Types.ObjectId.isValid(questionData.categoryId)) {
                    const categoryObjectId = new mongoose.Types.ObjectId(questionData.categoryId);
                    const categoryExists = res.categories.some(c => c.categoryId.equals(categoryObjectId));
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

/**
 * @swagger
 * /questions/categories/{oldCategoryId}/{newCategoryId}:
 *   patch:
 *     summary: Update questions from one category to another
 *     description: Change the categoryId of all questions from `oldCategoryId` to `newCategoryId`.
 *     tags:
 *       - Questions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: oldCategoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ObjectId of the category to replace
 *       - in: path
 *         name: newCategoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ObjectId of the new category
 *     responses:
 *       201:
 *         description: Category ID updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: CategoryId updated successfully
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *       200:
 *         description: No change occurred when both category IDs are the same
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No change occured, oldCategoryId and newCategoryId are the same
 *       400:
 *         description: Bad request due to invalid or missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred
 *                 error:
 *                   type: string
 *                   example: Invalid ObjectId format
 *                 invalidParams:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *       404:
 *         description: Categories or questions not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred
 *                 error:
 *                   type: string
 *                   example: Questions not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred while updating CategoryId
 *                 error:
 *                   type: string
 *                   example: Some internal error message
 */
router.patch('/categories//', authenticateToken, async (req, res) =>{
    return res.status(400).json({ 
        message: 'An error occurred',
        error: 'Both oldCategoryId and newCategoryId are required' 
    });
});
router.patch('/categories//:newCategoryId', authenticateToken, async (req, res) =>{
    return res.status(400).json({ 
        message: 'An error occurred',
        error: 'Both oldCategoryId and newCategoryId are required' 
    });
});
router.patch('/categories/:oldCategoryId/', authenticateToken, async (req, res) =>{
    return res.status(400).json({ 
        message: 'An error occurred',
        error: 'Both oldCategoryId and newCategoryId are required' 
    });
});
router.patch('/categories/:oldCategoryId/:newCategoryId?', authenticateToken, async (req, res, next) => {
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
            message: 'No change occured, oldCategoryId and newCategoryId are the same'
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

/**
 * @swagger
 * /questions/{id}:
 *   patch:
 *     summary: Update a question by ID
 *     description: Updates fields of a question, including text, options, correct answer, category, explanation, and image URL.
 *     tags:
 *       - Questions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The question's ObjectId
 *         required: true
 *         schema:
 *           type: string
 *           example: 60f5a4f3c9d0b2441c5f3a7a
 *     requestBody:
 *       description: Fields to update (at least one)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Must be an array with exactly [QUESTION_MAX_OPTIONS] unique, non-empty strings
 *               correctAnswer:
 *                 type: string
 *               categoryId:
 *                 type: string
 *                 description: Must be a valid category ObjectId
 *               explanation:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *             example:
 *               questionText: "What is the capital of France?"
 *               options: ["Paris", "London", "Berlin", "Madrid"]
 *               correctAnswer: "Paris"
 *               categoryId: "60f4a23b8b3e4c3f144a3a7a"
 *               explanation: "Paris is the capital of France."
 *               imageUrl: "https://example.com/image.png"
 *     responses:
 *       200:
 *         description: Question updated or no fields changed
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Question'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: No fields were updated
 *       400:
 *         description: Validation error or invalid ObjectId format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred
 *                 error:
 *                   type: string
 *                 invalidParams:
 *                   type: object
 *                 invalidLength:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Question or categories not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.patch('/:id', authenticateToken, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Invalid question ID format'
        });
    }

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
            
            // Check if options parameters is an array and has exactly QUESTION_MAX_OPTIONS elements
            if (!Array.isArray(req.body.options) || req.body.options.length !== QUESTION_MAX_OPTIONS) {
                return res.status(400).json({
                    message: 'An error occurred',
                    error: `Options must be an array of exactly ${QUESTION_MAX_OPTIONS} elements`,
                    invalidParams: {
                        options: req.body.options
                    }
                });
            }

            // Check for invalid elements in options parameter
            const hasInvalidOptions = req.body.options.some(option => option === null || option === '' || typeof option !== EXPECTED_TYPES.options);
            if (hasInvalidOptions) {
                return res.status(400).json({
                    message: 'An error occurred',
                    error: 'Options are in wrong format, it\'s cannot contain null or empty elements either',
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

        // Check if parameters are  in valid format
        const expectedTypes = Object.fromEntries(
            Object.entries(EXPECTED_TYPES).filter(([key]) => key !== 'options')
        );
        const invalidParams = checkInvalidTypes(req.body, expectedTypes, {  skipIfMissing: true });
        if (req.body.explanation !== undefined && req.body.explanation !== null && req.body.explanation !== '' && typeof req.body.explanation !== EXPECTED_TYPES.explanation) {
            invalidParams.explanation = req.body.explanation;
        }  
        
        if (Object.keys(invalidParams).length > 0) {
            return res.status(400).json({
                message: 'An error occurred',
                error: 'Parameters are in wrong formats',
                invalidParams
            });
        }

        // Performance and abuse safeguard
        const invalidLength = [];

        if (req.body.questionText !== undefined && req.body.questionText !== null && req.body.questionText !== '' && typeof req.body.questionText === EXPECTED_TYPES.questionText) {    
            const questionTextError = validateStringLength('Question Text', req.body.questionText, QUESTION_QUESTIONTEXT_MIN_LENGTH, QUESTION_QUESTIONTEXT_MAX_LENGTH);
            if (questionTextError) {
                invalidLength.push(questionTextError);
            }
        }
        if (req.body.options !== undefined && req.body.options !== null) {    
            const optionsError = req.body.options.some(option => option.length < QUESTION_ANSWER_MIX_LENGTH || option.length > QUESTION_ANSWER_MAX_LENGTH);
            if (optionsError) {
                invalidLength.push(`All options answers must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`);
            }
        }
        if (req.body.correctAnswer !== undefined && req.body.correctAnswer !== null && req.body.correctAnswer !== '' && typeof req.body.correctAnswer === EXPECTED_TYPES.correctAnswer) {            
            const correctAnswerError = validateStringLength('Correct Answer', req.body.correctAnswer, QUESTION_ANSWER_MIX_LENGTH, QUESTION_ANSWER_MAX_LENGTH);
            if (correctAnswerError) {
                invalidLength.push(correctAnswerError);
            }    
        }
        if (req.body.explanation !== undefined && req.body.explanation !== null && req.body.explanation !== '' && typeof req.body.explanation === EXPECTED_TYPES.explanation) {     
            const explanationError = validateStringLength('Explanation', req.body.explanation, QUESTION_EXPLANATION_MIN_LENGTH, QUESTION_EXPLANATION_MAX_LENGTH);
            if (explanationError) {
                invalidLength.push(explanationError);
            }
        }
        if (req.body.categoryId !== undefined && req.body.categoryId !== null && req.body.categoryId !== '' && typeof req.body.categoryId === EXPECTED_TYPES.categoryId) {     
            if (!mongoose.Types.ObjectId.isValid(req.body.categoryId)) {
                invalidLength.push('Invalid category ID format');
            }
        }
        if (req.body.imageUrl !== undefined && req.body.imageUrl !== null && req.body.imageUrl !== '' && typeof req.body.imageUrl === EXPECTED_TYPES.imageUrl) {    
            const imageUrlError = validateStringLength('Image Url', req.body.imageUrl, QUESTION_IMAGEURL_MIN_LENGTH, QUESTION_IMAGEURL_MAX_LENGTH);
            if (imageUrlError) {
                invalidLength.push(imageUrlError);
            }
        }
            
        if (invalidLength.length > 0) {
            return res.status(400).json({
                message: 'An error occurred', 
                error: 'Validation failed',
                invalidLength
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
/**
 * @swagger
 * /questions/all:
 *   delete:
 *     summary: Delete all questions
 *     description: Deletes all questions from the database. Use with caution.
 *     tags:
 *       - Questions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All questions deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All questions deleted
 *                 deletedCount:
 *                   type: integer
 *                   example: 42
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred
 *                 error:
 *                   type: string
 */
router.delete('/all', authenticateToken, async (req, res) => {
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

/**
 * @swagger
 * /questions/{id}:
 *   delete:
 *     summary: Delete a question by ID
 *     tags:
 *       - Questions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ObjectId of the question to delete
 *         schema:
 *           type: string
 *           example: 60f7a1b2c1234d5678ef9012
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question deleted
 *                 deletedQuestion:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60f7a1b2c1234d5678ef9012
 *                     questionText:
 *                       type: string
 *                       example: What is the capital of France?
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Paris", "Berlin", "Madrid", "Rome"]
 *                     correctAnswer:
 *                       type: string
 *                       example: Paris
 *                     explanation:
 *                       type: string
 *                       example: Paris is the capital city of France.
 *                     categoryId:
 *                       type: string
 *                       example: 60f7a1b2c1234d5678ef9010
 *                     imageUrl:
 *                       type: string
 *                       example: https://example.com/image.png
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-01T12:00:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-02-01T12:00:00.000Z
 *                     __v:
 *                       type: integer
 *                       example: 0
 *       400:
 *         description: Invalid question ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred
 *                 error:
 *                   type: string
 *                   example: Invalid question ID format
 *       404:
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred
 *                 error:
 *                   type: string
 *                   example: Question not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred
 *                 error:
 *                   type: string
 *                   example: Internal server error message
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Invalid question ID format'
        });
    }

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