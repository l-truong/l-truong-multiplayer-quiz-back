const mongoose = require('mongoose');

const mockUsers = [
    {
        _id: "68349f6b98b867e61770548f",
        userId: "68349f6b98b867e61770548e",
        username: "admin01",
        password: "$2b$10$qVU5Gw3xb.fDDsvLqXHrZuNsVn91hN17YVbe2japu9HnjiSSBmPiu",
        createdAt: "2025-05-26T17:05:47.546Z",
        updatedAt: "2025-05-26T17:05:47.546Z",
        __v: 0
    },
    {
        _id: "68349f7498b867e617705494",
        userId: "68349f7498b867e617705493",
        username: "user01",
        password: "$2b$10$G/4hr1Z5xkpMsj9s6rjZluYoYYVTRJ54hsj.YokZNjCcGoCNpUi6m",
        createdAt: "2025-05-26T17:05:56.987Z",
        updatedAt: "2025-05-26T17:05:56.987Z",
        __v: 0
    },
    {
        _id: "68349f7b98b867e61770549a",
        userId: "68349f7b98b867e617705499",
        username: "user02",
        password: "$2b$10$GORQ7dad7/mJvL7LPNUsy.Bn9UIz4O1MHeTll03TvMHU34qZmxdZa",
        createdAt: "2025-05-26T17:06:03.785Z",
        updatedAt: "2025-05-26T17:06:03.785Z",
        __v: 0
    }
];

module.exports = { mockUsers };