const { LANGUAGE_MIN_LENGTH, LANGUAGE_MAX_LENGTH, CATEGORY_NAME_MIN_LENGTH,
    CATEGORY_NAME_MAX_LENGTH, CATEGORY_DESCRIPTION_MIN_LENGTH, CATEGORY_DESCRIPTION_MAX_LENGTH } = require('../../config/apiConfig');
// Core modules
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
// Custom middlewares and models
const authenticateToken = require('../../middlewares/authenticateToken');
const Category = require('../models/category');
// Router and upload setup
const router = express.Router();
const upload = multer();
// Utility functions
const { checkMissingParams, checkInvalidTypes, validateStringLength } = require('../../utils/validators');

const REQUIRED_PARAMS = ['name', 'description', 'language'];
const EXPECTED_TYPES = {
    name: 'string',
    description: 'string',
    language: 'string'
};

/********/
/* GET */
/********/

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        return res.json(categories);
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred', 
            error: err.message 
        });
    }
});

// Get all english categories
router.get('/eng', async (req, res) => {
    try {
        const categories = await Category.find({ language: 'eng' });
        return res.json(categories);
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred', 
            error: err.message 
        });
    }
});

// Get all french categories
router.get('/fr', async (req, res) => {
    try {
        const categories = await Category.find({ language: 'fr' });
        return res.json(categories);
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred', 
            error: err.message 
        });
    }
});

// Get one category
router.get('/:id', async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Invalid category ID format'
        });
    }

    let category;
    try {
        category = await Category.findById(req.params.id);
        if (category === null) {
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
    res.category = category;
    next();
}, (req, res) => {
    return res.json(res.category);
});


/********/
/* POST */
/********/

// Create a new category
router.post('/', authenticateToken, async (req, res) => {
    // Check for missing parameters
    const missingParams = checkMissingParams(req.body, REQUIRED_PARAMS);

    if (missingParams.length > 0) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Missing parameters',
            missing: missingParams
        });
    }

    // Check if parameters are  in valid format
    const invalidParams = checkInvalidTypes(req.body, EXPECTED_TYPES);

    if (Object.keys(invalidParams).length > 0) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Parameters are in wrong formats',
            invalidParams
        });
    }

    // Performance and abuse safeguard
    const invalidLength = [];

    const nameError = validateStringLength('Name', req.body.name, CATEGORY_NAME_MIN_LENGTH, CATEGORY_NAME_MAX_LENGTH);
    if (nameError) {
        invalidLength.push(nameError);
    }

    const descriptionError = validateStringLength('Description', req.body.description, CATEGORY_DESCRIPTION_MIN_LENGTH, CATEGORY_DESCRIPTION_MAX_LENGTH);
    if (descriptionError) {
        invalidLength.push(descriptionError);
    }

    const languageError = validateStringLength('Language', req.body.language, LANGUAGE_MIN_LENGTH, LANGUAGE_MAX_LENGTH);
    if (languageError) {
        invalidLength.push(languageError);
    }

    if (invalidLength.length > 0) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Validation failed',
            invalidLength
        });
    }
    
    // Check if there is invalid language parameter
    if (!Category.schema.path('language').enumValues.includes(req.body.language)) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Language must be part of [' + Category.schema.path('language').enumValues + ']',
            invalidParams: req.body.language
        });
    }

    const category = new Category({
        name: req.body.name,
        description: req.body.description,
        language: req.body.language
    });

    try {
        const newCategory = await category.save();
        return res.status(201).json(newCategory);
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred', 
            error: err.message 
        });
    }
});

