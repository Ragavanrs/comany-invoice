import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./invoice.css"; // optional external styling

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

  const generatePDF = () => {
    // Validate form before generating PDF
    if (!validateForm()) {
      // Scroll to first error field
      const firstError = document.querySelector('.error');
      if (firstError) {
        scrollToElement(firstError.id);
      }
      return;
    }
    
    setIsGenerating(true);
    
    // Add a small delay for better UX
    setTimeout(() => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // Traditional invoice layout - clean and simple
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      // Add logo image
      try {
        // Add logo at top left (adjust size as needed)
        doc.addImage('/asset/image.png', 'PNG', 10, 5, 30, 20);
      } catch (error) {
        console.log('Logo not found, continuing without logo');
      }
      
      // GSTIN at top left (moved down to accommodate logo and prevent overlap)
      doc.text("GSTIN: 33AKNPR3914K1ZT", 10, 35);
      
      // TAX INVOICE title centered
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("TAX INVOICE", 105, 15, { align: 'center' });
      
      // Company name in blue
      doc.setTextColor(0, 0, 139); // Dark blue
      doc.setFontSize(18);
      doc.text("SURYA POWER", 105, 25, { align: 'center' });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Company services
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("DG Set Hiring, Old DG Set Buying, Selling & Servicing", 105, 32, { align: 'center' });
      
      // Company address
      doc.setFontSize(9);
      doc.text("No.1/11, G.N.T Road, Padiyanallur Redhills, Chennai,", 105, 37, { align: 'center' });
      doc.text("Thiruvallur, Tamil Nadu - 600 052", 105, 41, { align: 'center' });
      
      // Contact info at top right with proper alignment
      doc.setFontSize(9);
      doc.text("Mob: 9790987190", 150, 15);
      doc.text("         9840841887", 150, 20); // Added spaces for alignment
      
      // Horizontal line separator
      doc.setDrawColor(0, 0, 139); // Dark blue
      doc.setLineWidth(1);
      doc.line(10, 45, 200, 45);

      // Traditional invoice details layout
      const details = invoiceDetails;
      
      // Invoice details on left side
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Invoice No. ${details.invoiceNo}`, 10, 55);
      
      // Customer details with proper spacing for multi-line addresses
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("To", 10, 60);
      doc.text(`${details.customerName}`, 10, 65);
      
      // Handle multi-line address with proper spacing
      const addressLines = details.customerAddress.split('\n');
      let currentY = 70;
      addressLines.forEach(line => {
        if (line.trim()) {
          doc.text(line.trim(), 10, currentY);
          currentY += 5; // 5mm spacing between address lines
        }
      });
      
      // Add extra spacing before GSTIN
      currentY += 2;
      doc.text(`Party GSTIN: ${details.partyGstin}`, 10, currentY);
      
      // Date and other details on right side
    doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Date: ${details.date}`, 150, 55);
      doc.text(`P.O. No: ${details.poNo}`, 150, 60);
      doc.text(`D.C. No: ${details.dcNo}`, 150, 65);

      // Traditional table layout with proper spacing (moved down to prevent GST overlap)
      const startY = 90;
      
      // Table header with dark blue background
      doc.setFillColor(0, 0, 139); // Dark blue
      doc.rect(10, startY, 190, 8, 'F');
      
      // Table header text in white
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("S.No", 12, startY + 5);
      doc.text("DESCRIPTION", 25, startY + 5);
      doc.text("HSN Code", 70, startY + 5);
      doc.text("RATE", 90, startY + 5);
      doc.text("QTY", 115, startY + 5);
      doc.text("GST %", 130, startY + 5);
      doc.text("Amount Rs.", 150, startY + 5);
      doc.text("P.", 175, startY + 5);
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Traditional table with proper spacing to prevent overlap
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: startY + 10, // Increased spacing to prevent overlap
          head: [["S.No", "DESCRIPTION", "HSN Code", "RATE", "QTY", "GST %", "Amount Rs.", "P."]],
          body: details.items.map((item, index) => [
            index + 1,
            item.description,
            item.hsnCode,
            (parseFloat(item.rate) || 0).toFixed(2),
            Math.floor(parseFloat(item.qty) || 0), // Integer quantity
            parseFloat(item.gst) + "%",
            (parseFloat(item.amount) || 0).toFixed(2),
            "" // Empty for paise column
          ]),
          styles: { 
            fontSize: 8, // Reduced font size for better fit
            cellPadding: 2, // Reduced padding to fit more content
            lineColor: [0, 0, 139], // Dark blue lines
            lineWidth: 0.5,
            font: 'helvetica',
            textColor: [0, 0, 0],
            halign: 'left',
            overflow: 'linebreak', // Enable text wrapping
            cellWidth: 'wrap', // Allow cells to wrap content
            valign: 'top' // Align text to top of cell
          },
          theme: "grid",
          headStyles: { 
            fillColor: [0, 0, 139], // Dark blue header
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8, // Reduced font size to match body
            cellPadding: 2
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 40, halign: 'left', overflow: 'linebreak' }, // Further reduced width for description
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 18, halign: 'right' }, // Rate column
            4: { cellWidth: 12, halign: 'center' }, // QTY column
            5: { cellWidth: 12, halign: 'center' }, // GST column
            6: { cellWidth: 20, halign: 'right' }, // Amount column
            7: { cellWidth: 8, halign: 'center' }, // P column
          },
          margin: { left: 10, right: 10, top: 5, bottom: 5 }
        });
      } else {
        // Traditional manual table with proper spacing to prevent overlap
        let currentY = startY + 12; // Increased spacing to prevent overlap
        
        // Table rows with traditional styling
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        details.items.forEach((item, index) => {
          // Simple grid lines with proper spacing
          const descLines = doc.splitTextToSize(item.description || "", 35);
          const rowHeight = Math.max(7, descLines.length * 4 + 3); // Dynamic height based on description lines
          
          doc.setDrawColor(0, 0, 139); // Dark blue
          doc.setLineWidth(0.5);
          doc.rect(10, currentY - 4, 190, rowHeight);
          
          // Row content with proper alignment within cell boundaries
          doc.text((index + 1).toString(), 12, currentY);
          
          // Handle multi-line descriptions properly
          descLines.forEach((line, lineIndex) => {
            doc.text(line, 25, currentY + (lineIndex * 4));
          });
          
          doc.text(item.hsnCode, 70, currentY);
          doc.text((parseFloat(item.rate) || 0).toFixed(2), 90, currentY);
          doc.text(Math.floor(parseFloat(item.qty) || 0).toString(), 115, currentY);
          doc.text(parseFloat(item.gst) + "%", 130, currentY);
          doc.text((parseFloat(item.amount) || 0).toFixed(2), 150, currentY);
          currentY += rowHeight;
        });
      }
      
      // Amount in words section with proper calculation
      const wordsY = startY + (details.items.length * 7) + 20; // Adjusted for new row height
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Amount in words:", 10, wordsY);
      
      // Ensure proper number conversion and handle edge cases
      const totalAmount = parseFloat(calculateTotal()) || 0;
      const integerAmount = Math.floor(totalAmount);
      const amountInWords = numberToWords(integerAmount);
      doc.text("Rupees " + amountInWords + " only", 10, wordsY + 5);

      // Traditional total section on right side
      let totalY;
      if (typeof doc.autoTable === 'function' && doc.lastAutoTable) {
        totalY = doc.lastAutoTable.finalY + 8;
      } else {
        totalY = startY + (details.items.length * 6) + 15;
      }
      
      // Total section with simple grid
      const totalStartY = totalY + 10;
      doc.setDrawColor(0, 0, 139); // Dark blue
      doc.setLineWidth(0.5);
      
      // Total grid
      doc.rect(120, totalStartY, 80, 25);
      doc.line(120, totalStartY + 5, 200, totalStartY + 5);
      doc.line(120, totalStartY + 10, 200, totalStartY + 10);
      doc.line(120, totalStartY + 15, 200, totalStartY + 15);
      doc.line(120, totalStartY + 20, 200, totalStartY + 20);
      
      // Total labels and values
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("TOTAL", 125, totalStartY + 3);
      doc.text("SGST %", 125, totalStartY + 8);
      doc.text("CGST %", 125, totalStartY + 13);
      doc.text("IGST 18 %", 125, totalStartY + 18);
      doc.text("GRAND TOTAL", 125, totalStartY + 23);
      
      // Total values
      doc.text(calculateTotal(), 190, totalStartY + 3, { align: 'right' });
      doc.text("", 190, totalStartY + 8, { align: 'right' });
      doc.text("", 190, totalStartY + 13, { align: 'right' });
      doc.text("", 190, totalStartY + 18, { align: 'right' });
      doc.text(calculateTotal(), 190, totalStartY + 23, { align: 'right' });

      // Traditional bank information section
      const bankStart = totalStartY + 30;
      
      // Bank details on left side
    doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("TAMILNAD MERCANTILE BANK", 10, bankStart);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("NAME: SURYA POWER", 10, bankStart + 5);
    doc.text("AC.NO: 22815005800163", 10, bankStart + 10);
    doc.text("BRANCH: NARAVARIKUPPAM BRANCH", 10, bankStart + 15);
    doc.text("IFSC CODE: TMBL0000228", 10, bankStart + 20);

      // Terms and conditions
      const termsY = bankStart + 25;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("1. Interest 24% p.a. will be charged on all invoices if not paid within due date.", 10, termsY);
      doc.text("2. All Payment to be made only by crossed cheques draw in own favour.", 10, termsY + 5);
      doc.text("3. PAYMENT WITHIN .............. DAYS", 10, termsY + 10);

      // Signature section on right side
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("For SURYA POWER", 150, termsY + 5);
      
      // Signature line
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(150, termsY + 10, 190, termsY + 10);

    doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Proprietor", 150, termsY + 15);

    doc.save("TaxInvoice.pdf");
    setIsGenerating(false);
    showSuccessToast();
    }, 500);
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
                      onClick={generatePDF}
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