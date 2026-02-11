import React, { useState, useEffect } from 'react';
import { getTheme, saveTheme } from '../../utils/storage';

/**
 * ThemeToggle Component
 * Provides a button to toggle between light and dark themes
 */
const ThemeToggle = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = getTheme();
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    saveTheme(newTheme);
  };

  return (
    <button
      className="btn btn-outline-secondary"
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <i className="bi bi-moon-stars"></i>
      ) : (
        <i className="bi bi-sun"></i>
      )}
    </button>
  );
};

export default ThemeToggle;
