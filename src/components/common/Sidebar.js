import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/sidebar.css';

/**
 * Sidebar Component
 * Navigation sidebar with links to different modules
 */
const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      path: '/',
      icon: 'bi-house-door',
      label: 'Dashboard',
    },
    {
      path: '/invoice',
      icon: 'bi-file-earmark-text',
      label: 'Invoice Generator',
    },
    {
      path: '/letterpad',
      icon: 'bi-envelope',
      label: 'Letter Pad',
    },
    {
      path: '/challan',
      icon: 'bi-truck',
      label: 'Delivery Challan',
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="btn btn-dark sidebar-toggle d-md-none"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <i className="bi bi-list"></i>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h5 className="mb-0">
            <i className="bi bi-file-earmark-richtext me-2"></i>
            {!isCollapsed && 'DMS'}
          </h5>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav flex-column">
            {menuItems.map((item) => (
              <li className="nav-item" key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  title={item.label}
                >
                  <i className={`bi ${item.icon} me-2`}></i>
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Collapse Button */}
        <div className="sidebar-footer d-none d-md-block">
          <button
            className="btn btn-sm btn-outline-light w-100"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
          >
            <i className={`bi bi-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="sidebar-overlay d-md-none"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
