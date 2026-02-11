import React, { useState } from 'react';
import InvoiceForm from './InvoiceForm';
import InvoiceList from './InvoiceList';
import { getItems, addItem, updateItem, deleteItem, STORAGE_KEYS } from '../../utils/storage';
import { generateInvoicePDF } from '../../utils/pdfGenerators/invoicePDF';

/**
 * InvoiceModule Component
 * Main container for Invoice Generator module
 */
const InvoiceModule = () => {
  const [showForm, setShowForm] = useState(true);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [savedInvoices, setSavedInvoices] = useState(getItems(STORAGE_KEYS.INVOICES));

  const handleSave = (invoiceData) => {
    if (editingInvoice) {
      // Update existing invoice
      updateItem(STORAGE_KEYS.INVOICES, editingInvoice.id, invoiceData);
    } else {
      // Add new invoice
      addItem(STORAGE_KEYS.INVOICES, invoiceData);
    }
    
    // Refresh list
    setSavedInvoices(getItems(STORAGE_KEYS.INVOICES));
    setEditingInvoice(null);
    setShowForm(false);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteItem(STORAGE_KEYS.INVOICES, id);
      setSavedInvoices(getItems(STORAGE_KEYS.INVOICES));
    }
  };

  const handleDownload = (invoice) => {
    generateInvoicePDF(invoice, {
      gstType: invoice.gstType || 'intra',
      company: {
        name: "SURYA POWER",
        tagline: "DG Set Hiring, Old DG Set Buying, Selling & Servicing",
        address: "No.1/11, G.N.T Road, Padiyanallur Redhills, Chennai, Thiruvallur, Tamil Nadu - 600 052",
        gstin: "33AKNPR3914K1ZT",
        contacts: "Mob: 9790987190 / 9840841887",
        bankTitle: "TAMILNAD MERCANTILE BANK",
        bankName: "SURYA POWER",
        accountNo: "22815005800163",
        branch: "NARAVARIKUPPAM BRANCH",
        ifsc: "TMBL0000228",
      }
    });
  };

  const handleCancel = () => {
    setEditingInvoice(null);
    setShowForm(false);
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>
              <i className="bi bi-file-earmark-text me-2"></i>
              Invoice Generator
            </h2>
            <p>Create and manage GST invoices</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <>
                <i className="bi bi-list me-2"></i>
                View Saved Invoices
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle me-2"></i>
                Create New Invoice
              </>
            )}
          </button>
        </div>
      </div>

      {showForm ? (
        <InvoiceForm
          invoice={editingInvoice}
          onSave={handleSave}
          onCancel={handleCancel}
          onDownload={handleDownload}
        />
      ) : (
        <InvoiceList
          invoices={savedInvoices}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

export default InvoiceModule;
