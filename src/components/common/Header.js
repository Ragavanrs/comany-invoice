import React from 'react';
import ThemeToggle from './ThemeToggle';
import '../../styles/header.css';

/**
 * Header Component
 * Top navigation bar with project title and theme toggle
 */
const Header = () => {
  return (
    <header className="app-header">
      <div className="container-fluid">
        <div className="row align-items-center py-3">
          <div className="col">
            <h1 className="h4 mb-0">Document Management System</h1>
            <p className="text-muted mb-0 small">Invoice, Letter Pad & Delivery Challan Generator</p>
          </div>
          <div className="col-auto">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
