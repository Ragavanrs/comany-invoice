import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * LetterPadForm Component
 * Form for creating and editing letter pad documents
 */
const LetterPadForm = ({ letter, onSave, onCancel, onDownload }) => {
  const [letterDetails, setLetterDetails] = useState({
    refNo: '',
    date: new Date().toISOString().split('T')[0],
    recipientName: '',
    recipientAddress: '',
    subject: '',
    body: '',
    senderName: '',
    senderDesignation: '',
    template: 'formal',
  });

  // Pre-populate form if editing
  useEffect(() => {
    if (letter) {
      setLetterDetails(letter);
    }
  }, [letter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLetterDetails({ ...letterDetails, [name]: value });
  };

  const handleSave = () => {
    onSave(letterDetails);
  };

  const handleDownloadPDF = () => {
    onDownload(letterDetails);
  };

  return (
    <div className="letter-form">
      <div className="row">
        {/* Form Column */}
        <div className="col-lg-6">
          <div className="form-section">
            <h5 className="form-section-title">
              <i className="bi bi-file-text me-2"></i>
              Letter Details
            </h5>
            
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="refNo" className="form-label">
                  Reference Number *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="refNo"
                  name="refNo"
                  value={letterDetails.refNo}
                  onChange={handleInputChange}
                  required
                  placeholder="REF/2024/001"
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="date" className="form-label">
                  Date *
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="date"
                  name="date"
                  value={letterDetails.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="template" className="form-label">
                  Template
                </label>
                <select
                  className="form-select"
                  id="template"
                  name="template"
                  value={letterDetails.template}
                  onChange={handleInputChange}
                >
                  <option value="formal">Formal</option>
                  <option value="semiformal">Semi-Formal</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h5 className="form-section-title">
              <i className="bi bi-person me-2"></i>
              Recipient Details
            </h5>
            
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="recipientName" className="form-label">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="recipientName"
                  name="recipientName"
                  value={letterDetails.recipientName}
                  onChange={handleInputChange}
                  required
                  placeholder="Mr. John Doe"
                />
              </div>

              <div className="col-12">
                <label htmlFor="recipientAddress" className="form-label">
                  Recipient Address *
                </label>
                <textarea
                  className="form-control"
                  id="recipientAddress"
                  name="recipientAddress"
                  value={letterDetails.recipientAddress}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  placeholder="Enter full address"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h5 className="form-section-title">
              <i className="bi bi-envelope me-2"></i>
              Letter Content
            </h5>
            
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="subject" className="form-label">
                  Subject *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="subject"
                  name="subject"
                  value={letterDetails.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter letter subject"
                />
              </div>

              <div className="col-12">
                <label htmlFor="body" className="form-label">
                  Body *
                </label>
                <textarea
                  className="form-control"
                  id="body"
                  name="body"
                  value={letterDetails.body}
                  onChange={handleInputChange}
                  rows="10"
                  required
                  placeholder="Enter letter content..."
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h5 className="form-section-title">
              <i className="bi bi-pen me-2"></i>
              Sender Signature
            </h5>
            
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="senderName" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="senderName"
                  name="senderName"
                  value={letterDetails.senderName}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="senderDesignation" className="form-label">
                  Designation
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="senderDesignation"
                  name="senderDesignation"
                  value={letterDetails.senderDesignation}
                  onChange={handleInputChange}
                  placeholder="Your Designation"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-section">
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSave}
              >
                <i className="bi bi-save me-2"></i>
                Save Letter
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDownloadPDF}
              >
                <i className="bi bi-download me-2"></i>
                Download PDF
              </button>
              {letter && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onCancel}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div className="col-lg-6">
          <div className="preview-panel">
            <h5 className="preview-title">
              <i className="bi bi-eye me-2"></i>
              Preview
            </h5>
            <div className="letter-preview">
              <div className="mb-3">
                <strong>SURYA POWER</strong>
                <br />
                <small className="text-muted">
                  DG Set Hiring, Old DG Set Buying, Selling & Servicing
                </small>
                <br />
                <small className="text-muted">
                  No.1/11, G.N.T Road, Padiyanallur Redhills, Chennai - 600 052
                </small>
              </div>

              <div className="mb-3">
                <div className="row">
                  <div className="col-6">
                    <small><strong>Ref:</strong> {letterDetails.refNo || 'N/A'}</small>
                  </div>
                  <div className="col-6 text-end">
                    <small><strong>Date:</strong> {letterDetails.date || 'N/A'}</small>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <small>
                  <strong>To,</strong>
                  <br />
                  {letterDetails.recipientName || 'Recipient Name'}
                  <br />
                  {letterDetails.recipientAddress || 'Recipient Address'}
                </small>
              </div>

              <div className="mb-3">
                <small>
                  <strong>Subject:</strong> {letterDetails.subject || 'Letter Subject'}
                </small>
              </div>

              <div className="mb-3">
                <small style={{ whiteSpace: 'pre-wrap' }}>
                  {letterDetails.body || 'Letter content will appear here...'}
                </small>
              </div>

              {(letterDetails.senderName || letterDetails.senderDesignation) && (
                <div className="mt-4">
                  <small>
                    <strong>Yours {letterDetails.template === 'formal' ? 'faithfully' : 'sincerely'},</strong>
                    <br /><br />
                    {letterDetails.senderName && (
                      <>
                        {letterDetails.senderName}
                        <br />
                      </>
                    )}
                    {letterDetails.senderDesignation && (
                      <em>{letterDetails.senderDesignation}</em>
                    )}
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

LetterPadForm.propTypes = {
  letter: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

export default LetterPadForm;
