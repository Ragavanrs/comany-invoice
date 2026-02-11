/**
 * LocalStorage utility functions for document management
 * Provides CRUD operations for invoices, letter pads, and delivery challans
 */

// Storage keys
const STORAGE_KEYS = {
  INVOICES: 'invoices',
  LETTERPADS: 'letterPads',
  CHALLANS: 'challans',
  THEME: 'theme',
};

/**
 * Get all items from localStorage by key
 * @param {string} key - Storage key
 * @returns {Array} Array of items
 */
export const getItems = (key) => {
  try {
    const items = localStorage.getItem(key);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

/**
 * Save items to localStorage
 * @param {string} key - Storage key
 * @param {Array} items - Items to save
 */
export const saveItems = (key, items) => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Add a new item
 * @param {string} key - Storage key
 * @param {Object} item - Item to add
 * @returns {Object} Added item with timestamp
 */
export const addItem = (key, item) => {
  const items = getItems(key);
  const newItem = {
    ...item,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveItems(key, items);
  return newItem;
};

/**
 * Update an existing item
 * @param {string} key - Storage key
 * @param {string} id - Item ID
 * @param {Object} updates - Updates to apply
 * @returns {Object|null} Updated item or null if not found
 */
export const updateItem = (key, id, updates) => {
  const items = getItems(key);
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) return null;
  
  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveItems(key, items);
  return items[index];
};

/**
 * Delete an item
 * @param {string} key - Storage key
 * @param {string} id - Item ID
 * @returns {boolean} True if deleted successfully
 */
export const deleteItem = (key, id) => {
  const items = getItems(key);
  const filteredItems = items.filter(item => item.id !== id);
  
  if (filteredItems.length === items.length) return false;
  
  saveItems(key, filteredItems);
  return true;
};

/**
 * Get a single item by ID
 * @param {string} key - Storage key
 * @param {string} id - Item ID
 * @returns {Object|null} Item or null if not found
 */
export const getItem = (key, id) => {
  const items = getItems(key);
  return items.find(item => item.id === id) || null;
};

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get theme preference from localStorage
 * @returns {string} Theme preference ('light' or 'dark')
 */
export const getTheme = () => {
  return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
};

/**
 * Save theme preference to localStorage
 * @param {string} theme - Theme ('light' or 'dark')
 */
export const saveTheme = (theme) => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

export { STORAGE_KEYS };
