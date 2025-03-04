const { mockSession } = require('../mocks/mockSession');
const { enumLanguage, mockCategories } = require('../mocks/mockCategories');
const { mockQuestions } = require('../mocks/mockQuestions');

const Category = require('../../api/models/category');
const Question = require('../../api/models/question');

const setupCategorieMocks = () => {
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

module.exports = { setupCategorieMocks, setupQuestionsMocks, resetMocks };