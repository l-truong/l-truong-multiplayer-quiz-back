const { LANGUAGE_MIN_LENGTH, LANGUAGE_MAX_LENGTH, CATEGORY_NAME_MIN_LENGTH,
    CATEGORY_NAME_MAX_LENGTH, CATEGORY_DESCRIPTION_MIN_LENGTH, CATEGORY_DESCRIPTION_MAX_LENGTH } = require('../../config/apiConfig');
// Core modules
const express = require('express');
// Third-party modules
const request = require('supertest');
// Application modules
const Category = require('../../api/models/category');
jest.mock('../../api/models/category');
const router = require('../../api/routes/categoryRoutes');
// App setup
const app = express();
app.use(express.json({ limit: '10kb' }));
app.use('/categories', router);
// Test data and mocks
const { enumLanguage, headersCategories, mockCategories } = require('../mocks/mockCategories');
const { mockSession } = require('../mocks/mockSession');
// Utility functions
const { setupCategoriesMocks, resetMocks } = require('../utils/setupMocks');
const { convertObjectIdsToStrings, convertObjectIdsToStringsInObject, arrayToCustomCsvBuffer } = require('../utils/convertFunctions');
const { generateString }  = require('../utils/generateString');
const { authPost, authUpload, authPatch, authDelete } = require('../utils/authHelpers');


/********/
/* MOCKS */
/********/
// Set up mocks before each test
beforeEach(() => { 
    setupCategoriesMocks();
});
// Reset mocks after each test
afterEach(() => {
    resetMocks();
});


/********/
/* GET */
/********/

// GET /categories
describe('GET /categories', () => {
    it('should return all categories', async () => {
        const res = await request(app).get('/categories');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(convertObjectIdsToStrings(mockCategories));
    });

    it('should return 500 error on server failure', async () => {
        Category.find.mockRejectedValue(new Error('Database error'));
        const res = await request(app).get('/categories');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });
});

// GET /categories/eng
describe('GET /categories/eng', () => {
    it('should return all categories with language "eng"', async () => {
        const mockEngCategories = mockCategories.filter(category => category.language === 'eng');
        Category.find.mockResolvedValue(mockEngCategories);
        const res = await request(app).get('/categories/eng');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(convertObjectIdsToStrings(mockEngCategories));
    });

    it('should return 500 error on server failure', async () => {
        Category.find.mockRejectedValue(new Error('Database error'));
        const res = await request(app).get('/categories/eng');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return an empty array when no categories in English are found', async () => {
        Category.find.mockResolvedValue([]);
        const res = await request(app).get('/categories/eng');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });
});

// GET /categories/fr
describe('GET /categories/fr', () => {
    it('should return all categories with language "fr"', async () => {
        const mockFrCategories = mockCategories.filter(category => category.language === 'fr');
        Category.find.mockResolvedValue(mockFrCategories);
        const res = await request(app).get('/categories/fr');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(convertObjectIdsToStrings(mockFrCategories));
    });

    it('should return 500 error on server failure', async () => {
        Category.find.mockRejectedValue(new Error('Database error'));
        const res = await request(app).get('/categories/fr');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return an empty array when no categories in French are found', async () => {
        Category.find.mockResolvedValue([]);
        const res = await request(app).get('/categories/fr');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });
});

