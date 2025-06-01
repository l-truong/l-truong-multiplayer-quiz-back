const { mockSession } = require('../mocks/mockSession');
const { mockUsers } = require('../mocks/mockUsers');
const { enumLanguage, mockCategories } = require('../mocks/mockCategories');
const { mockQuestions } = require('../mocks/mockQuestions');

const User = require('../../api/models/user');
const Category = require('../../api/models/category');
const Question = require('../../api/models/question');

const setupUsersMocks = () => {
    User.find.mockResolvedValue(mockUsers);
    User.startSession.mockResolvedValue(mockSession);
};

const setupCategoriesMocks = () => {
    Category.find.mockResolvedValue(mockCategories);
    Category.schema = { path: () => ({ enumValues: enumLanguage }) };
    Category.startSession.mockResolvedValue(mockSession);
};

const setupQuestionsMocks = () => {
    Category.find.mockResolvedValue(mockCategories);
    Question.find.mockResolvedValue(mockQuestions);
    Question.startSession.mockResolvedValue(mockSession);
};

const resetMocks = () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
};

module.exports = { setupUsersMocks, setupCategoriesMocks, setupQuestionsMocks, resetMocks };