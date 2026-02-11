import jsPDF from "jspdf";
import image from "../../image.png";

/**
 * Generate Letter Pad PDF
 * @param {Object} letter - Letter details
 * @param {Object} company - Company information
 */
export function generateLetterPadPDF(letter, company = {}) {
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

  // Reference and Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Ref: ${letter.refNo || 'N/A'}`, margin, yPos);
  doc.text(`Date: ${formatDate(letter.date)}`, pageWidth - margin - 50, yPos);
  yPos += 10;

  // Recipient Details
  doc.setFont("helvetica", "bold");
  doc.text("To,", margin, yPos);
  yPos += 5;

  doc.setFont("helvetica", "normal");
  doc.text(letter.recipientName || '', margin, yPos);
  yPos += 5;

  if (letter.recipientAddress) {
    const addressLines = doc.splitTextToSize(letter.recipientAddress, pageWidth - 2 * margin);
    doc.text(addressLines, margin, yPos);
    yPos += addressLines.length * 5;
  }
  yPos += 5;

  // Subject
  doc.setFont("helvetica", "bold");
  doc.text("Subject:", margin, yPos);
  yPos += 5;

  doc.setFont("helvetica", "normal");
  const subjectLines = doc.splitTextToSize(letter.subject || '', pageWidth - 2 * margin);
  doc.text(subjectLines, margin, yPos);
  yPos += subjectLines.length * 5 + 5;

  // Salutation based on template
  const salutation = letter.template === 'formal' ? 'Dear Sir/Madam,' : 'Dear ' + (letter.recipientName || 'Sir/Madam') + ',';
  doc.text(salutation, margin, yPos);
  yPos += 8;

  // Body
  if (letter.body) {
    const bodyLines = doc.splitTextToSize(letter.body, pageWidth - 2 * margin);
    bodyLines.forEach((line) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });
  }
  yPos += 10;

  // Closing
  const closing = letter.template === 'formal' ? 'Yours faithfully,' : 'Yours sincerely,';
  doc.text(closing, margin, yPos);
  yPos += 15;

  // Signature
  if (letter.senderName) {
    doc.setFont("helvetica", "bold");
    doc.text(letter.senderName, margin, yPos);
    yPos += 5;
  }

  if (letter.senderDesignation) {
    doc.setFont("helvetica", "italic");
    doc.text(letter.senderDesignation, margin, yPos);
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(128, 128, 128);
  const footer = "This is a computer-generated letter";
  doc.text(footer, pageWidth / 2, pageHeight - 10, { align: "center" });

  // Save PDF
  const filename = `Letter_${letter.refNo || 'draft'}_${Date.now()}.pdf`;
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