// GET /categories/:id
describe('GET /categories/:id', () => {
    it('should return 400 error if category ID format is invalid', async () => {
        const res = await request(app).get('/categories/invalid-id');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Invalid category ID format');
    });

    it('should return 404 error if category not found', async () => {
        Category.findById.mockResolvedValue(null);
        const res = await request(app).get(`/categories/${mockCategories[0]._id.toString()}`);
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Category not found');
    });

    it('should return 500 error if findById fails', async () => {
        Category.findById.mockRejectedValue(new Error('Database error'));
        const res = await request(app).get(`/categories/${mockCategories[0]._id.toString()}`);
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return a category by ID', async () => {
        Category.findById.mockResolvedValue(mockCategories[0]);
        const res = await request(app).get(`/categories/${mockCategories[0]._id.toString()}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual(convertObjectIdsToStringsInObject(mockCategories[0]));
    });
});


/********/
/* POST */
/********/

// POST /categories
describe('POST /categories', () => {
    it('should return 400 error if missing parameters', async () => {
        const newOnlyName = { name: 'Only Name' };
        Category.prototype.save.mockResolvedValue(newOnlyName);
        const resOnlyName = await authPost(app, '/categories', newOnlyName);
        expect(resOnlyName.status).toBe(400);
        expect(resOnlyName.body.message).toBe('An error occurred');
        expect(resOnlyName.body.error).toBe('Missing parameters');
        expect(resOnlyName.body.missing).toEqual(['description', 'language']);

        const newOnlyDescription = { description: 'Only Description' };
        Category.prototype.save.mockResolvedValue(newOnlyDescription);
        const resOnlyDescription = await authPost(app, '/categories', newOnlyDescription);
        expect(resOnlyDescription.status).toBe(400);
        expect(resOnlyDescription.body.message).toBe('An error occurred');
        expect(resOnlyDescription.body.error).toBe('Missing parameters');
        expect(resOnlyDescription.body.missing).toEqual(['name', 'language']);

        const newOnlyLanguage = { language: 'Only Language' };
        Category.prototype.save.mockResolvedValue(newOnlyLanguage);
        const resOnlyLanguage = await authPost(app, '/categories', newOnlyLanguage);
        expect(resOnlyLanguage.status).toBe(400);
        expect(resOnlyLanguage.body.message).toBe('An error occurred');
        expect(resOnlyLanguage.body.error).toBe('Missing parameters');
        expect(resOnlyLanguage.body.missing).toEqual(['name', 'description']);

        const newMissingAllParameters = {};
        Category.prototype.save.mockResolvedValue(newMissingAllParameters);
        const resMissingAllParameters = await authPost(app, '/categories', newMissingAllParameters);
        expect(resMissingAllParameters.status).toBe(400);
        expect(resMissingAllParameters.body.message).toBe('An error occurred');
        expect(resMissingAllParameters.body.error).toBe('Missing parameters');
        expect(resMissingAllParameters.body.missing).toEqual(['name', 'description', 'language']);
    });

    it('should return 400 error if parameters not string', async () => {
        const newNameNotString = { name: 0, description: 'New Description', language: 'eng' };
        Category.prototype.save.mockResolvedValue(newNameNotString);
        const resNameNotString = await authPost(app, '/categories', newNameNotString);
        expect(resNameNotString.status).toBe(400);
        expect(resNameNotString.body.message).toBe('An error occurred');
        expect(resNameNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resNameNotString.body.invalidParams).toEqual({ name : 0 });

        const newDescriptionNotString = { name: 'New Name', description: 1, language: 'eng' };
        Category.prototype.save.mockResolvedValue(newDescriptionNotString);
        const resDescriptionNotString = await authPost(app, '/categories', newDescriptionNotString);
        expect(resDescriptionNotString.status).toBe(400);
        expect(resDescriptionNotString.body.message).toBe('An error occurred');
        expect(resDescriptionNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resDescriptionNotString.body.invalidParams).toEqual({ description : 1 });

        const newLanguageNotString = { name: 'New Name', description: 'New Description', language: 2 };
        Category.prototype.save.mockResolvedValue(newLanguageNotString);
        const resLanguageNotString = await authPost(app, '/categories', newLanguageNotString);
        expect(resLanguageNotString.status).toBe(400);
        expect(resLanguageNotString.body.message).toBe('An error occurred');
        expect(resLanguageNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resLanguageNotString.body.invalidParams).toEqual({ language : 2 });

        const newCategoryAllParametersNotString = { name: 0, description: 1, language: 2 };
        Category.prototype.save.mockResolvedValue(newCategoryAllParametersNotString);
        const resAllParametersNotString = await authPost(app, '/categories', newCategoryAllParametersNotString);
        expect(resAllParametersNotString.status).toBe(400);
        expect(resAllParametersNotString.body.message).toBe('An error occurred');
        expect(resAllParametersNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resAllParametersNotString.body.invalidParams).toEqual({ name: 0, description: 1, language: 2 });
    });

    it('should return 400 error if parameters length not respected', async () => { 
        const shortName = generateString(CATEGORY_NAME_MIN_LENGTH - 1);
        const newShortName = { name: shortName, description: 'New Description', language: 'eng' };
        Category.prototype.save.mockResolvedValue(newShortName);
        const resShortName = await authPost(app, '/categories', newShortName);
        expect(resShortName.status).toBe(400);
        expect(resShortName.body.message).toBe('An error occurred');
        expect(resShortName.body.error).toBe('Validation failed');
        expect(resShortName.body.invalidLength).toEqual([`Name must be between ${CATEGORY_NAME_MIN_LENGTH} and ${CATEGORY_NAME_MAX_LENGTH} characters`]);

        const longName = generateString(CATEGORY_NAME_MAX_LENGTH + 1);
        const newLongName = { name: longName, description: 'New Description', language: 'eng' };
        Category.prototype.save.mockResolvedValue(newLongName);
        const resLongName = await authPost(app, '/categories', newLongName);
        expect(resLongName.status).toBe(400);
        expect(resLongName.body.message).toBe('An error occurred');
        expect(resLongName.body.error).toBe('Validation failed');
        expect(resLongName.body.invalidLength).toEqual([`Name must be between ${CATEGORY_NAME_MIN_LENGTH} and ${CATEGORY_NAME_MAX_LENGTH} characters`]);

        const shortDescription = generateString(CATEGORY_DESCRIPTION_MIN_LENGTH - 1);
        const newShortDescription = { name: 'New Category', description: shortDescription, language: 'eng' };
        Category.prototype.save.mockResolvedValue(newShortDescription);
        const resShortDescription = await authPost(app, '/categories', newShortDescription);
        expect(resShortDescription.status).toBe(400);
        expect(resShortDescription.body.message).toBe('An error occurred');
        expect(resShortDescription.body.error).toBe('Validation failed');
        expect(resShortDescription.body.invalidLength).toEqual([`Description must be between ${CATEGORY_DESCRIPTION_MIN_LENGTH} and ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`]);

        const longDescription = generateString(CATEGORY_DESCRIPTION_MAX_LENGTH + 1);
        const newLongDescription = { name: 'New Category', description: longDescription, language: 'eng' };
        Category.prototype.save.mockResolvedValue(newLongDescription);
        const resLongDescription = await authPost(app, '/categories', newLongDescription);
        expect(resLongDescription.status).toBe(400);
        expect(resLongDescription.body.message).toBe('An error occurred');
        expect(resLongDescription.body.error).toBe('Validation failed');
        expect(resLongDescription.body.invalidLength).toEqual([`Description must be between ${CATEGORY_DESCRIPTION_MIN_LENGTH} and ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`]);

        const shortLanguage = generateString(LANGUAGE_MIN_LENGTH - 1);
        const newShortLanguage = { name: 'New Category', description: 'New Description', language: shortLanguage };
        Category.prototype.save.mockResolvedValue(newShortLanguage);
        const resShortLanguage = await authPost(app, '/categories', newShortLanguage);
        expect(resShortLanguage.status).toBe(400);
        expect(resShortLanguage.body.message).toBe('An error occurred');
        expect(resShortLanguage.body.error).toBe('Validation failed');
        expect(resShortLanguage.body.invalidLength).toEqual([`Language must be between ${LANGUAGE_MIN_LENGTH} and ${LANGUAGE_MAX_LENGTH} characters`]);

        const longLanguage = generateString(LANGUAGE_MAX_LENGTH + 1);
        const newLongLanguage = { name: 'New Category', description: 'New Description', language: longLanguage };
        Category.prototype.save.mockResolvedValue(newLongLanguage);
        const resLongLanguage = await authPost(app, '/categories', newLongLanguage);
        expect(resLongLanguage.status).toBe(400);
        expect(resLongLanguage.body.message).toBe('An error occurred');
        expect(resLongLanguage.body.error).toBe('Validation failed');
        expect(resLongLanguage.body.invalidLength).toEqual([`Language must be between ${LANGUAGE_MIN_LENGTH} and ${LANGUAGE_MAX_LENGTH} characters`]);

        const newInvalidLengthCategory = { name: longName, description: shortDescription, language: longLanguage };
        Category.prototype.save.mockResolvedValue(newInvalidLengthCategory);
        const resInvalidLengthCategory = await authPost(app, '/categories', newInvalidLengthCategory);
        expect(resInvalidLengthCategory.status).toBe(400);
        expect(resInvalidLengthCategory.body.message).toBe('An error occurred');
        expect(resInvalidLengthCategory.body.error).toBe('Validation failed');
        expect(resInvalidLengthCategory.body.invalidLength).toEqual([
            `Name must be between ${CATEGORY_NAME_MIN_LENGTH} and ${CATEGORY_NAME_MAX_LENGTH} characters`,
            `Description must be between ${CATEGORY_DESCRIPTION_MIN_LENGTH} and ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`,
            `Language must be between ${LANGUAGE_MIN_LENGTH} and ${LANGUAGE_MAX_LENGTH} characters`
        ]);
    });

    it('should return 400 error if parameter language incorrect', async () => {
        const newCategory = { name: 'New Category', description: 'New Description', language: 'jap' };
        Category.prototype.save.mockResolvedValue(newCategory);
        const res = await authPost(app, '/categories', newCategory);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Language must be part of [' + enumLanguage + ']');
        expect(res.body.invalidParams).toEqual('jap');
    });

    it('should create a new category', async () => {
        const newCategory = { name: 'New Category', description: 'New Description', language: 'eng' };
        Category.prototype.save.mockResolvedValue(newCategory);
        const res = await authPost(app, '/categories', newCategory);
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject(newCategory);
    });

    it('should return 500 error if save fails', async () => {
        Category.prototype.save.mockRejectedValue(new Error('Validation error'));
        const res = await authPost(app, '/categories', { name: 'New Category', description: 'New Description', language: 'eng' });
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Validation error');
    });
});

// POST /categories/bulk
describe('POST /categories/bulk', () => {
    it('should return 400 error if missing categories parameter or empty', async () => {
        const newMissing = {};
        Category.prototype.save.mockResolvedValue(newMissing);
        const resMissing = await authPost(app, '/categories/bulk', newMissing);
        expect(resMissing.status).toBe(400);
        expect(resMissing.body.message).toBe('An error occurred');
        expect(resMissing.body.error).toBe('Categories must be a non-empty array');
        
        const newEmpty = [];
        Category.prototype.save.mockResolvedValue(newEmpty);
        const resEmpty = await authPost(app, '/categories/bulk', { categories: newEmpty });
        expect(resEmpty.status).toBe(400);
        expect(resEmpty.body.message).toBe('An error occurred');
        expect(resEmpty.body.error).toBe('Categories must be a non-empty array');
    });
 
    it('should return 400 error if missing parameters', async () => {
        const newCategories = [
            { description: 'New Description 1', language: 'eng' },
            { name: 'New Name 2', language: 'eng' },
            { name: 'New Name 3', description: 'New Description 3' },
            { name: 'New Name 4' },
            {}
        ];
        Category.prototype.save.mockResolvedValue(newCategories);

        const res = await authPost(app, '/categories/bulk', { categories: newCategories });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some categories could not be processed');
        expect(res.body.length).toBe(newCategories.length);
        expect(res.body.errors.length).toBe(newCategories.length);
        expect(res.body.errors[0].error).toBe('Missing parameters');
        expect(res.body.errors[0].missing).toEqual([ 'name' ]);
        expect(res.body.errors[0].category).toMatchObject(newCategories[0]);
        expect(res.body.errors[1].error).toBe('Missing parameters');
        expect(res.body.errors[1].missing).toEqual([ 'description' ]);
        expect(res.body.errors[1].category).toMatchObject(newCategories[1]);
        expect(res.body.errors[2].error).toBe('Missing parameters');
        expect(res.body.errors[2].missing).toEqual([ 'language' ]);
        expect(res.body.errors[2].category).toMatchObject(newCategories[2]);
        expect(res.body.errors[3].error).toBe('Missing parameters');
        expect(res.body.errors[3].missing).toEqual([ 'description', 'language' ]);
        expect(res.body.errors[3].category).toMatchObject(newCategories[3]);
        expect(res.body.errors[4].error).toBe('Missing parameters');
        expect(res.body.errors[4].missing).toEqual([ 'name', 'description', 'language' ]);
        expect(res.body.errors[4].category).toMatchObject(newCategories[4]);

        expect(Category.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should return 400 error if parameters are not strings', async () => {
        const newCategories = [
            { name: 0, description: 'New Description 1', language: 'eng' },
            { name: 'New Name 2', description: 1, language: 'eng' },
            { name: 2, description: 3, language: 4}
        ];
        Category.prototype.save.mockResolvedValue(newCategories);
        
        const res = await authPost(app, '/categories/bulk', { categories: newCategories });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some categories could not be processed');
        expect(res.body.length).toBe(newCategories.length + 1);// due to language not part of enumLanguage in { name: 2, description: 3, language: 4}
        expect(res.body.errors.length).toBe(newCategories.length + 1);
        expect(res.body.errors[0].error).toBe('Parameters are in wrong formats');
        expect(res.body.errors[0].invalidParams).toEqual({ name: 0 });
        expect(res.body.errors[0].category).toMatchObject(newCategories[0]);
        expect(res.body.errors[1].error).toBe('Parameters are in wrong formats');
        expect(res.body.errors[1].invalidParams).toEqual({ description: 1 });
        expect(res.body.errors[1].category).toMatchObject(newCategories[1]);
        expect(res.body.errors[2].error).toBe('Parameters are in wrong formats');
        expect(res.body.errors[2].invalidParams).toEqual({ name: 2, description: 3, language: 4 });
        expect(res.body.errors[2].category).toMatchObject(newCategories[2]);

        expect(Category.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should return 400 error if parameters length not respected', async () => {
        const shortName = generateString(CATEGORY_NAME_MIN_LENGTH - 1);
        const longName = generateString(CATEGORY_NAME_MAX_LENGTH + 1);
        const shortDescription = generateString(CATEGORY_DESCRIPTION_MIN_LENGTH - 1);
        const longDescription = generateString(CATEGORY_DESCRIPTION_MAX_LENGTH + 1);
        const shortLanguage = generateString(LANGUAGE_MIN_LENGTH - 1);
        const longLanguage = generateString(LANGUAGE_MAX_LENGTH + 1);

        const newCategories = [
            { name: shortName, description: 'New Description', language: 'eng' },
            { name: longName, description: 'New Description', language: 'eng' },
            { name: 'New Category', description: shortDescription, language: 'eng' },
            { name: 'New Category', description: longDescription, language: 'eng' },
            { name: 'New Category', description: 'New Description', language: shortLanguage },
            { name: 'New Category', description: 'New Description', language: longLanguage },
            { name: longName, description: shortDescription, language: longLanguage }
        ];
        Category.prototype.save.mockResolvedValue(newCategories);

        const res = await authPost(app, '/categories/bulk', { categories: newCategories });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some categories could not be processed');
        expect(res.body.length).toBe(9);
        expect(res.body.errors.length).toBe(9);

        expect(res.body.errors[0].error).toBe(`Name must be between ${CATEGORY_NAME_MIN_LENGTH} and ${CATEGORY_NAME_MAX_LENGTH} characters`);
        expect(res.body.errors[0].category).toMatchObject(newCategories[0]);
        expect(res.body.errors[0].invalidLength).toEqual({ name: shortName });
        expect(res.body.errors[1].error).toBe(`Name must be between ${CATEGORY_NAME_MIN_LENGTH} and ${CATEGORY_NAME_MAX_LENGTH} characters`);
        expect(res.body.errors[1].category).toMatchObject(newCategories[1]);
        expect(res.body.errors[1].invalidLength).toEqual({ name: longName });

        expect(res.body.errors[2].error).toBe(`Description must be between ${CATEGORY_DESCRIPTION_MIN_LENGTH} and ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`);
        expect(res.body.errors[2].category).toMatchObject(newCategories[2]);
        expect(res.body.errors[2].invalidLength).toEqual({ description: shortDescription });
        expect(res.body.errors[3].error).toBe(`Description must be between ${CATEGORY_DESCRIPTION_MIN_LENGTH} and ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`);
        expect(res.body.errors[3].category).toMatchObject(newCategories[3]);
        expect(res.body.errors[3].invalidLength).toEqual({ description: longDescription });

        expect(res.body.errors[4].error).toBe(`Language must be between ${LANGUAGE_MIN_LENGTH} and ${LANGUAGE_MAX_LENGTH} characters`);
        expect(res.body.errors[4].category).toMatchObject(newCategories[4]);
        expect(res.body.errors[4].invalidLength).toEqual({ language: shortLanguage });
        expect(res.body.errors[5].error).toBe(`Language must be between ${LANGUAGE_MIN_LENGTH} and ${LANGUAGE_MAX_LENGTH} characters`);
        expect(res.body.errors[5].category).toMatchObject(newCategories[5]);
        expect(res.body.errors[5].invalidLength).toEqual({ language: longLanguage });

        expect(res.body.errors[6].error).toBe(`Name must be between ${CATEGORY_NAME_MIN_LENGTH} and ${CATEGORY_NAME_MAX_LENGTH} characters`);
        expect(res.body.errors[6].category).toMatchObject(newCategories[6]);
        expect(res.body.errors[6].invalidLength).toEqual({ name: longName });
        expect(res.body.errors[7].error).toBe(`Description must be between ${CATEGORY_DESCRIPTION_MIN_LENGTH} and ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`);
        expect(res.body.errors[7].category).toMatchObject(newCategories[6]);
        expect(res.body.errors[7].invalidLength).toEqual({ description: shortDescription });
        expect(res.body.errors[8].error).toBe(`Language must be between ${LANGUAGE_MIN_LENGTH} and ${LANGUAGE_MAX_LENGTH} characters`);
        expect(res.body.errors[8].category).toMatchObject(newCategories[6]);
        expect(res.body.errors[8].invalidLength).toEqual({ language: longLanguage });
    });

    it('should return 400 error if language not part of ' + enumLanguage, async () => {
        const newCategories = [
            { name: 'New Name 1', description: 'New Description 1', language: 'jap' },
            { name: 'New Name 2', description: 'New Description 2', language: 'spa'}
        ];
        Category.prototype.save.mockResolvedValue(newCategories);
        
        const res = await authPost(app, '/categories/bulk', { categories: newCategories });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some categories could not be processed');
        expect(res.body.length).toBe(newCategories.length);
        expect(res.body.errors.length).toBe(newCategories.length);
        expect(res.body.errors[0].error).toBe('Language must be part of [' + enumLanguage + ']');
        expect(res.body.errors[0].category).toMatchObject(newCategories[0]);
        expect(res.body.errors[0].invalidParams).toEqual({ language: 'jap'});
        expect(res.body.errors[1].error).toBe('Language must be part of [' + enumLanguage + ']');
        expect(res.body.errors[1].category).toMatchObject(newCategories[1]);
        expect(res.body.errors[1].invalidParams).toEqual({ language: 'spa'});
    });

    it('should return 400 error if multiple errors occur', async () => {
        const longDescription = generateString(CATEGORY_DESCRIPTION_MAX_LENGTH + 1);
        const newCategories = [
            { name: 0, language: 1},
            { name: 2, description: 'New Description 2', language: 'jap' },
            { description: 'New Description 3' },
            { name: 'New Name', description: longDescription }
        ];
        Category.prototype.save.mockResolvedValue(newCategories);
        
        const res = await authPost(app, '/categories/bulk', { categories: newCategories });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some categories could not be processed');
        expect(res.body.length).toBe(8);
        expect(res.body.errors.length).toBe(8);
        expect(res.body.errors[0].error).toBe('Missing parameters');
        expect(res.body.errors[0].missing).toEqual([ 'description' ]);
        expect(res.body.errors[0].category).toEqual(newCategories[0]);
        expect(res.body.errors[1].error).toBe('Parameters are in wrong formats');
        expect(res.body.errors[1].invalidParams).toEqual({ name: 0, language: 1 });
        expect(res.body.errors[1].category).toMatchObject(newCategories[0]);
        expect(res.body.errors[2].error).toBe('Language must be part of [' + enumLanguage + ']');
        expect(res.body.errors[2].category).toMatchObject(newCategories[0]);
        expect(res.body.errors[2].invalidParams).toEqual({ language: 1 });
        expect(res.body.errors[3].error).toBe('Parameters are in wrong formats');
        expect(res.body.errors[3].invalidParams).toEqual({ name: 2 });
        expect(res.body.errors[3].category).toMatchObject(newCategories[1]);
        expect(res.body.errors[4].error).toBe('Language must be part of [' + enumLanguage + ']');
        expect(res.body.errors[4].category).toMatchObject(newCategories[1]);
        expect(res.body.errors[4].invalidParams).toEqual({ language: 'jap' });
        expect(res.body.errors[5].error).toBe('Missing parameters');
        expect(res.body.errors[5].missing).toEqual([ 'name', 'language' ]);
        expect(res.body.errors[5].category).toEqual(newCategories[2]);
        expect(res.body.errors[6].error).toBe('Missing parameters');
        expect(res.body.errors[6].missing).toEqual([ 'language' ]);
        expect(res.body.errors[6].category).toEqual(newCategories[3]);
        expect(res.body.errors[7].error).toBe(`Description must be between ${CATEGORY_DESCRIPTION_MIN_LENGTH} and ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`);
        expect(res.body.errors[7].invalidLength).toEqual({ description: longDescription });
        expect(res.body.errors[7].category).toEqual(newCategories[3]);

        expect(Category.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should create a new category successfully', async () => {
        const newCategories = [
            { name: 'New Name 1', description: 'New Description 1', language: 'eng' },
            { name: 'New Name 2', description: 'New Description 2', language: 'eng' },
            { name: 'New Name 3', description: 'New Description 3', language: 'fr'}
        ];
        Category.prototype.save.mockResolvedValue(newCategories);
        
        const res = await authPost(app, '/categories/bulk', { categories: newCategories });
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Categories created successfully');
        expect(res.body.categories[0].length).toBe(newCategories.length);
        expect(res.body.categories[0][0]).toMatchObject(newCategories[0]);
        expect(res.body.categories[0][1]).toMatchObject(newCategories[1]);
        expect(res.body.categories[0][2]).toMatchObject(newCategories[2]);

        expect(Category.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(mockSession.commitTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
      });

    it('should return 500 error if save fails', async () => {
        Category.prototype.save.mockRejectedValue(new Error('Validation error'));
        const newCategories = [
            { name: 'New Name 1', description: 'New Description 1', language: 'eng' },
            { name: 'New Name 2', description: 'New Description 2', language: 'eng' },
            { name: 'New Name 3', description: 'New Description 3', language: 'fr'}
        ];
        
        const res = await authPost(app, '/categories/bulk', { categories: newCategories });
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Validation error');

        expect(Category.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
    });
});

// POST /categories/csv
describe('POST /categories/csv', () => {
    it('should return 400 error if missing categories parameter or empty', async () => {
        const csvBufferMissing = Buffer.from('');
        const resMissing = await authUpload(app, '/categories/csv', 'categories', arrayToCustomCsvBuffer(headersCategories, csvBufferMissing), 'categories.csv');
        expect(resMissing.status).toBe(400);
        expect(resMissing.body.message).toBe('An error occurred');
        expect(resMissing.body.error).toBe('Categories must be a non-empty array');

        const csvBufferEmpty = Buffer.from('name,description,language\n');
        const resEmpty = await authUpload(app, '/categories/csv', 'categories', csvBufferEmpty, 'categories.csv');
        expect(resEmpty.status).toBe(400);
        expect(resEmpty.body.message).toBe('An error occurred');
        expect(resEmpty.body.error).toBe('Categories must be a non-empty array');
    });

    it('should return 400 error if missing parameters', async () => {
        const newCategories = [
            { description: 'New Description 1', language: 'eng' },
            { name: 'New Name 2', language: 'eng' },
            { name: 'New Name 3', description: 'New Description 3' },
            { name: 'New Name 4' },
            {}
        ];
        Category.prototype.save.mockResolvedValue(newCategories);

        const res = await authUpload(app, '/categories/csv', 'categories', arrayToCustomCsvBuffer(headersCategories, newCategories), 'categories.csv');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some categories could not be processed');
        expect(res.body.length).toBe(newCategories.length);
        expect(res.body.errors.length).toBe(newCategories.length);
        expect(res.body.errors[0].error).toBe('Missing parameters');
        expect(res.body.errors[0].missing).toEqual([ 'name' ]);
        expect(res.body.errors[0].category).toMatchObject(newCategories[0]);
        expect(res.body.errors[1].error).toBe('Missing parameters');
        expect(res.body.errors[1].missing).toEqual([ 'description' ]);
        expect(res.body.errors[1].category).toMatchObject(newCategories[1]);
        expect(res.body.errors[2].error).toBe('Missing parameters');
        expect(res.body.errors[2].missing).toEqual([ 'language' ]);
        expect(res.body.errors[2].category).toMatchObject(newCategories[2]);
        expect(res.body.errors[3].error).toBe('Missing parameters');
        expect(res.body.errors[3].missing).toEqual([ 'description', 'language' ]);
        expect(res.body.errors[3].category).toMatchObject(newCategories[3]);
        expect(res.body.errors[4].error).toBe('Missing parameters');
        expect(res.body.errors[4].missing).toEqual([ 'name', 'description', 'language' ]);
        expect(res.body.errors[4].category).toMatchObject(newCategories[4]);

        expect(Category.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should return 400 error if parameters length not respected', async () => {
        const shortName = generateString(CATEGORY_NAME_MIN_LENGTH - 1);
        const longName = generateString(CATEGORY_NAME_MAX_LENGTH + 1);
        const shortDescription = generateString(CATEGORY_DESCRIPTION_MIN_LENGTH - 1);
        const longDescription = generateString(CATEGORY_DESCRIPTION_MAX_LENGTH + 1);
        const shortLanguage = generateString(LANGUAGE_MIN_LENGTH - 1);
        const longLanguage = generateString(LANGUAGE_MAX_LENGTH + 1);

        const newCategories = [
            { name: shortName, description: 'New Description', language: 'eng' },
            { name: longName, description: 'New Description', language: 'eng' },
            { name: 'New Category', description: shortDescription, language: 'eng' },
            { name: 'New Category', description: longDescription, language: 'eng' },
            { name: 'New Category', description: 'New Description', language: shortLanguage },
            { name: 'New Category', description: 'New Description', language: longLanguage },
            { name: longName, description: shortDescription, language: longLanguage }
        ];
        Category.prototype.save.mockResolvedValue(newCategories);

        const res = await authUpload(app, '/categories/csv', 'categories', arrayToCustomCsvBuffer(headersCategories, newCategories), 'categories.csv');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some categories could not be processed');
        expect(res.body.length).toBe(9);
        expect(res.body.errors.length).toBe(9);

        expect(res.body.errors[0].error).toBe(`Name must be between ${CATEGORY_NAME_MIN_LENGTH} and ${CATEGORY_NAME_MAX_LENGTH} characters`);
        expect(res.body.errors[0].category).toMatchObject(newCategories[0]);
        expect(res.body.errors[0].invalidLength).toEqual({ name: shortName });
        expect(res.body.errors[1].error).toBe(`Name must be between ${CATEGORY_NAME_MIN_LENGTH} and ${CATEGORY_NAME_MAX_LENGTH} characters`);
        expect(res.body.errors[1].category).toMatchObject(newCategories[1]);
        expect(res.body.errors[1].invalidLength).toEqual({ name: longName });

        expect(res.body.errors[2].error).toBe(`Description must be between ${CATEGORY_DESCRIPTION_MIN_LENGTH} and ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`);
        expect(res.body.errors[2].category).toMatchObject(newCategories[2]);
        expect(res.body.errors[2].invalidLength).toEqual({ description: shortDescription });
        expect(res.body.errors[3].error).toBe(`Description must be between ${CATEGORY_DESCRIPTION_MIN_LENGTH} and ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`);
        expect(res.body.errors[3].category).toMatchObject(newCategories[3]);
        expect(res.body.errors[3].invalidLength).toEqual({ description: longDescription });

        expect(res.body.errors[4].error).toBe(`Language must be between ${LANGUAGE_MIN_LENGTH} and ${LANGUAGE_MAX_LENGTH} characters`);
        expect(res.body.errors[4].category).toMatchObject(newCategories[4]);
        expect(res.body.errors[4].invalidLength).toEqual({ language: shortLanguage });
        expect(res.body.errors[5].error).toBe(`Language must be between ${LANGUAGE_MIN_LENGTH} and ${LANGUAGE_MAX_LENGTH} characters`);
        expect(res.body.errors[5].category).toMatchObject(newCategories[5]);
        expect(res.body.errors[5].invalidLength).toEqual({ language: longLanguage });

        expect(res.body.errors[6].error).toBe(`Name must be between ${CATEGORY_NAME_MIN_LENGTH} and ${CATEGORY_NAME_MAX_LENGTH} characters`);
        expect(res.body.errors[6].category).toMatchObject(newCategories[6]);
        expect(res.body.errors[6].invalidLength).toEqual({ name: longName });
        expect(res.body.errors[7].error).toBe(`Description must be between ${CATEGORY_DESCRIPTION_MIN_LENGTH} and ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`);
        expect(res.body.errors[7].category).toMatchObject(newCategories[6]);
        expect(res.body.errors[7].invalidLength).toEqual({ description: shortDescription });
        expect(res.body.errors[8].error).toBe(`Language must be between ${LANGUAGE_MIN_LENGTH} and ${LANGUAGE_MAX_LENGTH} characters`);
        expect(res.body.errors[8].category).toMatchObject(newCategories[6]);
        expect(res.body.errors[8].invalidLength).toEqual({ language: longLanguage });
    });

    it('should return 400 error if language not part of ' + enumLanguage, async () => {
        const newCategories = [
            { name: 'New Name 1', description: 'New Description 1', language: 'jap' },
            { name: 'New Name 2', description: 'New Description 2', language: 'spa'}
        ];
        Category.prototype.save.mockResolvedValue(newCategories);

        const res = await authUpload(app, '/categories/csv', 'categories', arrayToCustomCsvBuffer(headersCategories, newCategories), 'categories.csv');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some categories could not be processed');
        expect(res.body.length).toBe(newCategories.length);
        expect(res.body.errors.length).toBe(newCategories.length);
        expect(res.body.errors[0].error).toBe('Language must be part of [' + enumLanguage + ']');
        expect(res.body.errors[0].category).toMatchObject(newCategories[0]);
        expect(res.body.errors[0].invalidParams).toEqual({ language: 'jap'});
        expect(res.body.errors[1].error).toBe('Language must be part of [' + enumLanguage + ']');
        expect(res.body.errors[1].category).toMatchObject(newCategories[1]);
        expect(res.body.errors[1].invalidParams).toEqual({ language: 'spa'});
    });

    it('should return 400 error if multiple errors occur', async () => { 
        const longDescription = generateString(CATEGORY_DESCRIPTION_MAX_LENGTH + 1);
        const newCategories = [
            { name: 'New Name 1', language: 'spa' },
            { name: 'New Name 2', description: 'New Description 2', language: 'jap' },
            { description: 'New Description 3' },
            { name: 'New Name', description: longDescription }
        ];
        Category.prototype.save.mockResolvedValue(newCategories);

        const res = await authUpload(app, '/categories/csv', 'categories', arrayToCustomCsvBuffer(headersCategories, newCategories), 'categories.csv');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Some categories could not be processed');
        expect(res.body.length).toBe(6);
        expect(res.body.errors.length).toBe(6);
        expect(res.body.errors[0].error).toBe('Missing parameters');
        expect(res.body.errors[0].missing).toEqual([ 'description' ]);
        expect(res.body.errors[0].category).toMatchObject(newCategories[0]);
        expect(res.body.errors[1].error).toBe('Language must be part of [' + enumLanguage + ']');
        expect(res.body.errors[1].category).toMatchObject(newCategories[0]);
        expect(res.body.errors[1].invalidParams).toEqual({ language: 'spa'});
        expect(res.body.errors[2].error).toBe('Language must be part of [' + enumLanguage + ']');
        expect(res.body.errors[2].category).toMatchObject(newCategories[1]);
        expect(res.body.errors[2].invalidParams).toEqual({ language: 'jap'});
        expect(res.body.errors[3].error).toBe('Missing parameters');
        expect(res.body.errors[3].missing).toEqual([ 'name', 'language' ]);
        expect(res.body.errors[3].category).toMatchObject(newCategories[2]);
        expect(res.body.errors[4].error).toBe('Missing parameters');
        expect(res.body.errors[4].missing).toEqual([ 'language' ]);
        expect(res.body.errors[4].category).toMatchObject(newCategories[3]);
        expect(res.body.errors[5].error).toBe(`Description must be between ${CATEGORY_DESCRIPTION_MIN_LENGTH} and ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`);
        expect(res.body.errors[5].invalidLength).toEqual({ description: longDescription });
        expect(res.body.errors[5].category).toMatchObject(newCategories[3]);

        expect(Category.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should create a new category successfully', async () => {
        const newCategories = [
            { name: 'New Name 1', description: 'New Description 1', language: 'eng' },
            { name: 'New Name 2', description: 'New Description 2', language: 'eng' },
            { name: 'New Name 3', description: 'New Description 3', language: 'fr'}
        ];
        Category.prototype.save.mockResolvedValue(newCategories);

        const res = await authUpload(app, '/categories/csv', 'categories', arrayToCustomCsvBuffer(headersCategories, newCategories), 'categories.csv');
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Categories created successfully');
        expect(res.body.categories[0].length).toBe(newCategories.length);
        expect(res.body.categories[0][0]).toMatchObject(newCategories[0]);
        expect(res.body.categories[0][1]).toMatchObject(newCategories[1]);
        expect(res.body.categories[0][2]).toMatchObject(newCategories[2]);

        expect(Category.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(mockSession.commitTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should return 500 error if save fails', async () => {
        const newCategories = [
            { name: 'New Name 1', description: 'New Description 1', language: 'eng' },
            { name: 'New Name 2', description: 'New Description 2', language: 'eng' },
            { name: 'New Name 3', description: 'New Description 3', language: 'fr'}
        ];
        Category.prototype.save.mockRejectedValue(new Error('Validation error'));
    
        const res = await authUpload(app, '/categories/csv', 'categories', arrayToCustomCsvBuffer(headersCategories, newCategories), 'categories.csv');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Validation error');

        expect(Category.startSession).toHaveBeenCalled();
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(mockSession.abortTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should return 500 and error message for failed CSV processing', async () => {
        const res = await authUpload(app, '/categories/csv', 'categories', null, 'categories.csv');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Failed to process CSV');
    });
});


/********/
/* UPDATE */
/********/

// PATCH /categories/:id
describe('PATCH /categories/:id', () => {
    it('should return 400 error if category ID format is invalid', async () => {
        const res = await authPatch(app, '/categories/invalid-id', { name: 'Updated Name' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Invalid category ID format');
    });

    it('should return 404 if category not found', async () => {
        Category.findById.mockResolvedValue(null);
        const res = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`, { name: 'Updated Name' });
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Category not found');
    });

    it('should return 500 error if findById fails', async () => {
        Category.findById.mockRejectedValue(new Error('Database error'));
        const res = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`, { name: 'Updated Name' });
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return 400 error if parameters are not a string', async () => {
        const categoryToUpdate = { ...mockCategories[0], save: jest.fn().mockResolvedValue(mockCategories[0]) };
        Category.findById.mockResolvedValue(categoryToUpdate);

        const resNameNotString = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`, { name: 0 });
        expect(resNameNotString.status).toBe(400);
        expect(resNameNotString.body.message).toBe('An error occurred');
        expect(resNameNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resNameNotString.body.invalidParams).toEqual({ name: 0 });

        const resDescriptionNotString = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`, { description: 1 });
        expect(resDescriptionNotString.status).toBe(400);
        expect(resDescriptionNotString.body.message).toBe('An error occurred');
        expect(resDescriptionNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resDescriptionNotString.body.invalidParams).toEqual({ description: 1 });

        const resLanguageNotString = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`, { language: 2 });
        expect(resLanguageNotString.status).toBe(400);
        expect(resLanguageNotString.body.message).toBe('An error occurred');
        expect(resLanguageNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resLanguageNotString.body.invalidParams).toEqual({ language: 2 });

        const resAllParametersNotString = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`, { name: 0, description: 1, language: 2 });
        expect(resAllParametersNotString.status).toBe(400);
        expect(resAllParametersNotString.body.message).toBe('An error occurred');
        expect(resAllParametersNotString.body.error).toBe('Parameters are in wrong formats');
        expect(resAllParametersNotString.body.invalidParams).toEqual({ name: 0, description: 1, language: 2 });
    });

    it('should return 400 error if parameters length not respected', async () => {
        const categoryToUpdate = { ...mockCategories[0], save: jest.fn().mockResolvedValue(mockCategories[0]) };
        Category.findById.mockResolvedValue(categoryToUpdate);

        const shortName = generateString(CATEGORY_NAME_MIN_LENGTH - 1);
        const resShortName = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`,  { name: shortName });
        expect(resShortName.status).toBe(400);
        expect(resShortName.body.message).toBe('An error occurred');
        expect(resShortName.body.error).toBe('Validation failed');
        expect(resShortName.body.invalidLength).toEqual([`Name must be between ${CATEGORY_NAME_MIN_LENGTH} and ${CATEGORY_NAME_MAX_LENGTH} characters`]);

        const longName = generateString(CATEGORY_NAME_MAX_LENGTH + 1);
        const resLongName = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`,  { name: longName });
        expect(resLongName.status).toBe(400);
        expect(resLongName.body.message).toBe('An error occurred');
        expect(resLongName.body.error).toBe('Validation failed');
        expect(resLongName.body.invalidLength).toEqual([`Name must be between ${CATEGORY_NAME_MIN_LENGTH} and ${CATEGORY_NAME_MAX_LENGTH} characters`]);

        const shortDescription = generateString(CATEGORY_DESCRIPTION_MIN_LENGTH - 1);
        const resShortDescription = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`,  { description: shortDescription });
        expect(resShortDescription.status).toBe(400);
        expect(resShortDescription.body.message).toBe('An error occurred');
        expect(resShortDescription.body.error).toBe('Validation failed');
        expect(resShortDescription.body.invalidLength).toEqual([`Description must be between ${CATEGORY_DESCRIPTION_MIN_LENGTH} and ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`]);

        const longDescription = generateString(CATEGORY_DESCRIPTION_MAX_LENGTH + 1);
        const resLongDescription = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`,  { description: longDescription });
        expect(resLongDescription.status).toBe(400);
        expect(resLongDescription.body.message).toBe('An error occurred');
        expect(resLongDescription.body.error).toBe('Validation failed');
        expect(resLongDescription.body.invalidLength).toEqual([`Description must be between ${CATEGORY_DESCRIPTION_MIN_LENGTH} and ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`]);

        const shortLanguage = generateString(LANGUAGE_MIN_LENGTH - 1);
        const resShortLanguage = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`,  { language: shortLanguage });
        expect(resShortLanguage.status).toBe(400);
        expect(resShortLanguage.body.message).toBe('An error occurred');
        expect(resShortLanguage.body.error).toBe('Validation failed');
        expect(resShortLanguage.body.invalidLength).toEqual([`Language must be between ${LANGUAGE_MIN_LENGTH} and ${LANGUAGE_MAX_LENGTH} characters`]);

        const longLanguage = generateString(LANGUAGE_MAX_LENGTH + 1);
        const resLongLanguage = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`,  { language: longLanguage });
        expect(resLongLanguage.status).toBe(400);
        expect(resLongLanguage.body.message).toBe('An error occurred');
        expect(resLongLanguage.body.error).toBe('Validation failed');
        expect(resLongLanguage.body.invalidLength).toEqual([`Language must be between ${LANGUAGE_MIN_LENGTH} and ${LANGUAGE_MAX_LENGTH} characters`]);

        const resInvalidLengthCategory = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`,  { name: longName, description: shortDescription, language: longLanguage });
        expect(resInvalidLengthCategory.status).toBe(400);
        expect(resInvalidLengthCategory.body.message).toBe('An error occurred');
        expect(resInvalidLengthCategory.body.error).toBe('Validation failed');
        expect(resInvalidLengthCategory.body.invalidLength).toEqual([
            `Name must be between ${CATEGORY_NAME_MIN_LENGTH} and ${CATEGORY_NAME_MAX_LENGTH} characters`,
            `Description must be between ${CATEGORY_DESCRIPTION_MIN_LENGTH} and ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`,
            `Language must be between ${LANGUAGE_MIN_LENGTH} and ${LANGUAGE_MAX_LENGTH} characters`
        ]);
    });

    it('should return 400 res if parameter language incorrect', async () => {
        const categoryToUpdate = { ...mockCategories[0], save: jest.fn().mockResolvedValue(mockCategories[0]) };
        Category.findById.mockResolvedValue(categoryToUpdate);
        const res = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`, { language: 'jap' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Language must be part of [' + enumLanguage + ']');
        expect(res.body.invalidParams).toEqual('jap');
    });

    it('should return 200 res if no fields were updated', async () => {
        const categoryToUpdate = { ...mockCategories[0], save: jest.fn().mockResolvedValue(mockCategories[0]) };
        Category.findById.mockResolvedValue(categoryToUpdate);
        const res = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`, { name: 'Test Category name', description: 'Test Category description', language: 'eng' });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('No fields were updated');
    });

    it('should update a category', async () => {
        const updatedCategoryName = { 
            ...mockCategories[0], 
            save: jest.fn().mockResolvedValue({ ...mockCategories[0], name: 'Updated Category name'})
        };
        Category.findById.mockResolvedValue(updatedCategoryName);
        const resUpdateName = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`, { name: 'Updated Category name' });
        expect(resUpdateName.status).toBe(200);
        expect(resUpdateName.body.name).toBe('Updated Category name');
        expect(updatedCategoryName.save).toHaveBeenCalled();

        const updatedCategoryDescription = { 
            ...mockCategories[0], 
            save: jest.fn().mockResolvedValue({ ...mockCategories[0], description: 'Updated Category description'})
        };
        Category.findById.mockResolvedValue(updatedCategoryDescription);
        const resUpdateDescription = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`, { description: 'Updated Category description' });
        expect(resUpdateDescription.status).toBe(200);
        expect(resUpdateDescription.body.description).toBe('Updated Category description');
        expect(updatedCategoryDescription.save).toHaveBeenCalled();

        const updatedCategoryLanguage = { 
            ...mockCategories[0], 
            save: jest.fn().mockResolvedValue({ ...mockCategories[0], language: 'fr'})
        };
        Category.findById.mockResolvedValue(updatedCategoryLanguage);
        const resUpdateLanguage = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`, { language: 'fr' });
        expect(resUpdateLanguage.status).toBe(200);
        expect(resUpdateLanguage.body.language).toBe('fr');
        expect(updatedCategoryLanguage.save).toHaveBeenCalled();

        const updatedCategoryAll = { 
            ...mockCategories[0], 
            save: jest.fn().mockResolvedValue({ ...mockCategories[0], name: 'Updated Category name', description: 'Updated Category description', language: 'fr'})
        };
        Category.findById.mockResolvedValue(updatedCategoryAll);
        const resUpdateAll = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`, { name: 'Updated Category name', description: 'Updated Category description', language: 'fr' });
        expect(resUpdateAll.status).toBe(200);
        expect(resUpdateAll.body.name).toBe('Updated Category name');
        expect(resUpdateAll.body.description).toBe('Updated Category description');
        expect(resUpdateAll.body.language).toBe('fr');
        expect(updatedCategoryAll.save).toHaveBeenCalled();
    });

    it('should return 500 error if save fails', async () => {
        const categoryToUpdate = { 
            ...mockCategories[0], 
            save: jest.fn().mockRejectedValue(new Error('Save failed'))
        };
        Category.findById.mockResolvedValue(categoryToUpdate);
        const res = await authPatch(app, `/categories/${mockCategories[0]._id.toString()}`, { name: 'Updated Category Name' });
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Save failed');
    });
});


