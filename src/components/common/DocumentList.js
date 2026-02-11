import React from 'react';
import PropTypes from 'prop-types';

/**
 * DocumentList Component
 * Reusable component for displaying a list of documents
 */
const DocumentList = ({
  documents,
  onEdit,
  onDelete,
  onDownload,
  emptyMessage = 'No documents found',
  emptyIcon = 'bi-inbox',
}) => {
  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <i className={`bi ${emptyIcon}`}></i>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      {documents.map((doc) => (
        <div key={doc.id} className="document-card">
          <div className="document-card-header">
            <div>
              <h6 className="document-card-title">{doc.title || doc.id}</h6>
              <div className="document-card-meta">
                Created: {new Date(doc.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="document-card-actions">
              {onEdit && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => onEdit(doc)}
                  title="Edit"
                >
                  <i className="bi bi-pencil"></i>
                </button>
              )}
              {onDownload && (
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => onDownload(doc)}
                  title="Download PDF"
                >
                  <i className="bi bi-download"></i>
                </button>
              )}
              {onDelete && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDelete(doc.id)}
                  title="Delete"
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

DocumentList.propTypes = {
  documents: PropTypes.array.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onDownload: PropTypes.func,
  emptyMessage: PropTypes.string,
  emptyIcon: PropTypes.string,
};

export default DocumentList;
