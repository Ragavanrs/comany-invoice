/**
 * Validation utility functions
 */

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Object with isValid boolean and errors object
 */
export const validateRequired = (data, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors[field] = 'This field is required';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone.replace(/\s+/g, ''));
};

/**
 * Validate GST number (Indian format)
 * @param {string} gst - GST number to validate
 * @returns {boolean} True if valid
 */
export const validateGST = (gst) => {
  const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return re.test(gst);
};

/**
 * Validate number (positive)
 * @param {number} num - Number to validate
 * @returns {boolean} True if valid
 */
export const validatePositiveNumber = (num) => {
  return !isNaN(num) && Number(num) > 0;
};

/**
 * Validate date (not in future)
 * @param {string} date - Date string to validate
 * @returns {boolean} True if valid
 */
export const validateDate = (date) => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return selectedDate <= today;
};

/**
 * Format validation errors for display
 * @param {Object} errors - Errors object
 * @returns {string} Formatted error message
 */
export const formatErrors = (errors) => {
  return Object.values(errors).join(', ');
};
