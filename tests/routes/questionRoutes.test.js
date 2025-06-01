const { QUESTION_QUESTIONTEXT_MIN_LENGTH, QUESTION_QUESTIONTEXT_MAX_LENGTH, QUESTION_MAX_OPTIONS,
    QUESTION_ANSWER_MIX_LENGTH, QUESTION_ANSWER_MAX_LENGTH, QUESTION_EXPLANATION_MIN_LENGTH, 
    QUESTION_EXPLANATION_MAX_LENGTH, QUESTION_IMAGEURL_MIN_LENGTH, QUESTION_IMAGEURL_MAX_LENGTH } = require('../../config/apiConfig');
// Core modules
const express = require('express');
const mongoose = require('mongoose');
// Third-party modules
const request = require('supertest');
// Application modules
const Category = require('../../api/models/category');
jest.mock('../../api/models/category');
const Question = require('../../api/models/question');
jest.mock('../../api/models/question');
const router = require('../../api/routes/questionRoutes');
// App setup
const app = express();
app.use(express.json({ limit: '10kb' }));
app.use('/questions', router);
// Test data and mocks
const { headersQuestions, mockQuestions, mockValue } = require('../mocks/mockQuestions');
const { mockSession } = require('../mocks/mockSession');
const { mockCategories } = require('../mocks/mockCategories');
// Utility functions
const { setupQuestionsMocks, resetMocks } = require('../utils/setupMocks');
const { convertObjectIdsToStrings, convertObjectIdsToStringsInObject, convertObjectIdToString, arrayToCustomCsvBuffer } = require('../utils/convertFunctions');
const { generateString }  = require('../utils/generateString');
const { authPost, authUpload, authPatch, authDelete } = require('../utils/authHelpers');


/********/
/* MOCKS */
/********/
// Set up mocks before each test
beforeEach(() => { 
    setupQuestionsMocks();
});
// Reset mocks after each test
afterEach(() => {
    resetMocks();
});


/********/
/* GET */
/********/

// GET /questions
describe('GET /questions', () => {
    it('should return all questions', async () => {
        const res = await request(app).get('/questions');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(convertObjectIdsToStrings(mockQuestions));

        const categoriesNull = { categories: null };
        const resWithCategoriesNull = await request(app).get('/questions').query(categoriesNull);;
        expect(resWithCategoriesNull.status).toBe(500);
        expect(resWithCategoriesNull.body.message).toBe('An error occurred');
        expect(resWithCategoriesNull.body.error).toBe('Parameter categories should be an array and not contain null or empty values');
    
        const categoriesString = { categories: '6702a8418357fa576c95ea43' };
        const resWithCategoriesString = await request(app).get('/questions').query(categoriesString);
        expect(resWithCategoriesString.status).toBe(200);
        expect(resWithCategoriesString.body).toEqual(convertObjectIdsToStrings(mockQuestions.filter(question => [categoriesString.categories].includes(question.categoryId.toString()))));

        const categories = { categories: ['6702a8418357fa576c95ea43', '671e6e7393cee089f87f1f3d'] };
        const resWithCategories = await request(app).get('/questions').query(categories);
        expect(resWithCategories.status).toBe(200);
        expect(resWithCategories.body).toEqual(convertObjectIdsToStrings(mockQuestions.filter(question => categories.categories.includes(question.categoryId.toString()))));
    });

    it('should return 500 error on server failure', async () => {
        Question.find.mockRejectedValue(new Error('Database error'));
        const res = await request(app).get('/questions');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });
});

// GET /questions/eng
describe('GET /questions/eng', () => {
    it('should return 500 if parameter categories null', async () => {
        const resNullValue = await request(app).get('/questions/eng').query({ categories : null });
        expect(resNullValue.status).toBe(500);
        expect(resNullValue.body.message).toBe('An error occurred');
        expect(resNullValue.body.error).toBe('Parameter categories should not be null');
    });

    it('should return all questions in eng', async () => {
        const res = await request(app).get('/questions/eng');
        const categoryIds = mockCategories.filter(category => category.language === 'eng').map(item => item.categoryId.toString());
        expect(res.status).toBe(200);
        expect(res.body).toEqual(convertObjectIdsToStrings(mockQuestions.filter(item => categoryIds.includes(item.categoryId.toString()))));

        const categoriesString = { categories: '6702a8418357fa576c95ea43' };
        const resWithCategoriesString = await request(app).get('/questions/eng').query(categoriesString);
        expect(resWithCategoriesString.status).toBe(200);
        expect(resWithCategoriesString.body).toEqual(convertObjectIdsToStrings(mockQuestions.filter(question => [categoriesString.categories].includes(question.categoryId.toString()))));

        const categoriesList = ['6702a8418357fa576c95ea43', '671e6e7393cee089f87f1f3d'];
        const resWithCategories = await request(app).get('/questions/eng').query({ categories : categoriesList });
        const categoryIdsWithCategories = mockCategories.filter(category => category.language === 'eng' && categoriesList.includes(category.categoryId.toString())).map(item => item.categoryId.toString());
        expect(resWithCategories.status).toBe(200);
        expect(resWithCategories.body).toEqual(convertObjectIdsToStrings(mockQuestions.filter(item => categoryIdsWithCategories.includes(item.categoryId.toString()))));
    });

    it('should return 404 error if Category not found', async () => {
        Category.find.mockResolvedValue(null);
        const res = await request(app).get('/questions/eng');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Category not found');
    });

    it('should return 500 error if Category not found', async () => {
        Category.find.mockRejectedValue(new Error('Database error'));
        const res = await request(app).get('/questions/eng');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return 500 error on server failure', async () => {
        Question.find.mockRejectedValue(new Error('Database error'));
        const res = await request(app).get('/questions/eng');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });
});

// GET /questions/fr
describe('GET /questions/fr', () => {
    it('should return 500 if parameter categories null', async () => {
        const resNullValue = await request(app).get('/questions/fr').query({ categories : null });
        expect(resNullValue.status).toBe(500);
        expect(resNullValue.body.message).toBe('An error occurred');
        expect(resNullValue.body.error).toBe('Parameter categories should not be null');
    });

    it('should return all questions in fr', async () => {
        const res = await request(app).get('/questions/fr');
        const categoryIds = mockCategories.filter(category => category.language === 'fr').map(item => item.categoryId.toString());
        expect(res.status).toBe(200);
        expect(res.body).toEqual(convertObjectIdsToStrings(mockQuestions.filter(item => categoryIds.includes(item.categoryId.toString()))));

        const categoriesString = { categories: '672d0698004c7514fcd799af' };
        const resWithCategoriesString = await request(app).get('/questions/fr').query(categoriesString);
        expect(resWithCategoriesString.status).toBe(200);
        expect(resWithCategoriesString.body).toEqual(convertObjectIdsToStrings(mockQuestions.filter(question => [categoriesString.categories].includes(question.categoryId.toString()))));

        const categoriesList = ['672d0698004c7514fcd799af', '672d0698004c7514fcd799c7'];
        const resWithCategories = await request(app).get('/questions/fr').query({ categories : categoriesList });
        const categoryIdsWithCategories = mockCategories.filter(category => category.language === 'fr' && categoriesList.includes(category.categoryId.toString())).map(item => item.categoryId.toString());
        expect(resWithCategories.status).toBe(200);
        expect(resWithCategories.body).toEqual(convertObjectIdsToStrings(mockQuestions.filter(item => categoryIdsWithCategories.includes(item.categoryId.toString()))));
    });

    it('should return 404 error if Category not found', async () => {
        Category.find.mockResolvedValue(null);
        const res = await request(app).get('/questions/fr');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Category not found');
    });

    it('should return 500 error if Category not found', async () => {
        Category.find.mockRejectedValue(new Error('Database error'));
        const res = await request(app).get('/questions/fr');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return 500 error on server failure', async () => {
        Question.find.mockRejectedValue(new Error('Database error'));
        const res = await request(app).get('/questions/fr');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });
});

// GET /questions/random/:random
describe('GET /questions/random/:random', () => {
    it('should return 500 if parameter categories null', async () => {
        const length = 2;
        const resNotArray = await request(app).get(`/questions/random/${length}`).query({ categories : null });
        expect(resNotArray.status).toBe(500);
        expect(resNotArray.body.message).toBe('An error occurred');
        expect(resNotArray.body.error).toBe('Parameter categories should not be null');
    });

    it('should return 404 if the random parameter is missing', async () => {
        const res = await request(app).get('/questions/random/');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Parameter is required');
    });

    it('should return 404 if the random parameter is not a positive number', async () => {
        const res = await request(app).get('/questions/random/0');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Parameter must be a positive number and under 50');

        const resNegative = await request(app).get('/questions/random/-5');
        expect(resNegative.status).toBe(404);
        expect(resNegative.body.message).toBe('An error occurred');
        expect(resNegative.body.error).toBe('Parameter must be a positive number and under 50');

        const resTooHighNumber = await request(app).get('/questions/random/51');
        expect(resTooHighNumber.status).toBe(404);
        expect(resTooHighNumber.body.message).toBe('An error occurred');
        expect(resTooHighNumber.body.error).toBe('Parameter must be a positive number and under 50');

        const resNaN = await request(app).get('/questions/random/abc');
        expect(resNaN.status).toBe(404);
        expect(resNaN.body.message).toBe('An error occurred');
        expect(resNaN.body.error).toBe('Parameter must be a positive number and under 50');
    });

    it('should return a list of questions when the random parameter is valid', async () => {
        const length = 2;
        const res = await request(app).get(`/questions/random/${length}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(length);
        expect(res.body.every(question => 
            mockQuestions.some(mockQuestion => convertObjectIdToString(mockQuestion._id) === question._id)
        )).toBe(true);

        const categoriesString = '672d0698004c7514fcd799af';
        const resWithCategory = await request(app).get(`/questions/random/${length}`).query({ categories : categoriesString });
        const categoryIdsWithCategory = mockCategories.filter(category => category.language === 'fr' && [categoriesString].includes(category.categoryId.toString())).map(item => item.categoryId.toString());
        const mockQuestionsWithCategory = mockQuestions.filter(item => categoryIdsWithCategory.includes(item.categoryId.toString()));
        expect(resWithCategory.status).toBe(200);
        expect(resWithCategory.body).toHaveLength(length);
        expect(resWithCategory.body.every(question => 
            mockQuestionsWithCategory.some(mockQuestion => convertObjectIdToString(mockQuestion._id) === question._id)
        )).toBe(true);

        const categoriesList = ['672d0698004c7514fcd799af', '672d0698004c7514fcd799c7'];
        const resWithCategories = await request(app).get(`/questions/random/${length}`).query({ categories : categoriesList });
        const categoryIdsWithCategories = mockCategories.filter(category => category.language === 'fr' && categoriesList.includes(category.categoryId.toString())).map(item => item.categoryId.toString());
        const mockQuestionsWithCategories = mockQuestions.filter(item => categoryIdsWithCategories.includes(item.categoryId.toString()));
        expect(resWithCategories.status).toBe(200);
        expect(resWithCategories.body).toHaveLength(length);
        expect(resWithCategories.body.every(question => 
            mockQuestionsWithCategories.some(mockQuestion => convertObjectIdToString(mockQuestion._id) === question._id)
        )).toBe(true);
    });

    it('should return 500 error on server failure', async () => {
        Question.find.mockRejectedValue(new Error('Database error'));
        const length = 2;
        const res = await request(app).get(`/questions/random/${length}`);
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });
});

// GET /stats/:lang?
describe('GET /stats/:lang?', () => {
    it('should return 404 error if Category not found', async () => {
        Category.find.mockResolvedValue(null);

        const res = await request(app).get('/questions/stats');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Category not found');

        const resEnglish = await request(app).get('/questions/stats/eng');
        expect(resEnglish.status).toBe(404);
        expect(resEnglish.body.message).toBe('An error occurred');
        expect(resEnglish.body.error).toBe('Category not found');

        const resFrench = await request(app).get('/questions/stats/fr');
        expect(resFrench.status).toBe(404);
        expect(resFrench.body.message).toBe('An error occurred');
        expect(resFrench.body.error).toBe('Category not found');
    });

    it('should return 500 error if Category not found', async () => {
        Category.find.mockRejectedValue(new Error('Database error'));

        const res = await request(app).get('/questions/stats');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');

        const resEnglish = await request(app).get('/questions/stats/eng');
        expect(resEnglish.status).toBe(500);
        expect(resEnglish.body.message).toBe('An error occurred');
        expect(resEnglish.body.error).toBe('Database error');

        const resFrench = await request(app).get('/questions/stats/fr');
        expect(resFrench.status).toBe(500);
        expect(resFrench.body.message).toBe('An error occurred');
        expect(resFrench.body.error).toBe('Database error');
    });

    it('should return 500 error on server failure', async () => {
        Question.find.mockRejectedValue(new Error('Database error'));

        const res = await request(app).get('/questions/stats');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');

        const resEnglish = await request(app).get('/questions/stats/eng');
        expect(resEnglish.status).toBe(500);
        expect(resEnglish.body.message).toBe('An error occurred');
        expect(resEnglish.body.error).toBe('Database error');

        const resFrench = await request(app).get('/questions/stats/fr');
        expect(resFrench.status).toBe(500);
        expect(resFrench.body.message).toBe('An error occurred');
        expect(resFrench.body.error).toBe('Database error');
    });

    it('should return stats', async () => {
        const res = await request(app).get('/questions/stats');
        const categoryIdsWithCategories = mockCategories.map(item => item.categoryId.toString());
        const mockQuestionsCategories = convertObjectIdsToStrings(mockQuestions.filter(item => categoryIdsWithCategories.includes(item.categoryId.toString())));
        const categoryCount = {};
        mockQuestionsCategories.forEach(item => { const categoryId = item.categoryId;categoryCount[categoryId] = (categoryCount[categoryId] || 0) + 1;});
        let result = Object.keys(categoryCount).map(categoryId => ({ categoryId: categoryId, occurence: categoryCount[categoryId] }));
        const categoryMap = {};
        mockCategories.forEach(item => { categoryMap[item.categoryId.toString()] = item.name;});
        result = result.map(item => ({ ...item, name: categoryMap[item.categoryId] }));
        expect(res.status).toBe(200);
        expect(res.body).toEqual(result);

        const resEnglish = await request(app).get('/questions/stats/eng');
        const mockCategoriesEnglish = mockCategories.filter(category => category.language === 'eng');
        const categoryIdsWithCategoriesInEnglish = mockCategoriesEnglish.map(item => item.categoryId.toString());
        const mockQuestionsCategoriesInEnglish = convertObjectIdsToStrings(mockQuestions.filter(item => categoryIdsWithCategoriesInEnglish.includes(item.categoryId.toString())));
        const categoryCountEnglish = {};
        mockQuestionsCategoriesInEnglish.forEach(item => { const categoryId = item.categoryId;categoryCountEnglish[categoryId] = (categoryCountEnglish[categoryId] || 0) + 1;});
        let resultInEnglish = Object.keys(categoryCountEnglish).map(categoryId => ({ categoryId: categoryId, occurence: categoryCountEnglish[categoryId] }));
        const categoryMapEnglish = {};
        mockCategoriesEnglish.forEach(item => { categoryMapEnglish[item.categoryId.toString()] = item.name;});
        resultInEnglish = resultInEnglish.map(item => ({ ...item, name: categoryMapEnglish[item.categoryId] }));
        expect(resEnglish.status).toBe(200);
        expect(resEnglish.body).toEqual(resultInEnglish);

        const mockCategoriesFrench = mockCategories.filter(category => category.language === 'fr');
        const categoryIdsWithCategoriesInFrench = mockCategoriesFrench.map(item => item.categoryId.toString());
        const mockQuestionsCategoriesInFrench = convertObjectIdsToStrings(mockQuestions.filter(item => categoryIdsWithCategoriesInFrench.includes(item.categoryId.toString())));
        const categoryCountFrench = {};
        mockQuestionsCategoriesInFrench.forEach(item => { const categoryId = item.categoryId;categoryCountFrench[categoryId] = (categoryCountFrench[categoryId] || 0) + 1;});
        let resultInFrench = Object.keys(categoryCountFrench).map(categoryId => ({ categoryId: categoryId, occurence: categoryCountFrench[categoryId] }));
        const categoryMapFrench = {};
        mockCategoriesFrench.forEach(item => { categoryMapFrench[item.categoryId.toString()] = item.name;});
        resultInFrench = resultInFrench.map(item => ({ ...item, name: categoryMapFrench[item.categoryId] }));
        const resFrench = await request(app).get('/questions/stats/fr');
        expect(resFrench.status).toBe(200);
        expect(resFrench.body).toEqual(resultInFrench);
    });

    it('should return 404 parameter lang not a valid parameter', async () => {
        const resJapanese = await request(app).get('/questions/stats/jap');
        expect(resJapanese.status).toBe(404);
        expect(resJapanese.body.message).toBe('An error occurred');
        expect(resJapanese.body.error).toBe('Parameter lang is not a valid parameter');
        expect(resJapanese.body.invalidParams.language).toBe('jap');
    });
});

// GET /questions/:id
describe('GET /questions/:id', () => {
    it('should return 400 error if question ID format is invalid', async () => {
        const res = await request(app).get('/questions/invalid-id');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Invalid question ID format');
    });

    it('should return 404 error if question not found', async () => {
        Question.findById.mockResolvedValue(null);
        const res = await request(app).get(`/questions/${mockValue._id.toString()}`);
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Question not found');
    });

    it('should return 500 error if findById fails', async () => {
        Question.findById.mockRejectedValue(new Error('Database error'));
        const res = await request(app).get(`/questions/${mockValue._id.toString()}`);
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return a question by ID', async () => {
        Question.findById.mockResolvedValue(mockValue);
        const res = await request(app).get(`/questions/${mockValue._id.toString()}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual(convertObjectIdsToStringsInObject(mockValue));
    });
});


/********/
/* POST */
/********/

// POST /questions
describe('POST /questions', () => {
    it('should return 400 error if missing parameters', async () => {
        const newOnlyQuestionTest = { questionText: 'Only question text' };
        Question.prototype.save.mockResolvedValue(newOnlyQuestionTest);
        const resOnlyQuestionText = await authPost(app, '/questions', newOnlyQuestionTest); 
        expect(resOnlyQuestionText.status).toBe(400);
        expect(resOnlyQuestionText.body.message).toBe('An error occurred');
        expect(resOnlyQuestionText.body.error).toBe('Missing parameters');
        expect(resOnlyQuestionText.body.missing).toEqual(['options', 'correctAnswer', 'categoryId', 'imageUrl']);
        
        const newOnlyOptions = { options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'] };
        Question.prototype.save.mockResolvedValue(newOnlyOptions);
        const resOnlyOptions = await authPost(app, '/questions', newOnlyOptions);
        expect(resOnlyOptions.status).toBe(400);
        expect(resOnlyOptions.body.message).toBe('An error occurred');
        expect(resOnlyOptions.body.error).toBe('Missing parameters');
        expect(resOnlyOptions.body.missing).toEqual(['questionText', 'correctAnswer', 'categoryId', 'imageUrl']);

        const newOnlyCorrectAnswer = { correctAnswer: 'answer 2' };
        Question.prototype.save.mockResolvedValue(newOnlyCorrectAnswer);
        const resOnlyCorrectAnswer = await authPost(app, '/questions', newOnlyCorrectAnswer);
        expect(resOnlyCorrectAnswer.status).toBe(400);
        expect(resOnlyCorrectAnswer.body.message).toBe('An error occurred');
        expect(resOnlyCorrectAnswer.body.error).toBe('Missing parameters');
        expect(resOnlyCorrectAnswer.body.missing).toEqual(['questionText', 'options', 'categoryId', 'imageUrl']);
    
        const newOnlyCategoryId = { categoryId: 'categoryId' };
        Question.prototype.save.mockResolvedValue(newOnlyCategoryId);
        const resOnlyCategoryId = await authPost(app, '/questions', newOnlyCategoryId);
        expect(resOnlyCategoryId.status).toBe(400);
        expect(resOnlyCategoryId.body.message).toBe('An error occurred');
        expect(resOnlyCategoryId.body.error).toBe('Missing parameters');
        expect(resOnlyCategoryId.body.missing).toEqual(['questionText', 'options', 'correctAnswer', 'imageUrl']);

        const newOnlyImageUrl = { imageUrl: 'http//imageUrl0' };
        Question.prototype.save.mockResolvedValue(newOnlyImageUrl);
        const resOnlyImageUrl = await authPost(app, '/questions', newOnlyImageUrl);
        expect(resOnlyImageUrl.status).toBe(400);
        expect(resOnlyImageUrl.body.message).toBe('An error occurred');
        expect(resOnlyImageUrl.body.error).toBe('Missing parameters');
        expect(resOnlyImageUrl.body.missing).toEqual(['questionText', 'options', 'correctAnswer', 'categoryId']);
    
        const newMissingAll = {};
        Question.prototype.save.mockResolvedValue(newMissingAll);
        const resMissingAll = await authPost(app, '/questions', newMissingAll);
        expect(resMissingAll.status).toBe(400);
        expect(resMissingAll.body.message).toBe('An error occurred');
        expect(resMissingAll.body.error).toBe('Missing parameters');
        expect(resMissingAll.body.missing).toEqual(['questionText', 'options', 'correctAnswer', 'categoryId', 'imageUrl']);
    });

    it('should return 400 error if options parameter is not 4 elements', async () => {
        const newInvalidOptions = {
            questionText: 'Question text',
            options: ['answer 1', 'answer 2'],
            correctAnswer: 'answer 1',
            categoryId: '6702a8418357fa576c95ea43',
            imageUrl: 'http//imageUrl0'
        };
        const res = await authPost(app, '/questions', newInvalidOptions);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Options must be an array of exactly 4 elements');
        expect(res.body.invalidParams.options).toEqual(['answer 1', 'answer 2']);
    });

    it('should return 400 error if null or empty elements in options parameter', async () => {
        const newEmptyOptions = {
            questionText: 'Question text',
            options: ['answer 1', '', 'answer 3', null],
            correctAnswer: 'answer 1',
            categoryId: '6702a8418357fa576c95ea43',
            imageUrl: 'http//imageUrl0'
        };
        const res = await authPost(app, '/questions', newEmptyOptions);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Options are in wrong format, it\'s cannot contain null or empty elements either');
        expect(res.body.invalidParams.options).toEqual(['answer 1', '', 'answer 3', null]);
    });

    it('should return 400 error if duplicates in options parameter', async () => {
        const newDuplicateOptions = {
            questionText: 'Question text',
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 3'],
            correctAnswer: 'answer 1',
            categoryId: '6702a8418357fa576c95ea43',        
            imageUrl: 'http//imageUrl0'
        };
        const res = await authPost(app, '/questions', newDuplicateOptions);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Options must be unique');
        expect(res.body.invalidParams.options).toEqual(['answer 1', 'answer 2', 'answer 3', 'answer 3']);
    });

    it('should return 400 error if rest of parameters not string', async () => {
        const newInvalidQuestionText = {
            questionText: 456,
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 'answer 1',
            explanation: 'explanation',
            categoryId: '6702a8418357fa576c95ea43',        
            imageUrl: 'http//imageUrl0'
        };
        const resInvalidQuestionText = await authPost(app, '/questions', newInvalidQuestionText);
        expect(resInvalidQuestionText.status).toBe(400);
        expect(resInvalidQuestionText.body.message).toBe('An error occurred');
        expect(resInvalidQuestionText.body.error).toBe('Parameters are in wrong formats');
        expect(resInvalidQuestionText.body.invalidParams).toEqual({ questionText: 456 });

        const newInvalidCorrectAnswer = {
            questionText: 'Question text',
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: {},
            explanation: 'explanation',
            categoryId: '6702a8418357fa576c95ea43',        
            imageUrl: 'http//imageUrl0'
        };
        const resInvalidCorrectAnswer = await authPost(app, '/questions', newInvalidCorrectAnswer);
        expect(resInvalidCorrectAnswer.status).toBe(400);
        expect(resInvalidCorrectAnswer.body.message).toBe('An error occurred');
        expect(resInvalidCorrectAnswer.body.error).toBe('Parameters are in wrong formats');
        expect(resInvalidCorrectAnswer.body.invalidParams).toEqual({ correctAnswer: {} });

        const newInvalidExplanation = {
            questionText: 'Question text',
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 'answer 1',
            explanation: 123,
            categoryId: '6702a8418357fa576c95ea43',        
            imageUrl: 'http//imageUrl0'
        };
        const resInvalidExplanation = await authPost(app, '/questions', newInvalidExplanation);
        expect(resInvalidExplanation.status).toBe(400);
        expect(resInvalidExplanation.body.message).toBe('An error occurred');
        expect(resInvalidExplanation.body.error).toBe('Parameters are in wrong formats');
        expect(resInvalidExplanation.body.invalidParams).toEqual({ explanation: 123 });

        const newInvalidCategoryId = {
            questionText: 'Question text',
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 'Paris',
            explanation: 'explanation',
            categoryId: [],        
            imageUrl: 'http//imageUrl0'
        };
        const resInvalidCategoryId = await authPost(app, '/questions', newInvalidCategoryId);
        expect(resInvalidCategoryId.status).toBe(400);
        expect(resInvalidCategoryId.body.message).toBe('An error occurred');
        expect(resInvalidCategoryId.body.error).toBe('Parameters are in wrong formats');
        expect(resInvalidCategoryId.body.invalidParams).toEqual({ categoryId: [] });

        const newInvalidImageUrl = {
            questionText: 'Question text',
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 'answer 1',
            explanation: 'explanation',
            categoryId: '6702a8418357fa576c95ea43',        
            imageUrl: 102
        };
        const resInvalidImageUrl = await authPost(app, '/questions', newInvalidImageUrl);
        expect(resInvalidImageUrl.status).toBe(400);
        expect(resInvalidImageUrl.body.message).toBe('An error occurred');
        expect(resInvalidImageUrl.body.error).toBe('Parameters are in wrong formats');
        expect(resInvalidImageUrl.body.invalidParams).toEqual({ imageUrl: 102 });

        const newInvalidAllParameters = {
            questionText: 123,
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 456,
            explanation: 789,
            categoryId: 101,        
            imageUrl: 102
        };
        const resInvalidAllParameters = await authPost(app, '/questions', newInvalidAllParameters);
        expect(resInvalidAllParameters.status).toBe(400);
        expect(resInvalidAllParameters.body.message).toBe('An error occurred');
        expect(resInvalidAllParameters.body.error).toBe('Parameters are in wrong formats');
        expect(resInvalidAllParameters.body.invalidParams).toEqual({
            questionText: 123,
            correctAnswer: 456,
            explanation: 789,
            categoryId: 101,
            imageUrl: 102
        });
    });

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

        const invalidCategoryId = 'invalid-format';
        const newInvalidCategoryId =  { 
            questionText: 'Question text', 
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 'answer 1',
            explanation: 'explanation',
            categoryId: invalidCategoryId,        
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
                categoryId: invalidCategoryId,        
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

    it('should return 400 error if correctAnswer parameter is not included in options parameter', async () => {
        const newInvalidCorrectAnswer = {
            questionText: 'Question text',
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 'answer 0',
            explanation: 'explanation',
            categoryId: '6702a8418357fa576c95ea43',        
            imageUrl: 'http//imageUrl0'
        };

        const res = await authPost(app, '/questions', newInvalidCorrectAnswer);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Correct answer must be one of the options');
        expect(res.body.invalidParams.correctAnswer).toBe('answer 0');
    });

    it('should return 400 if categoryId does not exist in the Category collection', async () => {
        const newQuestion = {
            questionText: 'Question text',
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 'answer 1',
            explanation: 'explanation',
            categoryId: '6702a8418357fa576c95ea49',        
            imageUrl: 'http//imageUrl0'
        };
        const res = await authPost(app, '/questions', newQuestion);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Invalid categoryId. Category does not exist');
        expect(res.body.invalidParams.categoryId).toBe(newQuestion.categoryId);
    });

    it('should create a new question', async () => {
        const newQuestion = {
            questionText: 'Question text',
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 'answer 1',
            explanation: 'explanation',
            categoryId: '6702a8418357fa576c95ea43',        
            imageUrl: 'http//imageUrl0'
        };
        Question.prototype.save.mockResolvedValue(newQuestion);
        const res = await authPost(app, '/questions', newQuestion);
        expect(res.status).toBe(201);
        expect(res.body).toEqual(newQuestion);
    });

    it('should return 404 error if Category not found', async () => {
        Category.find.mockResolvedValue(null);
        const newQuestion = {
            questionText: 'Question text',
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 'answer 1',
            explanation: 'explanation',
            categoryId: '6702a8418357fa576c95ea43',        
            imageUrl: 'http//imageUrl0'
        };
        Question.prototype.save.mockResolvedValue(newQuestion);
        const res = await authPost(app, '/questions', newQuestion);
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Category not found');
    });

    it('should return 500 error if Category not found', async () => {
        Category.find.mockRejectedValue(new Error('Database error'));
        const newQuestion = {
            questionText: 'Question text',
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 'answer 1',
            explanation: 'explanation',
            categoryId: '6702a8418357fa576c95ea43',        
            imageUrl: 'http//imageUrl0'
        };
        Question.prototype.save.mockResolvedValue(newQuestion);
        const res = await authPost(app, '/questions', newQuestion);
        expect(res.status).toBe(500);
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return 500 error if save fails', async () => {
        const newQuestion = {
            questionText: 'Question text',
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
            correctAnswer: 'answer 1',
            explanation: 'explanation',
            categoryId: '6702a8418357fa576c95ea43',        
            imageUrl: 'http//imageUrl0'
        };
        Question.prototype.save.mockRejectedValue(new Error('Database error'));
        const res = await authPost(app, '/questions', newQuestion);
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });
});

// POST /questions/bulk
describe('POST /questions/bulk', () => {
    it('should return 400 error if missing questions parameter or empty', async () => {
        const newMissing = {};
        Question.prototype.save.mockResolvedValue(newMissing);
        const resMissing = await authPost(app, '/questions/bulk', newMissing);
        expect(resMissing.status).toBe(400);
        expect(resMissing.body.message).toBe('An error occurred');
        expect(resMissing.body.error).toBe('Questions must be a non-empty array');
        
        const newEmpty = [];
        Question.prototype.save.mockResolvedValue(newEmpty);
        const resEmpty = await authPost(app, '/questions/bulk', { questions: newEmpty });
        expect(resEmpty.status).toBe(400);
        expect(resEmpty.body.message).toBe('An error occurred');
        expect(resEmpty.body.error).toBe('Questions must be a non-empty array');
    });

    it('should return 400 error if missing questions', async () => {
        const newQuestions = [
            { options: ['answer 11', 'answer 12', 'answer 13', 'answer 14'], correctAnswer: 'answer 11', categoryId: '6702a8418357fa576c95ea43', imageUrl: 'http//imageUr0' },
            { questionText: 'Question text 2', correctAnswer: 'answer 22', categoryId: '6702a8418357fa576c95ea43', imageUrl: 'http//imageUrl1' },
            { questionText: 'Question text 3', options: ['answer 31', 'answer 32', 'answer 33', 'answer 34'], categoryId: '6702a8418357fa576c95ea43', imageUrl: 'http//imageUrl2' },
            { questionText: 'Question text 4', options: ['answer 41', 'answer 42', 'answer 43', 'answer 44'], correctAnswer: 'answer 44', imageUrl: 'http//imageUrl3' },
            { questionText: 'Question text 5', options: ['answer 51', 'answer 52', 'answer 53', 'answer 54'], correctAnswer: 'answer 54', categoryId: '6702a8418357fa576c95ea43' },
            { questionText: 'Question text 6', explanation: 'explanation' },
            {}
        ];
        Question.prototype.save.mockResolvedValue(newQuestions);
        
        const res = await authPost(app, '/questions/bulk', { questions: newQuestions });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');
        expect(res.body.length).toBe(newQuestions.length);
        expect(res.body.errors.length).toBe(newQuestions.length);
        expect(res.body.errors[0].error).toBe('Missing parameters');
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].missing).toEqual([ 'questionText' ]);
        expect(res.body.errors[1].error).toBe('Missing parameters');
        expect(res.body.errors[1].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[1].missing).toEqual([ 'options' ]);
        expect(res.body.errors[2].error).toBe('Missing parameters');
        expect(res.body.errors[2].question).toMatchObject(newQuestions[2]);
        expect(res.body.errors[2].missing).toEqual([ 'correctAnswer' ]);
        expect(res.body.errors[3].error).toBe('Missing parameters');
        expect(res.body.errors[3].question).toMatchObject(newQuestions[3]);
        expect(res.body.errors[3].missing).toEqual([ 'categoryId' ]);
        expect(res.body.errors[4].error).toBe('Missing parameters');
        expect(res.body.errors[4].question).toMatchObject(newQuestions[4]);
        expect(res.body.errors[4].missing).toEqual([ 'imageUrl' ]);
        expect(res.body.errors[5].error).toBe('Missing parameters');
        expect(res.body.errors[5].question).toMatchObject(newQuestions[5]);
        expect(res.body.errors[5].missing).toEqual([ 'options', 'correctAnswer', 'categoryId', 'imageUrl' ]);
        expect(res.body.errors[6].error).toBe('Missing parameters');
        expect(res.body.errors[6].question).toMatchObject(newQuestions[6]);
        expect(res.body.errors[6].missing).toEqual([ 'questionText', 'options', 'correctAnswer', 'categoryId', 'imageUrl' ]);
    
        expect(Question.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should return 400 error if parameters are not strings', async () => {
        const newQuestions = [
            { questionText: 0, options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'], correctAnswer: 'answer 1', explanation: 'explanation', categoryId: '6702a8418357fa576c95ea43', imageUrl: 'http//imageUrl0' },
            { questionText: 'Question text 2', options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'], correctAnswer: 1, explanation: 'explanation', categoryId: '6702a8418357fa576c95ea43', imageUrl: 'http//imageUrl1' },
            { questionText: 'Question text 3', options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'], correctAnswer: 'answer 1', explanation: 2, categoryId: '6702a8418357fa576c95ea43', imageUrl: 'http//imageUrl2' },            
            { questionText: 'Question text 4', options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'], correctAnswer: 'answer 1', explanation: 'explanation', categoryId: 3, imageUrl: 'http//imageUrl3' },
            { questionText: 'Question text 5', options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'], correctAnswer: 'answer 1', explanation: 'explanation', categoryId: '6702a8418357fa576c95ea43', imageUrl: 6 },
            { questionText: 5, options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'], correctAnswer: 6, explanation: 7, categoryId: 8, imageUrl: 9 },
        ];
        Question.prototype.save.mockResolvedValue(newQuestions);
        
        const res = await authPost(app, '/questions/bulk', { questions: newQuestions });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');
        expect(res.body.length).toBe(newQuestions.length);
        expect(res.body.errors.length).toBe(newQuestions.length);
        expect(res.body.errors[0].error).toBe('Parameters are in wrong formats');
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].invalidParams).toEqual({ questionText : 0 });
        expect(res.body.errors[1].error).toBe('Parameters are in wrong formats');
        expect(res.body.errors[1].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[1].invalidParams).toEqual({ correctAnswer : 1 });
        expect(res.body.errors[2].error).toBe('Parameters are in wrong formats');
        expect(res.body.errors[2].question).toMatchObject(newQuestions[2]);
        expect(res.body.errors[2].invalidParams).toEqual({ explanation: 2 });
        expect(res.body.errors[3].error).toBe('Parameters are in wrong formats');
        expect(res.body.errors[3].question).toMatchObject(newQuestions[3]);
        expect(res.body.errors[3].invalidParams).toEqual({ categoryId: 3 });
        expect(res.body.errors[4].error).toBe('Parameters are in wrong formats');
        expect(res.body.errors[4].question).toMatchObject(newQuestions[4]);
        expect(res.body.errors[4].invalidParams).toEqual({ imageUrl: 6 });
        expect(res.body.errors[5].error).toBe('Parameters are in wrong formats');
        expect(res.body.errors[5].question).toMatchObject(newQuestions[5]);
        expect(res.body.errors[5].invalidParams).toEqual({ questionText: 5, correctAnswer: 6, explanation: 7, categoryId: 8, imageUrl: 9 });

        expect(Question.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should return 400 error if parameters length not respected', async () => { 
        const shortQuestionText = generateString(QUESTION_QUESTIONTEXT_MIN_LENGTH - 1);
        const longQuestionText = generateString(QUESTION_QUESTIONTEXT_MAX_LENGTH + 1);
        const shortOptions = generateString(QUESTION_ANSWER_MIX_LENGTH - 1);
        const longOptions = generateString(QUESTION_ANSWER_MAX_LENGTH + 1);        
        const shortCorrectAnswer = shortOptions;
        const longCorrectAnswer = longOptions;
        const shortExplanation = generateString(QUESTION_EXPLANATION_MIN_LENGTH - 1);
        const longExplanation = generateString(QUESTION_EXPLANATION_MAX_LENGTH + 1);
        const invalidCategoryId = 'invalid-format';
        const shortImageUrl = generateString(QUESTION_IMAGEURL_MIN_LENGTH - 1);
        const longImageUrl = generateString(QUESTION_IMAGEURL_MAX_LENGTH + 1);
        
        const newQuestions =  [{ 
            questionText: longQuestionText, 
            options: [shortOptions, longOptions, 'answer 3', 'answer 4'],
            correctAnswer: shortCorrectAnswer,
            explanation: shortExplanation,
            categoryId: invalidCategoryId,        
            imageUrl: longImageUrl
        }, 
        { 
            questionText: shortQuestionText, 
            options: ['answer 1', 'answer 2', longOptions, shortOptions],
            correctAnswer: longCorrectAnswer,
            explanation: longExplanation,
            categoryId: invalidCategoryId,        
            imageUrl: shortImageUrl
        }];

        Question.prototype.save.mockResolvedValue(newQuestions);
        const res = await authPost(app, '/questions/bulk', { questions: newQuestions });
        console.log("res.body", res.body)
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');        
        expect(res.body.length).toBe(12);
        expect(res.body.errors.length).toBe(12);
        expect(res.body.errors[0].error).toBe(`Question Text must be between ${QUESTION_QUESTIONTEXT_MIN_LENGTH} and ${QUESTION_QUESTIONTEXT_MAX_LENGTH} characters`);
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].invalidParams).toEqual({ questionText: longQuestionText });        
        expect(res.body.errors[1].error).toBe(`All options answers must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`);
        expect(res.body.errors[1].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[1].invalidParams).toEqual({ options: [shortOptions, longOptions, 'answer 3', 'answer 4'] });               
        expect(res.body.errors[2].error).toBe(`Correct Answer must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`);
        expect(res.body.errors[2].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[2].invalidParams).toEqual({ correctAnswer: shortCorrectAnswer });
        expect(res.body.errors[3].error).toBe(`Explanation must be between ${QUESTION_EXPLANATION_MIN_LENGTH} and ${QUESTION_EXPLANATION_MAX_LENGTH} characters`);
        expect(res.body.errors[3].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[3].invalidParams).toEqual({ explanation: shortExplanation });
        expect(res.body.errors[4].error).toBe('Invalid category ID format');
        expect(res.body.errors[4].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[4].invalidParams).toEqual({ categoryId: invalidCategoryId });
        expect(res.body.errors[5].error).toBe(`Image Url must be between ${QUESTION_IMAGEURL_MIN_LENGTH} and ${QUESTION_IMAGEURL_MAX_LENGTH} characters`);
        expect(res.body.errors[5].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[5].invalidParams).toEqual({ imageUrl: longImageUrl });
        expect(res.body.errors[6].error).toBe(`Question Text must be between ${QUESTION_QUESTIONTEXT_MIN_LENGTH} and ${QUESTION_QUESTIONTEXT_MAX_LENGTH} characters`);
        expect(res.body.errors[6].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[6].invalidParams).toEqual({ questionText: shortQuestionText });
        expect(res.body.errors[7].error).toBe(`All options answers must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`);
        expect(res.body.errors[7].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[7].invalidParams).toEqual({ options: ['answer 1', 'answer 2', longOptions, shortOptions] });
        expect(res.body.errors[8].error).toBe(`Correct Answer must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`);
        expect(res.body.errors[8].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[8].invalidParams).toEqual({ correctAnswer: longCorrectAnswer });
        expect(res.body.errors[9].error).toBe(`Explanation must be between ${QUESTION_EXPLANATION_MIN_LENGTH} and ${QUESTION_EXPLANATION_MAX_LENGTH} characters`);
        expect(res.body.errors[9].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[9].invalidParams).toEqual({ explanation: longExplanation });
        expect(res.body.errors[10].error).toBe('Invalid category ID format');
        expect(res.body.errors[10].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[10].invalidParams).toEqual({ categoryId: invalidCategoryId });
        expect(res.body.errors[11].error).toBe(`Image Url must be between ${QUESTION_IMAGEURL_MIN_LENGTH} and ${QUESTION_IMAGEURL_MAX_LENGTH} characters`);
        expect(res.body.errors[11].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[11].invalidParams).toEqual({ imageUrl: shortImageUrl });
    });

    it('should return 400 error if options parameter is not 4 elements', async () => {
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2'],
                correctAnswer: 'answer 1',
                categoryId: '605c72c1e4b0a62d24356473', 
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockResolvedValue(newQuestions);
        const res = await authPost(app, '/questions/bulk', { questions: newQuestions });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');
        expect(res.body.errors[0].error).toBe('Options must be an array of exactly 4 elements');
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].invalidParams.options).toEqual(['answer 1', 'answer 2']);
    });

    it('should return 400 error if null or empty elements in options parameter', async () => {
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', '', 'answer 3', null],
                correctAnswer: 'answer 1',
                categoryId: '605c72c1e4b0a62d24356473', 
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockResolvedValue(newQuestions);
        const res = await authPost(app, '/questions/bulk', { questions: newQuestions });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');
        expect(res.body.errors[0].error).toBe('Options are in wrong format, it\'s cannot contain null or empty elements either');
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].invalidParams.options).toEqual(['answer 1', '', 'answer 3', null]);
    });

    it('should return 400 error if duplicates in options parameter', async () => {
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 3'],
                correctAnswer: 'answer 1',
                categoryId: '605c72c1e4b0a62d24356473', 
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockResolvedValue(newQuestions);
        const res = await authPost(app, '/questions/bulk', { questions: newQuestions });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');
        expect(res.body.errors[0].error).toBe('Options must be unique');
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].invalidParams.options).toEqual(['answer 1', 'answer 2', 'answer 3', 'answer 3']);
    });

    it('should return 400 error if correctAnswer is not included in options', async () => {
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 0',
                categoryId: '605c72c1e4b0a62d24356473', 
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockResolvedValue(newQuestions);
        const res = await authPost(app, '/questions/bulk', { questions: newQuestions });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');
        expect(res.body.errors[0].error).toBe('Correct answer must be one of the options');
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].invalidParams.correctAnswer).toBe('answer 0');
    });

    it('should return 400 if categoryId does not exist in the Category collection', async () => {
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 1',
                categoryId: '6702a8418357fa576c95ea44', 
                imageUrl: 'http//imageUrl0'
            }
        ];
        Category.findById.mockResolvedValue(null);

        const res = await authPost(app, '/questions/bulk', { questions: newQuestions });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');
        expect(res.body.errors[0].error).toBe('Invalid categoryId. Category does not exist');
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].invalidParams.categoryId).toBe(newQuestions[0].categoryId);
    });

    it('should create questions successfully', async () => {
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 1',
                categoryId: '6702a8418357fa576c95ea43', 
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockResolvedValue(newQuestions[0]);
        const res = await authPost(app, '/questions/bulk', { questions: newQuestions });
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Questions created successfully');
        expect(res.body.questions).toEqual(expect.arrayContaining([newQuestions[0]]));
    });

    it('should return 404 error if Category not found', async () => {
        Category.find.mockResolvedValue(null);
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 1',
                categoryId: '6702a8418357fa576c95ea43', 
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockResolvedValue(newQuestions[0]);
        const res = await authPost(app, '/questions/bulk', { questions: newQuestions });
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Category not found');
    });

    it('should return 500 error if Category not found', async () => {
        Category.find.mockRejectedValue(new Error('Database error'));
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 1',
                categoryId: '6702a8418357fa576c95ea43', 
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockResolvedValue(newQuestions[0]);
        const res = await authPost(app, '/questions/bulk', { questions: newQuestions });
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return 500 error if save fails', async () => {
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 1',
                categoryId: '6702a8418357fa576c95ea43', 
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockRejectedValue(new Error('Database error'));
        const res = await authPost(app, '/questions/bulk', { questions: newQuestions });
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });
});

// POST /questions/csv
describe('POST /questions/csv', () => {
    it('should return 400 error if missing questions parameter or empty', async () => {
        const csvBufferMissing = Buffer.from('');
        const resMissing = await authUpload(app, '/questions/csv', 'questions', arrayToCustomCsvBuffer(headersQuestions, csvBufferMissing), 'questions.csv');
        expect(resMissing.status).toBe(400);
        expect(resMissing.body.message).toBe('An error occurred');
        expect(resMissing.body.error).toBe('Questions must be a non-empty array');

        const csvBufferEmpty = Buffer.from('questionId,questionText,options,correctAnswer,explanation,categoryId\n');
        const resEmpty = await authUpload(app, '/questions/csv', 'questions', csvBufferEmpty, 'questions.csv'); 
        expect(resEmpty.status).toBe(400);
        expect(resEmpty.body.message).toBe('An error occurred');
        expect(resEmpty.body.error).toBe('Questions must be a non-empty array');
    });

    it('should return 400 error if missing parameters', async () => {
        const newQuestions = [
            { options: ['answer 11', 'answer 12', 'answer 13', 'answer 14'], correctAnswer: 'answer 11', categoryId: '6702a8418357fa576c95ea43', imageUrl: 'http//imageUrl0' },
            { questionText: 'Question text 2', correctAnswer: 'answer 22', categoryId: '6702a8418357fa576c95ea43', imageUrl: 'http//imageUrl1' },
            { questionText: 'Question text 3', options: ['answer 31', 'answer 32', 'answer 33', 'answer 34'], categoryId: '6702a8418357fa576c95ea43', imageUrl: 'http//imageUrl3' },
            { questionText: 'Question text 4', options: ['answer 41', 'answer 42', 'answer 43', 'answer 44'], correctAnswer: 'answer 44', imageUrl: 'http//imageUrl4' },
            { questionText: 'Question text 5', options: ['answer 51', 'answer 52', 'answer 53', 'answer 54'], correctAnswer: 'answer 51', categoryId: '6702a8418357fa576c95ea43' },            
            { questionText: 'Question text 5', explanation: 'explanation' },
            {}
        ];
        Question.prototype.save.mockResolvedValue(newQuestions);

        const res = await authUpload(app, '/questions/csv', 'questions', arrayToCustomCsvBuffer(headersQuestions, newQuestions), 'questions.csv');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');
        expect(res.body.length).toBe(newQuestions.length);
        expect(res.body.errors.length).toBe(newQuestions.length);
        expect(res.body.errors[0].error).toBe('Missing parameters');
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].missing).toEqual([ 'questionText' ]);
        expect(res.body.errors[1].error).toBe('Missing parameters');
        expect(res.body.errors[1].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[1].missing).toEqual([ 'options' ]);
        expect(res.body.errors[2].error).toBe('Missing parameters');
        expect(res.body.errors[2].question).toMatchObject(newQuestions[2]);
        expect(res.body.errors[2].missing).toEqual([ 'correctAnswer' ]);
        expect(res.body.errors[3].error).toBe('Missing parameters');
        expect(res.body.errors[3].question).toMatchObject(newQuestions[3]);
        expect(res.body.errors[3].missing).toEqual([ 'categoryId' ]);
        expect(res.body.errors[4].error).toBe('Missing parameters');
        expect(res.body.errors[4].question).toMatchObject(newQuestions[4]);
        expect(res.body.errors[4].missing).toEqual([ 'imageUrl' ]);
        expect(res.body.errors[5].error).toBe('Missing parameters');
        expect(res.body.errors[5].question).toMatchObject(newQuestions[5]);
        expect(res.body.errors[5].missing).toEqual([ 'correctAnswer', 'categoryId', 'imageUrl', 'options' ]);
        expect(res.body.errors[6].error).toBe('Missing parameters');
        expect(res.body.errors[5].question).toMatchObject(newQuestions[6]);
        expect(res.body.errors[6].missing).toEqual([ 'questionText', 'correctAnswer', 'categoryId', 'imageUrl', 'options' ]);

        expect(Question.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should return 400 error if parameters length not respected', async () => { 
        const shortQuestionText = generateString(QUESTION_QUESTIONTEXT_MIN_LENGTH - 1);
        const longQuestionText = generateString(QUESTION_QUESTIONTEXT_MAX_LENGTH + 1);
        const shortOptions = generateString(QUESTION_ANSWER_MIX_LENGTH - 1);
        const longOptions = generateString(QUESTION_ANSWER_MAX_LENGTH + 1);        
        const shortCorrectAnswer = shortOptions;
        const longCorrectAnswer = longOptions;
        const shortExplanation = generateString(QUESTION_EXPLANATION_MIN_LENGTH - 1);
        const longExplanation = generateString(QUESTION_EXPLANATION_MAX_LENGTH + 1);
        const invalidCategoryId = 'invalid-format';
        const shortImageUrl = generateString(QUESTION_IMAGEURL_MIN_LENGTH - 1);
        const longImageUrl = generateString(QUESTION_IMAGEURL_MAX_LENGTH + 1);
        
        const newQuestions =  [{ 
            questionText: longQuestionText, 
            options: [shortOptions, longOptions, 'answer 3', 'answer 4'],
            correctAnswer: shortCorrectAnswer,
            explanation: shortExplanation,
            categoryId: invalidCategoryId,        
            imageUrl: longImageUrl
        }, 
        { 
            questionText: shortQuestionText, 
            options: ['answer 1', 'answer 2', longOptions, shortOptions],
            correctAnswer: longCorrectAnswer,
            explanation: longExplanation,
            categoryId: invalidCategoryId,        
            imageUrl: shortImageUrl
        }];
        Question.prototype.save.mockResolvedValue(newQuestions);

        const res = await authUpload(app, '/questions/csv', 'questions', arrayToCustomCsvBuffer(headersQuestions, newQuestions), 'questions.csv');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');        
        expect(res.body.length).toBe(12);
        expect(res.body.errors.length).toBe(12);
        expect(res.body.errors[0].error).toBe(`Question Text must be between ${QUESTION_QUESTIONTEXT_MIN_LENGTH} and ${QUESTION_QUESTIONTEXT_MAX_LENGTH} characters`);
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].invalidParams).toEqual({ questionText: longQuestionText });        
        expect(res.body.errors[1].error).toBe(`All options answers must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`);
        expect(res.body.errors[1].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[1].invalidParams).toEqual({ options: [shortOptions, longOptions, 'answer 3', 'answer 4'] });               
        expect(res.body.errors[2].error).toBe(`Correct Answer must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`);
        expect(res.body.errors[2].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[2].invalidParams).toEqual({ correctAnswer: shortCorrectAnswer });
        expect(res.body.errors[3].error).toBe(`Explanation must be between ${QUESTION_EXPLANATION_MIN_LENGTH} and ${QUESTION_EXPLANATION_MAX_LENGTH} characters`);
        expect(res.body.errors[3].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[3].invalidParams).toEqual({ explanation: shortExplanation });
        expect(res.body.errors[4].error).toBe('Invalid category ID format');
        expect(res.body.errors[4].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[4].invalidParams).toEqual({ categoryId: invalidCategoryId });
        expect(res.body.errors[5].error).toBe(`Image Url must be between ${QUESTION_IMAGEURL_MIN_LENGTH} and ${QUESTION_IMAGEURL_MAX_LENGTH} characters`);
        expect(res.body.errors[5].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[5].invalidParams).toEqual({ imageUrl: longImageUrl });
        expect(res.body.errors[6].error).toBe(`Question Text must be between ${QUESTION_QUESTIONTEXT_MIN_LENGTH} and ${QUESTION_QUESTIONTEXT_MAX_LENGTH} characters`);
        expect(res.body.errors[6].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[6].invalidParams).toEqual({ questionText: shortQuestionText });
        expect(res.body.errors[7].error).toBe(`All options answers must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`);
        expect(res.body.errors[7].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[7].invalidParams).toEqual({ options: ['answer 1', 'answer 2', longOptions, shortOptions] });
        expect(res.body.errors[8].error).toBe(`Correct Answer must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`);
        expect(res.body.errors[8].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[8].invalidParams).toEqual({ correctAnswer: longCorrectAnswer });
        expect(res.body.errors[9].error).toBe(`Explanation must be between ${QUESTION_EXPLANATION_MIN_LENGTH} and ${QUESTION_EXPLANATION_MAX_LENGTH} characters`);
        expect(res.body.errors[9].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[9].invalidParams).toEqual({ explanation: longExplanation });
        expect(res.body.errors[10].error).toBe('Invalid category ID format');
        expect(res.body.errors[10].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[10].invalidParams).toEqual({ categoryId: invalidCategoryId });
        expect(res.body.errors[11].error).toBe(`Image Url must be between ${QUESTION_IMAGEURL_MIN_LENGTH} and ${QUESTION_IMAGEURL_MAX_LENGTH} characters`);
        expect(res.body.errors[11].question).toMatchObject(newQuestions[1]);
        expect(res.body.errors[11].invalidParams).toEqual({ imageUrl: shortImageUrl });
    });

    it('should return 400 error if options parameter is not 4 elements', async () => {
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2'],
                correctAnswer: 'answer 1',
                categoryId: '6702a8418357fa576c95ea43',
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockResolvedValue(newQuestions);

        const res = await authUpload(app, '/questions/csv', 'questions', arrayToCustomCsvBuffer(headersQuestions, newQuestions), 'questions.csv');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');
        expect(res.body.errors[0].error).toBe('Options must be an array of exactly 4 elements');
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].invalidParams.options).toEqual(['answer 1', 'answer 2']);
    });

    it('should return 400 error if null or empty elements in options parameter', async () => {
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', '', 'answer 3', ''],
                correctAnswer: 'answer 1',
                categoryId: '6702a8418357fa576c95ea43',
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockResolvedValue(newQuestions);

        const res = await authUpload(app, '/questions/csv', 'questions', arrayToCustomCsvBuffer(headersQuestions, newQuestions), 'questions.csv');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');
        expect(res.body.errors[0].error).toBe('Options are in wrong format, it\'s cannot contain null or empty elements either');
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].invalidParams.options).toEqual(['answer 1', '', 'answer 3', '']);
    });

    it('should return 400 error if duplicates in options parameter', async () => {
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 3'],
                correctAnswer: 'answer 1',
                categoryId: '6702a8418357fa576c95ea43',
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockResolvedValue(newQuestions);

        const res = await authUpload(app, '/questions/csv', 'questions', arrayToCustomCsvBuffer(headersQuestions, newQuestions), 'questions.csv'); 
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');
        expect(res.body.errors[0].error).toBe('Options must be unique');
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].invalidParams.options).toEqual(['answer 1', 'answer 2', 'answer 3', 'answer 3']);
    });

    it('should return 400 error if correctAnswer is not included in options', async () => {
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 0',
                categoryId: '6702a8418357fa576c95ea43',
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockResolvedValue(newQuestions);

        const res = await authUpload(app, '/questions/csv', 'questions', arrayToCustomCsvBuffer(headersQuestions, newQuestions), 'questions.csv');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');
        expect(res.body.errors[0].error).toBe('Correct answer must be one of the options');
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].invalidParams.correctAnswer).toBe('answer 0');
    });

    it('should return 400 if categoryId does not exist in the Category collection', async () => {
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 1',
                categoryId: '6702a8418357fa576c95ea44',
                imageUrl: 'http//imageUrl0'
            }
        ];
        Category.findById.mockResolvedValue(null);

        const res = await authUpload(app, '/questions/csv', 'questions', arrayToCustomCsvBuffer(headersQuestions, newQuestions), 'questions.csv');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some questions could not be processed');
        expect(res.body.errors[0].error).toBe('Invalid categoryId. Category does not exist');
        expect(res.body.errors[0].question).toMatchObject(newQuestions[0]);
        expect(res.body.errors[0].invalidParams.categoryId).toBe('6702a8418357fa576c95ea44');
    });

    it('should create questions successfully', async () => {
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 1',
                categoryId: '6702a8418357fa576c95ea43',
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockResolvedValue(newQuestions[0]);

        const res = await authUpload(app, '/questions/csv', 'questions', arrayToCustomCsvBuffer(headersQuestions, newQuestions), 'questions.csv');
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Questions created successfully');
        expect(res.body.questions).toEqual(expect.arrayContaining([newQuestions[0]]));
    });

    it('should return 404 error if Category not found', async () => {
        Category.find.mockResolvedValue(null);
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 1',
                categoryId: '6702a8418357fa576c95ea43',
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockResolvedValue(newQuestions[0]);

        const res = await authUpload(app, '/questions/csv', 'questions', arrayToCustomCsvBuffer(headersQuestions, newQuestions), 'questions.csv');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Category not found');
    });

    it('should return 500 error if Category not found', async () => {
        Category.find.mockRejectedValue(new Error('Database error'));
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 1',
                categoryId: '6702a8418357fa576c95ea43',
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockResolvedValue(newQuestions[0]);

        const res = await authUpload(app, '/questions/csv', 'questions', arrayToCustomCsvBuffer(headersQuestions, newQuestions), 'questions.csv'); 
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return 500 error if save fails', async () => {
        const newQuestions = [
            {
                questionText: 'Question text',
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'],
                correctAnswer: 'answer 1',
                categoryId: '6702a8418357fa576c95ea43',
                imageUrl: 'http//imageUrl0'
            }
        ];
        Question.prototype.save.mockRejectedValue(new Error('Database error'));

        const res = await authUpload(app, '/questions/csv', 'questions', arrayToCustomCsvBuffer(headersQuestions, newQuestions), 'questions.csv');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return 500 and error message for failed CSV processing', async () => {
        const res = await authUpload(app, '/questions/csv', 'questions', null, 'questions.csv');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Failed to process CSV');
    });
})


