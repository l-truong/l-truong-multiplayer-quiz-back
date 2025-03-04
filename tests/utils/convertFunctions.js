const mongoose = require('mongoose');

const convertObjectIdsToStrings = (arr) => {
    return arr.map(item => {
        const newItem = { ...item };
        for (let key in newItem) {
            if (newItem[key] instanceof mongoose.Types.ObjectId) {
            newItem[key] = newItem[key].toString();
            }
        }  
        return newItem;
    });
}

const convertObjectIdsToStringsInObject = (obj) => {
    const newObj = { ...obj };
    for (let key in newObj) {
        if (newObj[key] instanceof mongoose.Types.ObjectId) {
            newObj[key] = newObj[key].toString();
        }
    }  
    return newObj;
}

const convertObjectIdToString = (value) => {
    return value instanceof mongoose.Types.ObjectId ? value.toString() : value;
}

function arrayToCustomCsvBuffer(headers, data) {
    const rows = data.map((row) => {
        return headers.map(header => {
            if (header === 'options') {
                const str = Array.isArray(row[header])
                    ? row[header]
                        .map(option => option === null ? '' : option) 
                        .join(',') 
                    : '';
                return `[${str}]`;
            } else {
                return row[header] || '';
            }
        }).join(';');
    });

    return Buffer.from([headers.join(';'), ...rows].join('\n'));
}

module.exports = { convertObjectIdsToStrings, convertObjectIdsToStringsInObject, convertObjectIdToString, arrayToCustomCsvBuffer };