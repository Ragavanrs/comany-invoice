import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import image from "../../image.png";

/**
 * Generate Delivery Challan PDF
 * @param {Object} challan - Challan details
 * @param {Object} company - Company information
 */
export function generateChallanPDF(challan, company = {}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Default company info
  const companyInfo = {
    name: company.name || "SURYA POWER",
    tagline: company.tagline || "DG Set Hiring, Old DG Set Buying, Selling & Servicing",
    address: company.address || "No.1/11, G.N.T Road, Padiyanallur Redhills, Chennai, Thiruvallur, Tamil Nadu - 600 052",
    gstin: company.gstin || "33AKNPR3914K1ZT",
    contacts: company.contacts || "Mob: 9790987190 / 9840841887",
  };

  // Header with logo and company details
  try {
    const logoW = 30, logoH = 18;
    doc.addImage(image, 'PNG', margin, yPos, logoW, logoH);
    yPos += 5;
  } catch (err) {
    console.error('Logo loading error:', err);
  }

  // Company Name
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(companyInfo.name, margin + 35, yPos);
  yPos += 6;

  // Tagline
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(companyInfo.tagline, margin + 35, yPos);
  yPos += 5;

  // Address
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const addressLines = doc.splitTextToSize(companyInfo.address, pageWidth - 2 * margin - 35);
  doc.text(addressLines, margin + 35, yPos);
  yPos += addressLines.length * 4;

  // Contact and GSTIN
  doc.text(`${companyInfo.contacts} | GSTIN: ${companyInfo.gstin}`, margin + 35, yPos);
  yPos += 8;

  // Horizontal line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Document Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DELIVERY CHALLAN", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  // Challan No and Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Challan No: ${challan.challanNo || 'N/A'}`, margin, yPos);
  doc.text(`Date: ${formatDate(challan.date)}`, pageWidth - margin - 50, yPos);
  yPos += 10;

  // Supplier and Recipient Details in two columns
  const colWidth = (pageWidth - 2 * margin - 5) / 2;
  const col1X = margin;
  const col2X = margin + colWidth + 5;

  // Supplier Details (Left Column)
  doc.setFont("helvetica", "bold");
  doc.text("From:", col1X, yPos);
  yPos += 5;

  doc.setFont("helvetica", "normal");
  doc.text(challan.supplierName || '', col1X, yPos);
  yPos += 5;

  if (challan.supplierAddress) {
    const supplierLines = doc.splitTextToSize(challan.supplierAddress, colWidth);
    doc.text(supplierLines, col1X, yPos);
    const supplierHeight = supplierLines.length * 5;
    
    // Recipient Details (Right Column) - start at same Y position
    const recipientStartY = yPos - 10;
    doc.setFont("helvetica", "bold");
    doc.text("To:", col2X, recipientStartY);
    
    doc.setFont("helvetica", "normal");
    doc.text(challan.recipientName || '', col2X, recipientStartY + 5);
    
    if (challan.recipientAddress) {
      const recipientLines = doc.splitTextToSize(challan.recipientAddress, colWidth);
      doc.text(recipientLines, col2X, recipientStartY + 10);
      const recipientHeight = recipientLines.length * 5;
      yPos += Math.max(supplierHeight, recipientHeight);
    } else {
      yPos += supplierHeight;
    }
  } else {
    // No supplier address, just add recipient
    const recipientStartY = yPos - 10;
    doc.setFont("helvetica", "bold");
    doc.text("To:", col2X, recipientStartY);
    
    doc.setFont("helvetica", "normal");
    doc.text(challan.recipientName || '', col2X, recipientStartY + 5);
    
    if (challan.recipientAddress) {
      const recipientLines = doc.splitTextToSize(challan.recipientAddress, colWidth);
      doc.text(recipientLines, col2X, recipientStartY + 10);
      yPos += recipientLines.length * 5;
    }
  }
  
  yPos += 10;

  // Items Table
  const itemsTableData = challan.items.map((item, index) => [
    index + 1,
    item.description || '',
    item.quantity || 0,
    item.unit || '',
    item.remarks || '',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['S.No', 'Description', 'Quantity', 'Unit', 'Remarks']],
    body: itemsTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 0, 139],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'left', cellWidth: 60 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'left', cellWidth: 'auto' },
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    margin: { left: margin, right: margin },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Transport Details
  if (challan.transportDetails && (challan.transportDetails.vehicleNo || challan.transportDetails.driverName)) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Transport Details:", margin, yPos);
    yPos += 5;

    doc.setFont("helvetica", "normal");
    if (challan.transportDetails.vehicleNo) {
      doc.text(`Vehicle No: ${challan.transportDetails.vehicleNo}`, margin, yPos);
      yPos += 5;
    }
    if (challan.transportDetails.driverName) {
      doc.text(`Driver Name: ${challan.transportDetails.driverName}`, margin, yPos);
      yPos += 5;
    }
    yPos += 5;
  }

  // Terms & Conditions
  if (challan.terms) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions:", margin, yPos);
    yPos += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const termsLines = doc.splitTextToSize(challan.terms, pageWidth - 2 * margin);
    termsLines.forEach((line) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });
    yPos += 10;
  }

  // Signature Section
  yPos = Math.max(yPos, pageHeight - 50);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Supplier Signature (Left)
  doc.text("For " + (challan.supplierName || companyInfo.name), margin, yPos);
  doc.line(margin, yPos + 15, margin + 50, yPos + 15);
  doc.text("Authorized Signatory", margin, yPos + 20);
  
  // Recipient Signature (Right)
  const rightX = pageWidth - margin - 50;
  doc.text("Receiver's Signature", rightX, yPos);
  doc.line(rightX, yPos + 15, rightX + 50, yPos + 15);
  doc.text("Name & Stamp", rightX, yPos + 20);

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(128, 128, 128);
  const footer = "This is a computer-generated delivery challan";
  doc.text(footer, pageWidth / 2, pageHeight - 10, { align: "center" });

  // Save PDF
  const filename = `Challan_${challan.challanNo || 'draft'}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Format date to readable format
 * @param {string} dateStr - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-IN', options);
}
