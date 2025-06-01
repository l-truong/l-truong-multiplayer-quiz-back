function checkMissingParams(data, requiredParams) {
  const missing = [];

  requiredParams.forEach(param => {
    const value = data[param];
    if (value === undefined || value === null || value === '') {
      missing.push(param);
    }
  });

  return missing;
}

function validateStringLength(field, value, minLength, maxLength) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    if (value.length < minLength || value.length > maxLength) {
        return `${field} must be between ${minLength} and ${maxLength} characters`;
    }
    return null;
}

/**
 * @param {Object} data - The data object (e.g., req.body).
 * @param {Object} paramTypeMap - A map of parameter names to expected types.
 * @param {Object} options - Configuration for behavior:
 *    - missingParams (array): skip validation for these fields.
 *    - skipIfMissing (boolean): skip if value is undefined/null/empty string.
 */
function checkInvalidTypes(data, paramTypeMap, options = {}) {
    const {
        missingParams = [],
        skipIfMissing = false
    } = options;

    const invalid = {};

    Object.entries(paramTypeMap).forEach(([param, expectedType]) => {
        if (missingParams.includes(param)) {
            return;
        }

        const value = data[param];
        const isMissing = value === undefined || value === null || value === '';

        if (skipIfMissing && isMissing) {
            return;
        }

        if (typeof value !== expectedType) {
            invalid[param] = value;
        }
    });

    return invalid;
}

module.exports = {
    checkMissingParams,    
    validateStringLength,
    checkInvalidTypes
};