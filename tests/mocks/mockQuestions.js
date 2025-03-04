const mongoose = require('mongoose');

const headersQuestions = ['questionText', 'options', 'correctAnswer', 'explanation', 'categoryId', 'imageUrl'];
const mockQuestions = [
    {
        _id: new mongoose.Types.ObjectId('6702afae2acce6212ee86085'),
        questionId: new mongoose.Types.ObjectId('6702afae2acce6212ee86084'),
        questionText: 'Test Question 1',
        options: [
            'answer 1',
            'answer 2',
            'answer 3',
            'answer 4',
        ],
        correctAnswer: 'answer 1',
        explanation: 'explanation 1',
        categoryId: new mongoose.Types.ObjectId('6702a8418357fa576c95ea43'),
        imageUrl: 'http://imageUrl1',
        createdAt: '2024-10-06T15:41:34.691Z',
        updatedAt: '2024-10-06T15:41:34.691Z',
        __v: 0
    },
    {
        _id: new mongoose.Types.ObjectId('6702af9f2acce6212ee8607f'),
        questionId: new mongoose.Types.ObjectId('6702af9f2acce6212ee8607e'),
        questionText: 'Test Question 2',
        options: [
            'answer 21',
            'answer 22',
            'answer 23',
            'answer 24'
        ],
        correctAnswer: 'answer 21',
        explanation: 'explanation 2',
        categoryId: new mongoose.Types.ObjectId('6702a8418357fa576c95ea43'),
        imageUrl: 'http://imageUrl2',
        createdAt: '2024-10-06T15:41:19.223Z',
        updatedAt: '2024-10-06T15:41:19.223Z',
        __v: 0
    },
    {
        _id: new mongoose.Types.ObjectId('672d0908004c7514fcd79d12'),
        questionId: new mongoose.Types.ObjectId('672d0908004c7514fcd79d11'),
        questionText: 'Test Question 3',
        options: [
            'answer 31',
            'answer 32',
            'answer 33',
            'answer 34'
        ],
        correctAnswer: 'answer 33',
        explanation: 'explanation 3',
        categoryId: new mongoose.Types.ObjectId('671e6e7393cee089f87f1f3d'),
        imageUrl: 'http://imageUrl3',
        createdAt: '2024-11-07T18:38:00.708Z',
        updatedAt: '2024-11-07T18:38:00.708Z',
        __v: 0
    },
    {
        _id: new mongoose.Types.ObjectId('672d0909004c7514fcd79d57'),
        questionId: new mongoose.Types.ObjectId('672d0909004c7514fcd79d56'),
        questionText: 'Test Question 4',
        options: [
            'answer 41',
            'answer 42',
            'answer 43',
            'answer 44'
        ],
        correctAnswer: 'answer 42',
        explanation: 'explanation 4',
        categoryId: new mongoose.Types.ObjectId('672d0698004c7514fcd799af'),
        imageUrl: 'http://imageUrl4',
        createdAt: '2024-11-07T18:38:01.081Z',
        updatedAt: '2024-11-07T18:38:01.081Z',
        __v: 0
    },
    {
        _id: new mongoose.Types.ObjectId('672d0909004c7514fcd79d63'),
        questionId: new mongoose.Types.ObjectId('672d0909004c7514fcd79d62'),
        questionText: 'Test Question 5',
        options: [
            'answer 51',
            'answer 52',
            'answer 53',
            'answer 54'
        ],
        correctAnswer: 'answer 51',
        explanation: 'explanation 5',
        categoryId: new mongoose.Types.ObjectId('672d0698004c7514fcd799af'),
        imageUrl: 'http://imageUrl5',
        createdAt: '2024-11-07T18:38:01.141Z',
        updatedAt: '2024-11-07T18:38:01.141Z',
        __v: 0
    },
    {
        _id: new mongoose.Types.ObjectId('672d0909004c7514fcd79d87'),
        questionId: new mongoose.Types.ObjectId('672d0909004c7514fcd79d86'),
        questionText: 'Test Question 6',
        options: [
            'answer 61',
            'answer 62',
            'answer 63',
            'answer 64'
        ],
        correctAnswer: 'answer 61',
        explanation: 'explanation 6',
        categoryId: new mongoose.Types.ObjectId('672d0698004c7514fcd799c7'),
        imageUrl: 'http://imageUrl6',
        createdAt: '2024-11-07T18:38:01.141Z',
        updatedAt: '2024-11-07T18:38:01.141Z',
        __v: 0
    }
];
const mockValue = mockQuestions[0]; // to avoid mutations in tests

module.exports = { headersQuestions, mockQuestions, mockValue };