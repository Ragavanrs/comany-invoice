import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * InvoiceForm Component
 * Reusable form for creating and editing invoices
 */
const InvoiceForm = ({ invoice, onSave, onCancel, onDownload }) => {
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNo: "",
    date: "",
    customerName: "",
    customerAddress: "",
    partyGstin: "",
    poNo: "",
    dcNo: "",
    items: [
      { description: "", hsnCode: "", qty: 0, gst: 18, rate: 0, amount: 0 },
    ],
  });

  const [gstType, setGstType] = useState("intra");

  // Pre-populate form when editing
  useEffect(() => {
    if (invoice) {
      setInvoiceDetails({
        invoiceNo: invoice.invoiceNo || "",
        date: invoice.date || "",
        customerName: invoice.customerName || "",
        customerAddress: invoice.customerAddress || "",
        partyGstin: invoice.partyGstin || "",
        poNo: invoice.poNo || "",
        dcNo: invoice.dcNo || "",
        items: invoice.items || [
          { description: "", hsnCode: "", qty: 0, gst: 18, rate: 0, amount: 0 },
        ],
      });
      setGstType(invoice.gstType || "intra");
    }
  }, [invoice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceDetails({ ...invoiceDetails, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...invoiceDetails.items];
    
    if (field === "qty" || field === "rate" || field === "gst") {
      items[index][field] = parseFloat(value) || 0;
    } else {
      items[index][field] = value;
    }

    const qty = parseFloat(items[index].qty) || 0;
    const rate = parseFloat(items[index].rate) || 0;
    const gst = parseFloat(items[index].gst) || 0;

    const baseAmount = qty * rate;
    const gstAmount = (baseAmount * gst) / 100;
    items[index].amount = baseAmount + gstAmount;

    setInvoiceDetails({ ...invoiceDetails, items });
  };

  const addItemRow = () => {
    setInvoiceDetails({
      ...invoiceDetails,
      items: [...invoiceDetails.items, { description: "", hsnCode: "", qty: 0, gst: 18, rate: 0, amount: 0 }],
    });
  };

  const removeItemRow = (index) => {
    const items = invoiceDetails.items.filter((_, i) => i !== index);
    setInvoiceDetails({ ...invoiceDetails, items });
  };

  const calculateTotal = () => {
    return invoiceDetails.items.reduce((total, item) => total + item.amount, 0).toFixed(2);
  };

  const handleSave = () => {
    const dataToSave = {
      ...invoiceDetails,
      gstType,
      id: invoice?.id || Date.now(),
      createdAt: invoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(dataToSave);
  };

  const handleDownload = () => {
    const dataToDownload = {
      ...invoiceDetails,
      gstType,
    };
    onDownload(dataToDownload);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <form>
          <div className="row mb-4">
            <div className="col-12">
              <h4 className="text-primary border-bottom pb-2">
                <i className="bi bi-file-text me-2"></i>Invoice Details
              </h4>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="invoiceNo" className="form-label fw-bold">
                <i className="bi bi-hash me-1"></i>Invoice Number
              </label>
              <input type="text" className="form-control" id="invoiceNo" name="invoiceNo" 
                value={invoiceDetails.invoiceNo} onChange={handleInputChange} required placeholder="Enter invoice number" />
            </div>
            <div className="col-md-6">
              <label htmlFor="date" className="form-label fw-bold">
                <i className="bi bi-calendar me-1"></i>Date
              </label>
              <input type="date" className="form-control" id="date" name="date" 
                value={invoiceDetails.date} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <h4 className="text-primary border-bottom pb-2">
                <i className="bi bi-person me-2"></i>Customer Details
              </h4>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="customerName" className="form-label fw-bold">
                <i className="bi bi-person me-1"></i>Customer Name
              </label>
              <input type="text" className="form-control" id="customerName" name="customerName" 
                value={invoiceDetails.customerName} onChange={handleInputChange} required placeholder="Enter customer name" />
            </div>
            <div className="col-md-6">
              <label htmlFor="partyGstin" className="form-label fw-bold">
                <i className="bi bi-building me-1"></i>Party GSTIN
              </label>
              <input type="text" className="form-control" id="partyGstin" name="partyGstin" 
                value={invoiceDetails.partyGstin} onChange={handleInputChange} placeholder="Enter GSTIN number" />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-12">
              <label htmlFor="customerAddress" className="form-label fw-bold">
                <i className="bi bi-geo-alt me-1"></i>Customer Address
              </label>
              <textarea className="form-control" id="customerAddress" name="customerAddress" 
                value={invoiceDetails.customerAddress} onChange={handleInputChange} rows="3" placeholder="Enter customer address" />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="poNo" className="form-label fw-bold">
                <i className="bi bi-file-earmark me-1"></i>P.O. Number
              </label>
              <input type="text" className="form-control" id="poNo" name="poNo" 
                value={invoiceDetails.poNo} onChange={handleInputChange} placeholder="Enter PO number" />
            </div>
            <div className="col-md-6">
              <label htmlFor="dcNo" className="form-label fw-bold">
                <i className="bi bi-truck me-1"></i>D.C. Number
              </label>
              <input type="text" className="form-control" id="dcNo" name="dcNo" 
                value={invoiceDetails.dcNo} onChange={handleInputChange} placeholder="Enter DC number" />
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="text-primary border-bottom pb-2">
                  <i className="bi bi-list-ul me-2"></i>Item Details
                </h4>
                <button type="button" className="btn btn-success btn-sm" onClick={addItemRow}>
                  <i className="bi bi-plus-circle me-1"></i>Add Item
                </button>
              </div>
            </div>
          </div>

          <div className="table-responsive mb-4">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th scope="col" className="text-center">S.No</th>
                  <th scope="col">Description</th>
                  <th scope="col">HSN Code</th>
                  <th scope="col" className="text-end">Rate</th>
                  <th scope="col" className="text-center">Qty</th>
                  <th scope="col" className="text-center">GST %</th>
                  <th scope="col" className="text-end">Amount</th>
                  <th scope="col" className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoiceDetails.items.map((item, index) => (
                  <tr key={index} className="align-middle">
                    <td className="text-center fw-bold">{index + 1}</td>
                    <td>
                      <input type="text" className="form-control form-control-sm" value={item.description} 
                        onChange={(e) => handleItemChange(index, "description", e.target.value)} placeholder="Item description" />
                    </td>
                    <td>
                      <input type="text" className="form-control form-control-sm" value={item.hsnCode} 
                        onChange={(e) => handleItemChange(index, "hsnCode", e.target.value)} placeholder="HSN Code" />
                    </td>
                    <td>
                      <input type="number" className="form-control form-control-sm text-end" value={item.rate} 
                        onChange={(e) => handleItemChange(index, "rate", e.target.value)} min="0" step="0.01" />
                    </td>
                    <td>
                      <input type="number" className="form-control form-control-sm text-center" value={item.qty} 
                        onChange={(e) => handleItemChange(index, "qty", e.target.value)} min="0" step="1" />
                    </td>
                    <td>
                      <select className="form-select form-select-sm" value={item.gst} 
                        onChange={(e) => handleItemChange(index, "gst", e.target.value)}>
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </td>
                    <td>
                      <input type="number" className="form-control form-control-sm text-end bg-light" 
                        value={(parseFloat(item.amount) || 0).toFixed(2)} readOnly />
                    </td>
                    <td className="text-center">
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeItemRow(index)}
                        disabled={invoiceDetails.items.length === 1}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="gstType" className="form-label fw-bold">
                <i className="bi bi-percent me-1"></i>Tax Type
              </label>
              <select id="gstType" className="form-select" value={gstType} onChange={(e) => setGstType(e.target.value)}>
                <option value="intra">CGST + SGST (Intra-state)</option>
                <option value="igst">IGST (Inter-state)</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="alert alert-info d-flex align-items-center">
                <i className="bi bi-calculator me-2"></i>
                <strong>Total Amount: ₹ {calculateTotal()}</strong>
              </div>
            </div>
            <div className="col-md-6 text-end">
              <div className="btn-group" role="group">
                {invoice && (
                  <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    <i className="bi bi-x-circle me-1"></i>Cancel
                  </button>
                )}
                <button type="button" className="btn btn-success" onClick={handleSave}>
                  <i className="bi bi-save me-1"></i>Save Invoice
                </button>
                <button type="button" className="btn btn-primary" onClick={handleDownload}>
                  <i className="bi bi-file-earmark-pdf me-1"></i>Generate PDF
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

InvoiceForm.propTypes = {
  invoice: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

export default InvoiceForm;