/********/
/* DELETE */
/********/

// DELETE /categories/all
describe('DELETE /categories/all', () => {
    it('should delete all categories', async () => {
        Category.deleteMany.mockResolvedValue({ deletedCount: 2 });
        const res = await authDelete(app, '/categories/all');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('All categories deleted');
        expect(res.body.deletedCount).toBe(2);

        // Verify deleteMany was called correctly
        expect(Category.deleteMany).toHaveBeenCalledWith({});
    });

    it('should return a 500 error if delete fails', async () => {
        Category.deleteMany.mockRejectedValue(new Error('Deletion failed'));
        const res = await authDelete(app, '/categories/all');
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Deletion failed');
    });
});

// DELETE /categories/:id
describe('DELETE /categories/:id', () => {
    it('should return 400 error if category ID format is invalid', async () => {
        const res = await authDelete(app, '/categories/invalid-id');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Invalid category ID format');
    });

    it('should return 404 error if category not found', async () => {
        Category.findById.mockResolvedValue(null);
        const res = await authDelete(app, `/categories/${mockCategories[0]._id.toString()}`);
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Category not found');
    });

    it('should return a 500 error if finding category fails', async () => {
        Category.findById.mockRejectedValue(new Error('Database error'));
        const res = await authDelete(app, `/categories/${mockCategories[0]._id.toString()}`);
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });

    it('should return 404 if category not found during delete', async () => {
        Category.findById.mockResolvedValue(mockCategories[0]);
        Category.findByIdAndDelete.mockResolvedValue(null);
        const res = await authDelete(app, `/categories/${mockCategories[0]._id.toString()}`);
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Category not found');
    });

    it('should delete a category by ID', async () => {
        Category.findById.mockResolvedValue(mockCategories[0]);
        Category.findByIdAndDelete.mockResolvedValue(mockCategories[0]);
        const res = await authDelete(app, `/categories/${mockCategories[0]._id.toString()}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Category deleted');
    });

    it('should return a 500 error if delete fails', async () => {
        Category.findById.mockResolvedValue(mockCategories[0]);
        Category.findByIdAndDelete.mockRejectedValue(new Error('Database error'));
        const res = await authDelete(app, `/categories/${mockCategories[0]._id.toString()}`);
        expect(res.status).toBe(500);
        expect(res.body.message).toBe('An error occurred');
        expect(res.body.error).toBe('Database error');
    });
});