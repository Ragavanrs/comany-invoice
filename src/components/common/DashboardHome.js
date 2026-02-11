import React from 'react';
import { Link } from 'react-router-dom';

/**
 * DashboardHome Component
 * Landing page showing overview of all modules
 */
const DashboardHome = () => {
  const modules = [
    {
      title: 'Invoice Generator',
      description: 'Create and manage tax invoices with GST calculations',
      icon: 'bi-file-earmark-text',
      color: '#0d6efd',
      link: '/invoice',
      features: ['GST Calculations', 'PDF Export', 'Save & Edit', 'Print Support'],
    },
    {
      title: 'Letter Pad',
      description: 'Generate professional business letters with templates',
      icon: 'bi-envelope',
      color: '#198754',
      link: '/letterpad',
      features: ['Multiple Templates', 'Rich Formatting', 'Digital Signature', 'PDF Export'],
    },
    {
      title: 'Delivery Challan',
      description: 'Create delivery challans for goods transportation',
      icon: 'bi-truck',
      color: '#ffc107',
      link: '/challan',
      features: ['Item Management', 'Transport Details', 'Auto Calculations', 'Save Records'],
    },
  ];

  return (
    <div className="dashboard-home fade-in">
      <div className="welcome-banner mb-4">
        <h2>Welcome to Document Management System</h2>
        <p className="text-muted">
          Create, manage, and export professional business documents with ease
        </p>
      </div>

      <div className="row g-4">
        {modules.map((module, index) => (
          <div className="col-12 col-md-6 col-lg-4" key={index}>
            <div className="card h-100 module-card">
              <div className="card-body">
                <div
                  className="module-icon mb-3"
                  style={{ color: module.color }}
                >
                  <i className={`bi ${module.icon}`}></i>
                </div>
                <h5 className="card-title">{module.title}</h5>
                <p className="card-text text-muted">{module.description}</p>
                
                <ul className="list-unstyled mb-3">
                  {module.features.map((feature, idx) => (
                    <li key={idx} className="mb-1">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <small>{feature}</small>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-footer bg-transparent border-top-0">
                <Link to={module.link} className="btn btn-primary w-100">
                  Open {module.title}
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-info-circle me-2"></i>
                Quick Start Guide
              </h5>
              <div className="row mt-3">
                <div className="col-md-4">
                  <h6>1. Choose a Module</h6>
                  <p className="text-muted small">
                    Select from Invoice, Letter Pad, or Delivery Challan based on your need
                  </p>
                </div>
                <div className="col-md-4">
                  <h6>2. Fill the Form</h6>
                  <p className="text-muted small">
                    Enter the required details with real-time validation and preview
                  </p>
                </div>
                <div className="col-md-4">
                  <h6>3. Save or Export</h6>
                  <p className="text-muted small">
                    Save for later editing or export as PDF for printing and sharing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