// Create a list of categories
router.post('/bulk', authenticateToken, async (req, res) => {
    const categories = req.body.categories;

    // Check if the request body is a non-empty array
    if (!Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Categories must be a non-empty array'
        });
    }

    // Start a session for the transaction
    const session = await Category.startSession();
    session.startTransaction();
        
    try {
        const errors = [];
        
        for (const categoryData of categories) {
            // Check for missing parameters
            const missingParams = checkMissingParams(categoryData, REQUIRED_PARAMS);

            if (missingParams.length > 0) {
                errors.push({
                    error: 'Missing parameters',
                    missing: missingParams,
                    category: categoryData
                });
            }

            // Check if parameters are  in valid format 
            const invalidParams = checkInvalidTypes(categoryData, EXPECTED_TYPES, { missingParams });

            if (Object.keys(invalidParams).length > 0) {
                errors.push({
                    error: 'Parameters are in wrong formats',
                    category: categoryData,
                    invalidParams
                });
            }      
            
            // Performance and abuse safeguard
            const nameError = validateStringLength('Name', categoryData.name, CATEGORY_NAME_MIN_LENGTH, CATEGORY_NAME_MAX_LENGTH);
            if (nameError) {
                errors.push({
                    error: nameError,
                    category: categoryData,
                    invalidLength: {
                        'name': categoryData.name
                    }
                });
            }
            
            const descriptionError = validateStringLength('Description', categoryData.description, CATEGORY_DESCRIPTION_MIN_LENGTH, CATEGORY_DESCRIPTION_MAX_LENGTH);
            if (descriptionError) {
                errors.push({
                    error: descriptionError,
                    category: categoryData,
                    invalidLength: {
                        'description': categoryData.description
                    }
                });
            }
            
            const languageError = validateStringLength('Language', categoryData.language, LANGUAGE_MIN_LENGTH, LANGUAGE_MAX_LENGTH);
            if (languageError) {
                errors.push({
                    error: languageError,
                    category: categoryData,
                    invalidLength: {
                        'language': categoryData.language
                    }
                });
            }        

            // Check if there is invalid language parameter
            if (!languageError && !missingParams.includes('language') && !Category.schema.path('language').enumValues.includes(categoryData.language)) {
                errors.push({
                    error: 'Language must be part of [' + Category.schema.path('language').enumValues + ']',
                    category: categoryData,
                    invalidParams: {
                        'language': categoryData.language
                    }
                });
            }
        }

        if (errors.length > 0) {
            await session.abortTransaction();
            return res.status(400).json({ 
                message: 'Some categories could not be processed', 
                length: errors.length, 
                errors: errors
            });
        }

        const createdCategories = [];
        for (const categoryData of categories) {
            const category = new Category({
                name: categoryData.name,
                description: categoryData.description,
                language: categoryData.language
            });

            const newCategory = await category.save({ session });
            createdCategories.push(newCategory);
        }

        await session.commitTransaction();
        return res.status(201).json({ 
            message: 'Categories created successfully', 
            categories: createdCategories
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

// Create a list of categories from csv
router.post('/csv', authenticateToken, upload.single('categories'), async (req, res) => {
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

        const categories = csvToArray(csvData);

        // Check if the request body is a non-empty array
        if (categories.length === 0) {
            return res.status(400).json({
                message: 'An error occurred',
                error: 'Categories must be a non-empty array'
            });
        }

        // Start a session for the transaction
        const session = await Category.startSession();
        session.startTransaction();
            
        try {
            const errors = [];
            
            for (const categoryData of categories) {
                // Check for missing parameters
                const missingParams = checkMissingParams(categoryData, REQUIRED_PARAMS);

                if (missingParams.length > 0) {
                    errors.push({
                        error: 'Missing parameters',
                        missing: missingParams,
                        category: categoryData
                    });
                }
                
                // Performance and abuse safeguard
                const nameError = validateStringLength('Name', categoryData.name, CATEGORY_NAME_MIN_LENGTH, CATEGORY_NAME_MAX_LENGTH);
                if (nameError) {
                    errors.push({
                        error: nameError,
                        category: categoryData,
                        invalidLength: {
                            'name': categoryData.name
                        }
                    });
                }
                
                const descriptionError = validateStringLength('Description', categoryData.description, CATEGORY_DESCRIPTION_MIN_LENGTH, CATEGORY_DESCRIPTION_MAX_LENGTH);
                if (descriptionError) {
                    errors.push({
                        error: descriptionError,
                        category: categoryData,
                        invalidLength: {
                            'description': categoryData.description
                        }
                    });
                }
                
                const languageError = validateStringLength('Language', categoryData.language, LANGUAGE_MIN_LENGTH, LANGUAGE_MAX_LENGTH);
                if (languageError) {
                    errors.push({
                        error: languageError,
                        category: categoryData,
                        invalidLength: {
                            'language': categoryData.language
                        }
                    });
                }  

                // Check if there is invalid language parameter
                if (!languageError && !missingParams.includes('language') && !Category.schema.path('language').enumValues.includes(categoryData.language)) {
                    errors.push({
                        error: 'Language must be part of [' + Category.schema.path('language').enumValues + ']',
                        category: categoryData,
                        invalidParams: {
                            'language': categoryData.language
                        }
                    });
                }
            }

            if (errors.length > 0) {
                await session.abortTransaction();
                return res.status(400).json({ 
                    message: 'Some categories could not be processed', 
                    length: errors.length, 
                    errors: errors
                });
            }

            const createdCategories = [];
            for (const categoryData of categories) {
                const category = new Category({
                    name: categoryData.name,
                    description: categoryData.description,
                    language: categoryData.language
                });

                const newCategory = await category.save({ session });
                createdCategories.push(newCategory);
            }

            await session.commitTransaction();
            return res.status(201).json({ 
                message: 'Categories created successfully', 
                categories: createdCategories
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
});


/********/
/* UPDATE */
/********/

// Update category
router.patch('/:id', authenticateToken, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Invalid category ID format'
        });
    }

    let category;
    try {
        category = await Category.findById(req.params.id);
        if (category === null) {
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
    res.category = category;
    next();
}, async (req, res) => {
    // Check if parameters are  in valid format    
    const invalidParams = checkInvalidTypes(req.body, EXPECTED_TYPES, {  skipIfMissing: true });

    // If there are invalid parameters, return an error response
    if (Object.keys(invalidParams).length > 0) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Parameters are in wrong formats',
            invalidParams
        });
    }    

    // Performance and abuse safeguard
    const invalidLength = [];
    if (req.body.name !== undefined && req.body.name !== null && req.body.name !== '' && typeof req.body.name === EXPECTED_TYPES.name) {
        const nameError = validateStringLength('Name', req.body.name, CATEGORY_NAME_MIN_LENGTH, CATEGORY_NAME_MAX_LENGTH);
        if (nameError) {
            invalidLength.push(nameError);
        }
    }

    if (req.body.description !== undefined && req.body.description !== null && req.body.description !== '' && typeof req.body.description === EXPECTED_TYPES.description) {
        const descriptionError = validateStringLength('Description', req.body.description, CATEGORY_DESCRIPTION_MIN_LENGTH, CATEGORY_DESCRIPTION_MAX_LENGTH);
        if (descriptionError) {
            invalidLength.push(descriptionError);
        }
    }

    if (req.body.language !== undefined && req.body.language !== null && req.body.language !== '' && typeof req.body.language === EXPECTED_TYPES.language) {
        const languageError = validateStringLength('Language', req.body.language, LANGUAGE_MIN_LENGTH, LANGUAGE_MAX_LENGTH);
        if (languageError) {
            invalidLength.push(languageError);
        }
    }    

    if (invalidLength.length > 0) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Validation failed',
            invalidLength
        });
    }

    if (req.body.language !== undefined && req.body.language !== null && req.body.language !== '' && !Category.schema.path('language').enumValues.includes(req.body.language)) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Language must be part of [' + Category.schema.path('language').enumValues + ']',
            invalidParams:  req.body.language
        });
    }

    // Check if any field was updated
    let updated = false;
    if (req.body.name !== undefined && req.body.name !== null && req.body.name !== res.category.name) {
        res.category.name = req.body.name;
        updated = true;
    }    
    if (req.body.description !== undefined && req.body.description !== null && req.body.description !== res.category.description) {
        res.category.description = req.body.description;
        updated = true;
    }
    if (req.body.language !== undefined && req.body.language !== null && req.body.language !== res.category.language) {
        res.category.language = req.body.language;
        updated = true;
    }
    if (!updated) {
        return res.status(200).json({
            message: 'No fields were updated' 
        });
    }

    // Update the updatedAt field to the current time
    res.category.updatedAt = new Date();

    try {
        const updatedCategory = await res.category.save();
        return res.json(updatedCategory);
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

// Delete all categories
router.delete('/all', authenticateToken, async (req, res) => {
    try {
        const result = await Category.deleteMany({});

        return res.json({
            message: 'All categories deleted',
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        return res.status(500).json({
            message: 'An error occurred',
            error: err.message,
        });
    }
});

// Delete category
router.delete('/:id', authenticateToken, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Invalid category ID format'
        });
    }

    let category;
    try {
        category = await Category.findById(req.params.id);
        if (category === null) {
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
    res.category = category;
    next();
}, async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        
        if (!deletedCategory) {
            return res.status(404).json({ 
                message: 'An error occurred',
                error: 'Category not found'
            });
        }

        return res.json({
            message: 'Category deleted',
            deletedCategory: {
                _id: deletedCategory._id,
                categoryId: deletedCategory.categoryId,
                name: deletedCategory.name,
                description: deletedCategory.description,
                language: deletedCategory.language,
                createdAt: deletedCategory.createdAt,
                updatedAt: deletedCategory.updatedAt,
                __v: deletedCategory.__v,
            }
        });
    } catch (err) {
        return res.status(500).json({ 
            message: 'An error occurred',
            error: err.message 
        });
    }
});

module.exports = router;