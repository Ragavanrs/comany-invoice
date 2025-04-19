import jsPDF from "jspdf";
import "jspdf-autotable";

const calculateGSTBreakup = (baseAmount, gstRate, gstType) => {
  if (gstType === 'igst') {
    return { igst: (baseAmount * gstRate) / 100, cgst: 0, sgst: 0 };
  } else {
    const halfGstRate = gstRate / 2;
    return {
      igst: 0,
      cgst: (baseAmount * halfGstRate) / 100,
      sgst: (baseAmount * halfGstRate) / 100,
    };
  }
};

export const generatePDF = (invoiceData, gstType) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  const centerText = (text, yPos, fontSize = 12, bold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, yPos);
  };

  // Header: Company Info
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, pageWidth - 2 * margin, 25, 'F');

  centerText('SURYA POWER', y + 8, 18, true);
  centerText('No. 1/11 , GNT Road, Balaji Street, Padiyanallur, Chennai - 600052', y + 14, 11);
  centerText('GSTIN: 33AKPPR3673B1ZW | Mobile: 97909 97190 | Email: suryapower1970@gmail.com', y + 19, 10);
  y += 30;

  // Invoice Title
  doc.setFillColor(230, 230, 250);
  doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F');
  centerText('TAX INVOICE', y + 7, 14, true);
  y += 15;

  // Invoice Details (Invoice No & Date)
  const { invoiceNo, date, customerName, customerAddress, partyGstin } = invoiceData;
  const invoiceDate = date.format('DD-MM-YYYY');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${invoiceNo}`, margin, y);
  doc.text(`Date: ${invoiceDate}`, pageWidth - margin - 50, y);
  y += 7;

  // Bill To (No border)
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 5;

  const customerAddressLines = doc.splitTextToSize(customerAddress || '', pageWidth - margin * 2 - 10);
  doc.text(customerName || '', margin, y);
  y += 5;

  customerAddressLines.forEach(line => {
    doc.text(line, margin, y);
    y += 5;
  });

  if (partyGstin) {
    doc.text(`GSTIN: ${partyGstin}`, margin, y);
    y += 5;
  }
  y += 5;

  // Item Table
  const tableColumn = ['S.No', 'Description', 'HSN/SAC', 'Qty', 'Rate', 'Amount'];
  const tableRows = [];

  invoiceData.items.forEach((item, index) => {
    const amount = item.qty * item.rate;
    tableRows.push([
      index + 1,
      doc.splitTextToSize(item.description, 50),
      item.hsn || '',
      item.qty,
      item.rate.toFixed(2),
      amount.toFixed(2),
    ]);
  });

  doc.autoTable({
    startY: y,
    head: [tableColumn],
    body: tableRows,
    styles: {
      fontSize: 9,
      cellPadding: 2,
      overflow: 'linebreak',
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [220, 230, 241],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: margin, right: margin },
    theme: 'grid',
  });

  y = doc.lastAutoTable.finalY + 10;

  // Totals Section
  const totalAmount = invoiceData.items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const gstBreakup = calculateGSTBreakup(totalAmount, 18, gstType);
  const totalGST = gstBreakup.igst + gstBreakup.cgst + gstBreakup.sgst;
  const finalAmount = totalAmount + totalGST;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  doc.text(`Subtotal: ₹ ${totalAmount.toFixed(2)}`, pageWidth - margin - 70, y);
  y += 5;

  if (gstType === 'igst') {
    doc.text(`IGST (18%): ₹ ${gstBreakup.igst.toFixed(2)}`, pageWidth - margin - 70, y);
    y += 5;
  } else {
    doc.text(`CGST (9%): ₹ ${gstBreakup.cgst.toFixed(2)}`, pageWidth - margin - 70, y);
    y += 5;
    doc.text(`SGST (9%): ₹ ${gstBreakup.sgst.toFixed(2)}`, pageWidth - margin - 70, y);
    y += 5;
  }

  doc.setFont('helvetica', 'bold');
  doc.text(`Grand Total: ₹ ${finalAmount.toFixed(2)}`, pageWidth - margin - 70, y);
  doc.setFont('helvetica', 'normal');
  y += 10;

  // Declaration
  const declaration = 'Declaration: We hereby certify that the goods/services mentioned in this invoice are correct and have been supplied in accordance with the purchase order.';
  const declarationLines = doc.splitTextToSize(declaration, pageWidth - margin * 2 - 10);

  const lineHeight = 5;
  const padding = 5;
  const boxHeight = (declarationLines.length * lineHeight) + padding * 2;

  doc.setDrawColor(220, 220, 220);
  doc.rect(margin, y, pageWidth - margin * 2, boxHeight);
  doc.text(declarationLines, margin + 5, y + 7);

  y += boxHeight + 10;

  // Signature
  doc.setFont('helvetica', 'normal');
  doc.text('For SURYA POWER', pageWidth - margin - 60, y);
  y += 20;
  doc.text('Authorised Signatory', pageWidth - margin - 60, y);

  // Save
  const monthName = date.format('MMMM');
  const year = date.format('YYYY');
  const fileName = `${invoiceNo}_SURYA_POWER_${monthName}_${year}.pdf`;
  doc.save(fileName);
};
