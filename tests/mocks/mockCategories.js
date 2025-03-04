const mongoose = require('mongoose');

const enumLanguage = ['eng', 'fr'];
const headersCategories = ['name', 'description', 'language'];
const mockCategories = [
    {
        _id: new mongoose.Types.ObjectId('6702a8418357fa576c95ea44'),
        categoryId: new mongoose.Types.ObjectId('6702a8418357fa576c95ea43'),
        name: 'Test Category name',
        description: 'Test Category description',
        language: 'eng',
        createdAt: '2024-10-06T15:09:53.744Z',
        updatedAt: '2024-10-06T15:09:53.744Z',
        __v: 0,
    },
    {
        _id: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3e'),
        categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d'),
        name: 'Test Category name 2',
        description: 'Test Category description 2',
        language: 'eng',
        createdAt: '2024-10-27T16:46:43.580Z',
        updatedAt: '2024-10-27T16:46:43.580Z',
        __v: 0
    },
    {
        _id: new mongoose.Types.ObjectId('672d0698004c7514fcd799b0'),
        categoryId: new mongoose.Types.ObjectId('672d0698004c7514fcd799af'),
        name: 'Test Category name 3',
        description: 'Test Category description 3',
        language: 'fr',
        createdAt: '2024-11-07T18:27:36.582Z',
        updatedAt: '2024-11-07T18:27:36.582Z',
        __v: 0
    },
    {
        _id: new mongoose.Types.ObjectId('672d0698004c7514fcd799c8'),
        categoryId: new mongoose.Types.ObjectId('672d0698004c7514fcd799c7'),
        name: 'Test Category name 4',
        description: 'Test Category description 4',
        language: 'fr',
        createdAt: '2024-11-07T18:27:36.582Z',
        updatedAt: '2024-11-07T18:27:36.582Z',
        __v: 0
    }
];

module.exports = { enumLanguage, headersCategories, mockCategories };