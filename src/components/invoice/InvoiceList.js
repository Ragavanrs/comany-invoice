import React from 'react';
import PropTypes from 'prop-types';
import DocumentList from '../common/DocumentList';

/**
 * InvoiceList Component
 * Displays list of saved invoices
 */
const InvoiceList = ({ invoices, onEdit, onDelete, onDownload }) => {
  // Format invoices for DocumentList
  const formattedInvoices = invoices.map(invoice => ({
    ...invoice,
    title: `Invoice #${invoice.invoiceNo} - ${invoice.customerName}`,
  }));

  return (
    <div>
      <h4 className="mb-3">Saved Invoices ({invoices.length})</h4>
      <DocumentList
        documents={formattedInvoices}
        onEdit={onEdit}
        onDelete={onDelete}
        onDownload={onDownload}
        emptyMessage="No invoices saved yet. Create your first invoice!"
        emptyIcon="bi-file-earmark-text"
      />
    </div>
  );
};

InvoiceList.propTypes = {
  invoices: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

export default InvoiceList;