/********/
/* UPDATE */
/********/

// PATCH /questions/:id
describe('PATCH /questions/:id', () => {
    it('should return 400 error if question ID format is invalid', async () => {
        const res = await authPatch(app, '/questions/invalid-id', { questionText: 'Updated Question Text' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Invalid question ID format');
    });

    it('should return 404 if question not found', async () => {
        Question.findById.mockResolvedValue(null);
        const res = await authPatch(app, `/questions/${mockValue._id.toString()}`, { questionText: 'Updated Question Text' });
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Question not found');
    });

    it('should return 500 error if findById fails', async () => {
        Question.findById.mockRejectedValue(new Error('Database error'));
        const res = await authPatch(app, `/questions/${mockValue._id.toString()}`, { questionText: 'Updated Question Text' });
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return 400 error if options parameter is not 4 elements', async () => {
        const questionToUpdate = { ...mockValue, save: jest.fn().mockResolvedValue(mockValue) };
        Question.findById.mockResolvedValue(questionToUpdate);

        const resEmpty = await authPatch(app, `/questions/${mockValue._id.toString()}`, { options: [] });
        expect(resEmpty.status).toBe(400);
        expect(resEmpty.body.message).toBe('An error occurred');
        expect(resEmpty.body.error).toBe('Options must be an array of exactly 4 elements');

        const resLessThanFour = await authPatch(app, `/questions/${mockValue._id.toString()}`, { options: ['answer 1', 'answer 2'] });
        expect(resLessThanFour.status).toBe(400);
        expect(resLessThanFour.body.message).toBe('An error occurred');
        expect(resLessThanFour.body.error).toBe('Options must be an array of exactly 4 elements');
        expect(resLessThanFour.body.invalidParams.options).toEqual(['answer 1', 'answer 2']);
    });

    it('should return 400 error if null or empty elements in options parameter', async () => {
        const questionToUpdate = { ...mockValue, save: jest.fn().mockResolvedValue(mockValue) };
        Question.findById.mockResolvedValue(questionToUpdate);
        const res = await authPatch(app, `/questions/${mockValue._id.toString()}`, { options: ['answer 1', '', 'answer 3', null] });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Options are in wrong format, it\'s cannot contain null or empty elements either');
        expect(res.body.invalidParams.options).toEqual(['answer 1', '', 'answer 3', null]);
    });

    it('should return 400 error if duplicates in options parameter', async () => {
        const questionToUpdate = { ...mockValue, save: jest.fn().mockResolvedValue(mockValue) };
        Question.findById.mockResolvedValue(questionToUpdate);
        const res = await authPatch(app, `/questions/${mockValue._id.toString()}`, { options: ['answer 1', 'answer 2', 'answer 3', 'answer 3'] });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Options must be unique');
        expect(res.body.invalidParams.options).toEqual(['answer 1', 'answer 2', 'answer 3', 'answer 3']);
    });

    it('should return 400 error if correctAnswer parameter is not included in options parameter', async () => {
        const questionToUpdate = { ...mockValue, save: jest.fn().mockResolvedValue(mockValue) };
        Question.findById.mockResolvedValue(questionToUpdate);

        const resOnlyOptions = await authPatch(app, `/questions/${mockValue._id.toString()}`, { options: ['answer a', 'answer b', 'answer c', 'answer d'] });
        expect(resOnlyOptions.status).toBe(400);
        expect(resOnlyOptions.body.message).toBe('An error occurred');
        expect(resOnlyOptions.body.error).toBe('Correct answer must be one of the options');
        expect(resOnlyOptions.body.invalidParams.options).toEqual(['answer a', 'answer b', 'answer c', 'answer d']);
        expect(resOnlyOptions.body.invalidParams.correctAnswer).toEqual(mockValue.correctAnswer);

        const resOnlyCorrectAnswer = await authPatch(app, `/questions/${mockValue._id.toString()}`, { correctAnswer: 'notCorrect' });
        expect(resOnlyCorrectAnswer.status).toBe(400);
        expect(resOnlyCorrectAnswer.body.message).toBe('An error occurred');
        expect(resOnlyCorrectAnswer.body.error).toBe('Correct answer must be one of the options');
        expect(resOnlyCorrectAnswer.body.invalidParams.options).toEqual(mockValue.options);
        expect(resOnlyCorrectAnswer.body.invalidParams.correctAnswer).toEqual('notCorrect');

        const resBothParameters = await authPatch(app, `/questions/${mockValue._id.toString()}`, { options: ['answer a', 'answer b', 'answer c', 'answer d'], correctAnswer: 'notCorrect' });
        expect(resBothParameters.status).toBe(400);
        expect(resBothParameters.body.message).toBe('An error occurred');
        expect(resBothParameters.body.error).toBe('Correct answer must be one of the options');
        expect(resBothParameters.body.invalidParams.options).toEqual(['answer a', 'answer b', 'answer c', 'answer d']);
        expect(resBothParameters.body.invalidParams.correctAnswer).toEqual('notCorrect');
    });

    it('should return 400 error if parameters are not a string', async () => {
        const questionToUpdate = { ...mockValue, save: jest.fn().mockResolvedValue(mockValue) };
        Question.findById.mockResolvedValue(questionToUpdate);

        const resQuestionTextNotString = await authPatch(app, `/questions/${mockValue._id.toString()}`, { questionText: 0 });
        expect(resQuestionTextNotString.status).toBe(400);
        expect(resQuestionTextNotString.body.message).toBe('An error occurred');
        expect(resQuestionTextNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resQuestionTextNotString.body.invalidParams).toEqual({ questionText: 0 });

        const resCorrectAnswerNotString = await authPatch(app, `/questions/${mockValue._id.toString()}`, { correctAnswer: 1 });
        expect(resCorrectAnswerNotString.status).toBe(400);
        expect(resCorrectAnswerNotString.body.message).toBe('An error occurred');
        expect(resCorrectAnswerNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resCorrectAnswerNotString.body.invalidParams).toEqual({ correctAnswer: 1 });
        
        const resExplanationNotString = await authPatch(app, `/questions/${mockValue._id.toString()}`, { explanation: 2 });
        expect(resExplanationNotString.status).toBe(400);
        expect(resExplanationNotString.body.message).toBe('An error occurred');
        expect(resExplanationNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resExplanationNotString.body.invalidParams).toEqual({ explanation: 2 });
        
        const resCategoryIdNotString = await authPatch(app, `/questions/${mockValue._id.toString()}`, { categoryId: 3 });
        expect(resCategoryIdNotString.status).toBe(400);
        expect(resCategoryIdNotString.body.message).toBe('An error occurred');
        expect(resCategoryIdNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resCategoryIdNotString.body.invalidParams).toEqual({ categoryId: 3 });
        
        const resImageUrlNotString = await authPatch(app, `/questions/${mockValue._id.toString()}`, { imageUrl: 4 });
        expect(resImageUrlNotString.status).toBe(400);
        expect(resImageUrlNotString.body.message).toBe('An error occurred');
        expect(resImageUrlNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resImageUrlNotString.body.invalidParams).toEqual({ imageUrl: 4 });

        const resAllParametersNotString = await authPatch(app, `/questions/${mockValue._id.toString()}`, { questionText: 0, correctAnswer: 1, explanation: 2, categoryId: 3, imageUrl: 4 });
        expect(resAllParametersNotString.status).toBe(400);
        expect(resAllParametersNotString.body.message).toBe('An error occurred');
        expect(resAllParametersNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resAllParametersNotString.body.invalidParams).toEqual({ questionText: 0, correctAnswer: 1, explanation: 2, categoryId: 3, imageUrl: 4 });
    });

    it('should return 400 error if parameters length not respected', async () => { 
        const questionToUpdate = { ...mockValue, save: jest.fn().mockResolvedValue(mockValue) };
        Question.findById.mockResolvedValue(questionToUpdate);

        const shortQuestionText = generateString(QUESTION_QUESTIONTEXT_MIN_LENGTH - 1);
        const resShortQuestionText = await authPatch(app, `/questions/${mockValue._id.toString()}`, { questionText: shortQuestionText });
        expect(resShortQuestionText.status).toBe(400);
        expect(resShortQuestionText.body.message).toBe('An error occurred');
        expect(resShortQuestionText.body.error).toBe('Validation failed');
        expect(resShortQuestionText.body.invalidLength).toEqual([`Question Text must be between ${QUESTION_QUESTIONTEXT_MIN_LENGTH} and ${QUESTION_QUESTIONTEXT_MAX_LENGTH} characters`]);

        const longQuestionText = generateString(QUESTION_QUESTIONTEXT_MAX_LENGTH + 1);
        const resLongQuestionText = await authPatch(app, `/questions/${mockValue._id.toString()}`, { questionText: longQuestionText });
        expect(resLongQuestionText.status).toBe(400);
        expect(resLongQuestionText.body.message).toBe('An error occurred');
        expect(resLongQuestionText.body.error).toBe('Validation failed');
        expect(resLongQuestionText.body.invalidLength).toEqual([`Question Text must be between ${QUESTION_QUESTIONTEXT_MIN_LENGTH} and ${QUESTION_QUESTIONTEXT_MAX_LENGTH} characters`]);

        const shortOptions = generateString(QUESTION_ANSWER_MIX_LENGTH - 1);
        const resShortOptions = await authPatch(app, `/questions/${mockValue._id.toString()}`, { options: [ 'answer 1', 'answer 2', shortOptions , 'answer 4' ] });
        expect(resShortOptions.status).toBe(400);
        expect(resShortOptions.body.message).toBe('An error occurred');
        expect(resShortOptions.body.error).toBe('Validation failed');
        expect(resShortOptions.body.invalidLength).toEqual([`All options answers must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`]);

        const longOptions = generateString(QUESTION_ANSWER_MAX_LENGTH + 1);
        const resLongOptions = await authPatch(app, `/questions/${mockValue._id.toString()}`, { options: [ 'answer 1', 'answer 2', 'answer 3' , longOptions ] });
        expect(resLongOptions.status).toBe(400);
        expect(resLongOptions.body.message).toBe('An error occurred');
        expect(resLongOptions.body.error).toBe('Validation failed');
        expect(resLongOptions.body.invalidLength).toEqual([`All options answers must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`]);

        const shortCorrectAnswer = generateString(QUESTION_ANSWER_MIX_LENGTH - 1);
        const resShortCorrectAnswer = await authPatch(app, `/questions/${mockValue._id.toString()}`, { correctAnswer: shortCorrectAnswer });
        expect(resShortCorrectAnswer.status).toBe(400);
        expect(resShortCorrectAnswer.body.message).toBe('An error occurred');
        expect(resShortCorrectAnswer.body.error).toBe('Validation failed');
        expect(resShortCorrectAnswer.body.invalidLength).toEqual([`Correct Answer must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`]);

        const longCorrectAnswer = generateString(QUESTION_ANSWER_MAX_LENGTH + 1);
        const resLongCorrectAnswer = await authPatch(app, `/questions/${mockValue._id.toString()}`, { correctAnswer: longCorrectAnswer });
        expect(resLongCorrectAnswer.status).toBe(400);
        expect(resLongCorrectAnswer.body.message).toBe('An error occurred');
        expect(resLongCorrectAnswer.body.error).toBe('Validation failed');
        expect(resLongCorrectAnswer.body.invalidLength).toEqual([`Correct Answer must be between ${QUESTION_ANSWER_MIX_LENGTH} and ${QUESTION_ANSWER_MAX_LENGTH} characters`]);

        const shortExplanation = generateString(QUESTION_EXPLANATION_MIN_LENGTH - 1);
        const resShortExplanation = await authPatch(app, `/questions/${mockValue._id.toString()}`, { explanation: shortExplanation });
        expect(resShortExplanation.status).toBe(400);
        expect(resShortExplanation.body.message).toBe('An error occurred');
        expect(resShortExplanation.body.error).toBe('Validation failed');
        expect(resShortExplanation.body.invalidLength).toEqual([`Explanation must be between ${QUESTION_EXPLANATION_MIN_LENGTH} and ${QUESTION_EXPLANATION_MAX_LENGTH} characters`]);

        const longExplanation = generateString(QUESTION_EXPLANATION_MAX_LENGTH + 1);
        const resLongExplanation = await authPatch(app, `/questions/${mockValue._id.toString()}`, { explanation: longExplanation });
        expect(resLongExplanation.status).toBe(400);
        expect(resLongExplanation.body.message).toBe('An error occurred');
        expect(resLongExplanation.body.error).toBe('Validation failed');
        expect(resLongExplanation.body.invalidLength).toEqual([`Explanation must be between ${QUESTION_EXPLANATION_MIN_LENGTH} and ${QUESTION_EXPLANATION_MAX_LENGTH} characters`]);

        const invalidCategoryId = 'invalid-format';
        const resInvalidCategoryId = await authPatch(app, `/questions/${mockValue._id.toString()}`, { categoryId: invalidCategoryId });
        expect(resInvalidCategoryId.status).toBe(400);
        expect(resInvalidCategoryId.body.message).toBe('An error occurred');
        expect(resInvalidCategoryId.body.error).toBe('Validation failed');
        expect(resInvalidCategoryId.body.invalidLength).toEqual(['Invalid category ID format']);

        const shortImageUrl = generateString(QUESTION_IMAGEURL_MIN_LENGTH - 1);
        const resShortImageUrl = await authPatch(app, `/questions/${mockValue._id.toString()}`, { imageUrl: shortImageUrl });
        expect(resShortImageUrl.status).toBe(400);
        expect(resShortImageUrl.body.message).toBe('An error occurred');
        expect(resShortImageUrl.body.error).toBe('Validation failed');
        expect(resShortImageUrl.body.invalidLength).toEqual([`Image Url must be between ${QUESTION_IMAGEURL_MIN_LENGTH} and ${QUESTION_IMAGEURL_MAX_LENGTH} characters`]);

        const longImageUrl = generateString(QUESTION_IMAGEURL_MAX_LENGTH + 1);
        const resLongImageUrl = await authPatch(app, `/questions/${mockValue._id.toString()}`, { imageUrl: longImageUrl });
        expect(resLongImageUrl.status).toBe(400);
        expect(resLongImageUrl.body.message).toBe('An error occurred');
        expect(resLongImageUrl.body.error).toBe('Validation failed');
        expect(resLongImageUrl.body.invalidLength).toEqual([`Image Url must be between ${QUESTION_IMAGEURL_MIN_LENGTH} and ${QUESTION_IMAGEURL_MAX_LENGTH} characters`]);

        const res = await authPatch(app, `/questions/${mockValue._id.toString()}`, { 
            questionText: longQuestionText, 
            options: [shortOptions, longOptions, 'answer 3', 'answer 4'],
            correctAnswer: shortCorrectAnswer,
            explanation: shortExplanation,
            categoryId: invalidCategoryId,        
            imageUrl: longImageUrl
        });
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

    it('should return 400 if categoryId does not exist in the Category collection', async () => {
        Category.findById.mockResolvedValue(null);
        const questionToUpdate = { ...mockValue, save: jest.fn().mockResolvedValue(mockValue) };
        Question.findById.mockResolvedValue(questionToUpdate);

        const res = await authPatch(app, `/questions/${mockValue._id.toString()}`, { categoryId: '6702a8418357fa576c95ea44' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Invalid categoryId. Category does not exist');
        expect(res.body.invalidParams.categoryId).toBe('6702a8418357fa576c95ea44');
    });
    
    it('should return 200 res if no fields were updated', async () => {
        const questionToUpdate = { ...mockValue, save: jest.fn().mockResolvedValue(mockValue) };
        Question.findById.mockResolvedValue(questionToUpdate);
        const res = await authPatch(app, `/questions/${mockValue._id.toString()}`, { 
            questionText: mockValue.questionText,
            options: mockValue.options,
            correctAnswer: mockValue.correctAnswer,
            explanation: mockValue.explanation,
            categoryId: mockValue.categoryId.toString()
        });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('No fields were updated');
    });

    it('should update a question', async () => {
        const updatedQuestionText = { 
            ...mockValue, 
            save: jest.fn().mockResolvedValue({ ...mockValue, questionText: 'Updated Question Text'})
        };
        Question.findById.mockResolvedValue(updatedQuestionText);
        const resUpdateQuestionText = await authPatch(app, `/questions/${mockValue._id.toString()}`, { questionText: 'Updated Question Text' });
        expect(resUpdateQuestionText.status).toBe(200);
        expect(resUpdateQuestionText.body.questionText).toBe('Updated Question Text');
        expect(updatedQuestionText.save).toHaveBeenCalled();
        
        const updatedCorrectAnswer = { 
            ...mockValue, 
            save: jest.fn().mockResolvedValue({ ...mockValue, correctAnswer: mockValue.options[3]})
        };
        Question.findById.mockResolvedValue(updatedCorrectAnswer);
        const resUpdateCorrectAnswer = await authPatch(app, `/questions/${mockValue._id.toString()}`, { correctAnswer: mockValue.options[3] });
        expect(resUpdateCorrectAnswer.status).toBe(200);
        expect(resUpdateCorrectAnswer.body.correctAnswer).toBe(mockValue.options[3]);
        expect(updatedCorrectAnswer.save).toHaveBeenCalled();

        const updatedExplanation = { 
            ...mockValue,
            save: jest.fn().mockResolvedValue({ ...mockValue, explanation: 'explanation'})
        };
        Question.findById.mockResolvedValue(updatedExplanation);
        const resExplanation = await authPatch(app, `/questions/${mockValue._id.toString()}`, { explanation: 'explanation' });
        expect(resExplanation.status).toBe(200);
        expect(resExplanation.body.explanation).toBe('explanation');
        expect(updatedExplanation.save).toHaveBeenCalled();

        const updatedCategoryId = { 
            ...mockValue, 
            save: jest.fn().mockResolvedValue({ ...mockValue, categoryId: '671e6e7393cee089f87f1f3d'})
        };
        Question.findById.mockResolvedValue(updatedCategoryId);
        const resCategoryId = await authPatch(app, `/questions/${mockValue._id.toString()}`, { categoryId: '671e6e7393cee089f87f1f3d' });
        expect(resCategoryId.status).toBe(200);
        expect(resCategoryId.body.categoryId).toBe('671e6e7393cee089f87f1f3d');
        expect(updatedCategoryId.save).toHaveBeenCalled();
    
        const updatedImageUrl = { 
            ...mockValue, 
            save: jest.fn().mockResolvedValue({ ...mockValue, imageUrl: 'http://imageUrl10',})
        };
        Question.findById.mockResolvedValue(updatedImageUrl);
        const resImageUrl = await authPatch(app, `/questions/${mockValue._id.toString()}`, { imageUrl: 'http://imageUrl10' });
        expect(resImageUrl.status).toBe(200);
        expect(resImageUrl.body.imageUrl).toBe('http://imageUrl10');
        expect(updatedImageUrl.save).toHaveBeenCalled();

        const updatedQuestionAll = { 
            ...mockValue,
            save: jest.fn().mockResolvedValue({ ...mockValue, 
                questionText: 'Updated Question Text', 
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'], 
                correctAnswer: 'answer 1', 
                explanation: 'explanation',
                categoryId: '671e6e7393cee089f87f1f3d',
                imageUrl: 'http://imageUrl10'
            })
        };
        Question.findById.mockResolvedValue(updatedQuestionAll); 
        const resUpdateAll = await authPatch(app, `/questions/${mockValue._id.toString()}`, { 
            questionText: 'Updated Question Text', 
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'], 
            correctAnswer: 'answer 1', 
            explanation: 'explanation',
            categoryId: '671e6e7393cee089f87f1f3d',
            imageUrl: 'http://imageUrl10'
        });
        expect(resUpdateAll.status).toBe(200);
        expect(resUpdateAll.body.questionText).toBe('Updated Question Text');
        expect(resUpdateAll.body.options).toEqual(['answer 1', 'answer 2', 'answer 3', 'answer 4']);
        expect(resUpdateAll.body.correctAnswer).toBe('answer 1');
        expect(resUpdateAll.body.explanation).toBe('explanation');
        expect(resUpdateAll.body.categoryId).toBe('671e6e7393cee089f87f1f3d');
        expect(resUpdateAll.body.imageUrl).toBe('http://imageUrl10');
        expect(updatedQuestionAll.save).toHaveBeenCalled();
    });

    it('should return 404 error if Category not found', async () => {
        Category.find.mockResolvedValue(null);
        const updatedQuestionAll = { 
            ...mockValue,
            save: jest.fn().mockResolvedValue({ ...mockValue, 
                questionText: 'Updated Question Text', 
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'], 
                correctAnswer: 'answer 1', 
                explanation: 'explanation',
                categoryId: '671e6e7393cee089f87f1f3d',
                imageUrl: 'http://imageUrl10'
            })
        };
        Question.findById.mockResolvedValue(updatedQuestionAll);
        const res = await authPatch(app, `/questions/${mockValue._id.toString()}`, { 
            questionText: 'Updated Question Text', 
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'], 
            correctAnswer: 'answer 1', 
            explanation: 'explanation',
            categoryId: '671e6e7393cee089f87f1f3d',
            imageUrl: 'http://imageUrl10'
        });
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Category not found');
    });

    it('should return 500 error if Category not found', async () => {
        Category.find.mockRejectedValue(new Error('Database error'));
        const updatedQuestionAll = { 
            ...mockValue,
            save: jest.fn().mockResolvedValue({ ...mockValue, 
                questionText: 'Updated Question Text', 
                options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'], 
                correctAnswer: 'answer 1', 
                explanation: 'explanation',
                categoryId: '671e6e7393cee089f87f1f3d',
                imageUrl: 'http//imageUrl10'
            })
        };
        Question.findById.mockResolvedValue(updatedQuestionAll);
        const res = await authPatch(app, `/questions/${mockValue._id.toString()}`, { 
            questionText: 'Updated Question Text', 
            options: ['answer 1', 'answer 2', 'answer 3', 'answer 4'], 
            correctAnswer: 'answer 1', 
            explanation: 'explanation',
            categoryId: '671e6e7393cee089f87f1f3d',
            imageUrl: 'http//imageUrl10'
        });
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return 500 error if save fails', async () => {
        const questionToUpdate = { ...mockValue, save: jest.fn().mockRejectedValue(new Error('Save failed'))};
        Question.findById.mockResolvedValue(questionToUpdate);
        const res = await authPatch(app, `/questions/${mockValue._id.toString()}`, { questionText: 'Updated Question Text' });
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Save failed');
    });
});

// PATCH /questions/categories
describe('PATCH /categories/:oldCategoryId/:newCategoryId', () => {
    it('should return 400 if oldCategoryId or newCategoryId are missing', async () => {
        const resOldCategoryIdMissing = await authPatch(app, '/questions/categories//newCategoryId', null);
        expect(resOldCategoryIdMissing.status).toBe(400);
        expect(resOldCategoryIdMissing.body.message).toBe('An error occurred');
        expect(resOldCategoryIdMissing.body.error).toEqual('Both oldCategoryId and newCategoryId are required');

        const resNewCategoryIdMissing = await authPatch(app, '/questions/categories/oldCategoryId', null);
        expect(resNewCategoryIdMissing.status).toBe(400);
        expect(resNewCategoryIdMissing.body.message).toBe('An error occurred');
        expect(resNewCategoryIdMissing.body.error).toEqual('Both oldCategoryId and newCategoryId are required');

        const resBothCategoriesIdMissing = await authPatch(app, '/questions/categories//', null);
        expect(resBothCategoriesIdMissing.status).toBe(400);
        expect(resBothCategoriesIdMissing.body.message).toBe('An error occurred');
        expect(resBothCategoriesIdMissing.body.error).toBe('Both oldCategoryId and newCategoryId are required');
    });

    it('should return 400 if oldCategoryId or newCategoryId has invalid ObjectId format', async () => {
        const resInvalidOldId = await authPatch(app, '/questions/categories/invalidId/671e6e7393cee089f87f1f3d');
        expect(resInvalidOldId.status).toBe(400);
        expect(resInvalidOldId.body.message).toBe('An error occurred');
        expect(resInvalidOldId.body.error).toBe('Invalid ObjectId format');
        expect(resInvalidOldId.body.invalidParams).toEqual({ oldCategoryId: 'invalidId' });

        const resInvalidNewId = await authPatch(app, '/questions/categories/6702a8418357fa576c95ea43/newValidId');
        expect(resInvalidNewId.status).toBe(400);
        expect(resInvalidNewId.body.message).toBe('An error occurred');
        expect(resInvalidNewId.body.error).toBe('Invalid ObjectId format');
        expect(resInvalidNewId.body.invalidParams).toEqual({ newCategoryId: 'newValidId' });
        
        const resInvalidBothId = await authPatch(app, '/questions/categories/invalidId/newValidId');
        expect(resInvalidBothId.status).toBe(400);
        expect(resInvalidBothId.body.message).toBe('An error occurred');
        expect(resInvalidBothId.body.error).toBe('Invalid ObjectId format');
        expect(resInvalidBothId.body.invalidParams).toEqual({ oldCategoryId: 'invalidId', newCategoryId: 'newValidId'});
    });

    it('should return 200 if oldCategoryId and newCategoryId are the same', async () => { 
        const res = await authPatch(app, '/questions/categories/671e6e7393cee089f87f1f3d/671e6e7393cee089f87f1f3d');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('No change occured;oldCategoryId and newCategoryId are the same');
    });

    it('should return 400 if oldCategoryId does not exist in any questions', async () => {
        const res = await authPatch(app, '/questions/categories/6702a8418357fa576c95ea44/671e6e7393cee089f87f1f3d');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('oldCategoryId does not exist in any questions');
    });

    it('should return 400 if newCategoryId does not exist in Categories', async () => {
        Category.findById.mockResolvedValue(null);
        const res = await authPatch(app, '/questions/categories/6702a8418357fa576c95ea43/671e6e7393cee089f87f1f37');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Invalid categoryId. Category does not exist');
        expect(res.body.invalidParams).toEqual({ categoryId: '671e6e7393cee089f87f1f37' });
    });

    it('should update categoryId for questions and return updated questions', async () => {
        const updatedQuestions = [
            {
                ...mockValue,
                categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d'),
                save: jest.fn().mockResolvedValue({ ...mockValue, categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d') })
            },
            {
                ...mockQuestions[1],
                categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d'),
                save: jest.fn().mockResolvedValue({ ...mockQuestions[1], categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d') })
            },
            {
                ...mockQuestions[2],
                categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d'),
                save: jest.fn().mockResolvedValue({ ...mockQuestions[2], categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d') })
            }
        ];
        const res = await authPatch(app, '/questions/categories/6702a8418357fa576c95ea43/671e6e7393cee089f87f1f3d');
        Question.find.mockResolvedValue(updatedQuestions);
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('CategoryId updated successfully');
    });

    it('should return 404 error if Question not found', async () => {
        Question.find.mockResolvedValue(null);
        const updatedQuestions = [
            {
                ...mockValue,
                categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d'),
                save: jest.fn().mockResolvedValue({ ...mockValue, categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d') })
            },
            {
                ...mockQuestions[1],
                categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d'),
                save: jest.fn().mockResolvedValue({ ...mockQuestions[1], categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d') })
            },
            {
                ...mockQuestions[2],
                categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d'),
                save: jest.fn().mockResolvedValue({ ...mockQuestions[2], categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d') })
            }
        ];
        const res = await authPatch(app, '/questions/categories/6702a8418357fa576c95ea43/671e6e7393cee089f87f1f3d');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Questions not found');
    });


    it('should return 404 error if Category not found', async () => {
        Category.find.mockResolvedValue(null);
        const updatedQuestions = [
            {
                ...mockValue,
                categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d'),
                save: jest.fn().mockResolvedValue({ ...mockValue, categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d') })
            },
            {
                ...mockQuestions[1],
                categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d'),
                save: jest.fn().mockResolvedValue({ ...mockQuestions[1], categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d') })
            },
            {
                ...mockQuestions[2],
                categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d'),
                save: jest.fn().mockResolvedValue({ ...mockQuestions[2], categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d') })
            }
        ];
        const res = await authPatch(app, '/questions/categories/6702a8418357fa576c95ea43/671e6e7393cee089f87f1f3d');
        Question.find.mockResolvedValue(updatedQuestions);
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Category not found');
    });

    it('should return 500 error if Category not found', async () => {
        Category.find.mockRejectedValue(new Error('Database error'));
        const updatedQuestions = [
            {
                ...mockValue,
                categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d'),
                save: jest.fn().mockResolvedValue({ ...mockValue, categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d') })
            },
            {
                ...mockQuestions[1],
                categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d'),
                save: jest.fn().mockResolvedValue({ ...mockQuestions[1], categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d') })
            },
            {
                ...mockQuestions[2],
                categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d'),
                save: jest.fn().mockResolvedValue({ ...mockQuestions[2], categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d') })
            }
        ];
        const res = await authPatch(app, '/questions/categories/6702a8418357fa576c95ea43/671e6e7393cee089f87f1f3d');
        Question.find.mockResolvedValue(updatedQuestions);
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return 500 error if updating categories fails', async () => {
        Question.updateMany.mockRejectedValue(new Error('Update failed'));
        const res = await authPatch(app, '/questions/categories/6702a8418357fa576c95ea43/671e6e7393cee089f87f1f3d');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred while updating CategoryId');
        expect(res.body.error).toBe('Update failed');
    });
});

/********/
/* DELETE */
/********/

// DELETE /questions/all
describe('DELETE /questions/all', () => {
    it('should delete all questions', async () => {
        Question.deleteMany.mockResolvedValue({ deletedCount: 3 });
        const res = await authDelete(app, '/questions/all');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('All questions deleted');
        expect(res.body.deletedCount).toBe(3);

        // Verify deleteMany was called correctly
        expect(Question.deleteMany).toHaveBeenCalledWith({});
    });

    it('should return a 500 error if delete fails', async () => {
        Question.deleteMany.mockRejectedValue(new Error('Deletion failed'));
        const res = await authDelete(app, '/questions/all');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Deletion failed');
    });
});

// DELETE /questions/:id
describe('DELETE /questions/:id', () => {
    it('should return 400 error if question ID format is invalid', async () => {
        const res = await authDelete(app, '/questions/invalid-id');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Invalid question ID format');
    });

    it('should return 404 error if question not found', async () => {
        Question.findById.mockResolvedValue(null);
        const res = await authDelete(app, `/questions/${mockValue._id.toString()}`);
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Question not found');
    });

    it('should return a 500 error if finding question fails', async () => {
        Question.findById.mockRejectedValue(new Error('Database error'));
        const res = await authDelete(app, `/questions/${mockValue._id.toString()}`);
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return 404 if question not found during delete', async () => {
        Question.findById.mockResolvedValue(mockValue);
        Question.findByIdAndDelete.mockResolvedValue(null);
        const res = await authDelete(app, `/questions/${mockValue._id.toString()}`);
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Question not found');
    });

    it('should delete a question by ID', async () => {
        Question.findById.mockResolvedValue(mockValue);
        Question.findByIdAndDelete.mockResolvedValue(mockValue);
        const res = await authDelete(app, `/questions/${mockValue._id.toString()}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Question deleted');
    });

    it('should return a 500 error if delete fails', async () => {
        Question.findById.mockResolvedValue(mockValue);
        Question.findByIdAndDelete.mockRejectedValue(new Error('Database error'));
        const res = await authDelete(app, `/questions/${mockValue._id.toString()}`);
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });
});