const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer();
const Category = require('../models/category');

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
router.post('/', async (req, res) => {
    // Check for missing parameters
    const missingParams = [];
    const requiredParams = ['name', 'description', 'language'];

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

    // Check if parameters are strings and valid
    const invalidParams = {};
    if (typeof req.body.name !== 'string') {
        invalidParams.name = req.body.name;
    }
    if (typeof req.body.description !== 'string') {
        invalidParams.description = req.body.description;
    }
    if (typeof req.body.language !== 'string') {
        invalidParams.language = req.body.language;
    }

    if (Object.keys(invalidParams).length > 0) {
        return res.status(400).json({
            message: 'An error occurred', 
            error: 'Parameters must be strings',
            invalidParams
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
router.post('/bulk', async (req, res) => {
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
            const missingParams = [];
            const requiredParams = ['name', 'description', 'language'];

            requiredParams.forEach(param => {
                if (categoryData[param] === undefined || categoryData[param] === null || categoryData[param] === '') {
                    missingParams.push(param);
                }
            });

            if (missingParams.length > 0) {
                errors.push({
                    error: 'Missing parameters',
                    missing: missingParams,
                    category: categoryData
                });
            }

            // Check if parameters are strings and valid
            const invalidParams = {};
            if (!missingParams.includes('name') && typeof categoryData.name !== 'string') {
                invalidParams.name = categoryData.name;
            }
            if (!missingParams.includes('description') && typeof categoryData.description !== 'string') {
                invalidParams.description = categoryData.description;
            }
            if (!missingParams.includes('language') && typeof categoryData.language !== 'string') {
                invalidParams.language = categoryData.language;
            }

            if (Object.keys(invalidParams).length > 0) {
                errors.push({
                    error: 'Parameters must be strings',
                    category: categoryData,
                    invalidParams
                });
            }      
            
            // Check if there is invalid language parameter
            if (!missingParams.includes('language') && !Category.schema.path('language').enumValues.includes(categoryData.language)) {
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
router.post('/csv', upload.single('categories'), async (req, res) => {
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
                const missingParams = [];
                const requiredParams = ['name', 'description', 'language'];

                requiredParams.forEach(param => {
                    if (categoryData[param] === '') {
                        missingParams.push(param);
                    }
                });

                if (missingParams.length > 0) {
                    errors.push({
                        error: 'Missing parameters',
                        missing: missingParams,
                        category: categoryData
                    });
                }
                
                // Check if there is invalid language parameter
                if (!missingParams.includes('language') && !Category.schema.path('language').enumValues.includes(categoryData.language)) {
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
router.patch('/:id', async (req, res, next) => {
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
    // Check if parameters are strings and valid
    const invalidParams = {};
    if (req.body.name !== undefined && req.body.name !== null && req.body.name !== '' && typeof req.body.name !== 'string') {
        invalidParams.name = req.body.name;
    }
    if (req.body.description !== undefined && req.body.description !== null && req.body.description !== '' && typeof req.body.description !== 'string') {
        invalidParams.description = req.body.description;
    }
    if (req.body.language !== undefined && req.body.language !== null && req.body.language !== '' && typeof req.body.language !== 'string') {
        invalidParams.language = req.body.language;
    }

    // If there are invalid parameters, return an error response
    if (Object.keys(invalidParams).length > 0) {
        return res.status(400).json({
            message: 'An error occurred',
            error: 'Parameters must be strings',
            invalidParams
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
router.delete('/all', async (req, res) => {
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
router.delete('/:id', async (req, res, next) => {
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