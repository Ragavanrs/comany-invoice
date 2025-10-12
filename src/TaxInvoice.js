import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./invoice.css"; // optional external styling
import { generateInvoicePDF } from "./pdfGenerator";
const TaxInvoiceForm = () => {
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

  const [showSuccess, setShowSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gstType, setGstType] = useState("intra");
  const formRef = useRef(null);
  const successToastRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceDetails({ ...invoiceDetails, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...invoiceDetails.items];
    
    // Ensure proper type conversion for numeric fields
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

  // Improved number to words conversion
  const numberToWords = (num) => {
    // Handle edge cases
    if (!num || isNaN(num) || num === 0) return 'zero';
    
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    
    // Convert to integer for processing
    const integerPart = Math.floor(parseFloat(num));
    
    if (integerPart === 0) return 'zero';
    
    let result = '';
    const crores = Math.floor(integerPart / 10000000);
    const lakhs = Math.floor((integerPart % 10000000) / 100000);
    const thousands = Math.floor((integerPart % 100000) / 1000);
    const hundreds = Math.floor((integerPart % 1000) / 100);
    const tensAndOnes = integerPart % 100;
    
    if (crores > 0) {
      result += numberToWords(crores) + ' crore ';
    }
    if (lakhs > 0) {
      result += numberToWords(lakhs) + ' lakh ';
    }
    if (thousands > 0) {
      result += numberToWords(thousands) + ' thousand ';
    }
    if (hundreds > 0) {
      result += ones[hundreds] + ' hundred ';
    }
    if (tensAndOnes > 0) {
      if (tensAndOnes < 10) {
        result += ones[tensAndOnes];
      } else if (tensAndOnes < 20) {
        result += teens[tensAndOnes - 10];
      } else {
        result += tens[Math.floor(tensAndOnes / 10)];
        if (tensAndOnes % 10 > 0) {
          result += ' ' + ones[tensAndOnes % 10];
        }
      }
    }
    
    return result.trim() || 'zero';
  };

  // DOM manipulation effects
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Auto-focus first input on component mount
  useEffect(() => {
    const firstInput = formRef.current?.querySelector('input');
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  // Add smooth scrolling and form validation feedback
  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  };

  // Enhanced form validation with visual feedback
  const validateForm = () => {
    const requiredFields = ['invoiceNo', 'date', 'customerName'];
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
      const field = document.querySelector(`[name="${fieldName}"]`);
      if (field && !field.value.trim()) {
        field.classList.add('error');
        isValid = false;
      } else if (field) {
        field.classList.remove('error');
        field.classList.add('success');
      }
    });
    
    return isValid;
  };

  // Add input validation on blur
  const handleInputBlur = (e) => {
    const field = e.target;
    if (field.hasAttribute('required') && !field.value.trim()) {
      field.classList.add('error');
    } else if (field.value.trim()) {
      field.classList.remove('error');
      field.classList.add('success');
    }
  };

  // Enhanced item change with validation
  const handleItemChangeWithValidation = (index, field, value) => {
    handleItemChange(index, field, value);
    
    // Add visual feedback for calculations
    if (field === 'qty' || field === 'rate' || field === 'gst') {
      const row = document.querySelector(`tr:nth-child(${index + 2})`);
      if (row) {
        row.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
        setTimeout(() => {
          row.style.backgroundColor = '';
        }, 1000);
      }
    }
  };

  // Show success toast
  const showSuccessToast = () => {
    setShowSuccess(true);
    if (successToastRef.current) {
      const toast = new window.bootstrap.Toast(successToastRef.current);
      toast.show();
    }
  };

// inside your button handler:
const onGenerate = () => {
  generateInvoicePDF(invoiceDetails, {
    gstType: {gstType}, // or "intra" for CGST+SGST
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


  return (
    <div className="container-fluid py-4">
      {/* Success Toast */}
      <div className="toast-container position-fixed top-0 end-0 p-3">
        <div ref={successToastRef} className="toast" role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-header bg-success text-white">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong className="me-auto">Success!</strong>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div className="toast-body">
            PDF generated successfully!
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white">
              <div className="d-flex align-items-center">
                <img 
                  src="/asset/image.png" 
                  alt="Company Logo" 
                  className="me-3" 
                  style={{ height: '40px', width: 'auto' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <i className="bi bi-receipt me-2"></i>
                <h2 className="mb-0">Tax Invoice Generator</h2>
              </div>
            </div>
            
            <div className="card-body p-4">
              <form ref={formRef}>
                {/* Invoice Header Section */}
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
                    <input 
                      type="text" 
                      className="form-control" 
                      id="invoiceNo"
                      name="invoiceNo" 
                      value={invoiceDetails.invoiceNo} 
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      required 
                      placeholder="Enter invoice number"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="date" className="form-label fw-bold">
                      <i className="bi bi-calendar me-1"></i>Date
                    </label>
                    <input 
                      type="date" 
                      className="form-control" 
                      id="date"
                      name="date" 
                      value={invoiceDetails.date} 
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      required 
                    />
                  </div>
                </div>

                {/* Customer Details Section */}
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
                    <input 
                      type="text" 
                      className="form-control" 
                      id="customerName"
                      name="customerName" 
                      value={invoiceDetails.customerName} 
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      required 
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="partyGstin" className="form-label fw-bold">
                      <i className="bi bi-building me-1"></i>Party GSTIN
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="partyGstin"
                      name="partyGstin" 
                      value={invoiceDetails.partyGstin} 
                      onChange={handleInputChange} 
                      placeholder="Enter GSTIN number"
                    />
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <label htmlFor="customerAddress" className="form-label fw-bold">
                      <i className="bi bi-geo-alt me-1"></i>Customer Address
                    </label>
                    <textarea 
                      className="form-control" 
                      id="customerAddress"
                      name="customerAddress" 
                      value={invoiceDetails.customerAddress} 
                      onChange={handleInputChange} 
                      rows="3"
                      placeholder="Enter customer address"
                    />
                  </div>
        </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label htmlFor="poNo" className="form-label fw-bold">
                      <i className="bi bi-file-earmark me-1"></i>P.O. Number
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="poNo"
                      name="poNo" 
                      value={invoiceDetails.poNo} 
                      onChange={handleInputChange} 
                      placeholder="Enter PO number"
                    />
        </div>
                  <div className="col-md-6">
                    <label htmlFor="dcNo" className="form-label fw-bold">
                      <i className="bi bi-truck me-1"></i>D.C. Number
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="dcNo"
                      name="dcNo" 
                      value={invoiceDetails.dcNo} 
                      onChange={handleInputChange} 
                      placeholder="Enter DC number"
                    />
        </div>
        </div>

                {/* Items Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="text-primary border-bottom pb-2">
                        <i className="bi bi-list-ul me-2"></i>Item Details
                      </h4>
                      <button 
                        type="button" 
                        className="btn btn-success btn-sm"
                        onClick={addItemRow}
                      >
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
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              value={item.description} 
                              onChange={(e) => handleItemChangeWithValidation(index, "description", e.target.value)} 
                              placeholder="Item description"
                            />
                          </td>
                          <td>
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              value={item.hsnCode} 
                              onChange={(e) => handleItemChangeWithValidation(index, "hsnCode", e.target.value)} 
                              placeholder="HSN Code"
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="form-control form-control-sm text-end" 
                              value={item.rate} 
                              onChange={(e) => handleItemChangeWithValidation(index, "rate", e.target.value)} 
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="form-control form-control-sm text-center" 
                              value={item.qty} 
                              onChange={(e) => handleItemChangeWithValidation(index, "qty", e.target.value)} 
                              min="0"
                              step="1"
                            />
                          </td>
                          <td>
                            <select 
                              className="form-select form-select-sm" 
                              value={item.gst} 
                              onChange={(e) => handleItemChangeWithValidation(index, "gst", e.target.value)}
                            >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </td>
                          <td>
                            <input 
                              type="number" 
                              className="form-control form-control-sm text-end bg-light" 
                              value={(parseFloat(item.amount) || 0).toFixed(2)} 
                              readOnly 
                            />
                          </td>
                          <td className="text-center">
                            <button 
                              type="button" 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeItemRow(index)}
                              disabled={invoiceDetails.items.length === 1}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
              </tr>
            ))}
          </tbody>
        </table>
                </div>

                <div className="col-md-6">
  <label htmlFor="gstType" className="form-label fw-bold">
    <i className="bi bi-percent me-1"></i>Tax Type
  </label>
  <select
    id="gstType"
    className="form-select"
    value={gstType}
    onChange={(e) => setGstType(e.target.value)}
  >
    <option value="intra">CGST + SGST (Intra-state)</option>
    <option value="igst">IGST (Inter-state)</option>
  </select>
</div>
<br></br>

                {/* Total and Actions */}
                <div className="row">
                  <div className="col-md-8">
                    <div className="alert alert-info d-flex align-items-center">
                      <i className="bi bi-calculator me-2"></i>
                      <strong>Total Amount: ₹ {calculateTotal()}</strong>
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <button 
                      type="button" 
                      className="btn btn-primary btn-lg"
                      onClick={onGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-file-earmark-pdf me-2"></i>
                          Generate PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
      </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxInvoiceForm;