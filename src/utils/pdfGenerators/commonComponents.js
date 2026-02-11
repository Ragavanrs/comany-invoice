/**
 * Common PDF Components
 * Reusable header, footer, and utility functions for PDF generation
 */

import image from "../../image.png";
import {
  PDF_COLORS,
  PDF_FONTS,
  PDF_MARGINS,
  LOGO_DIMENSIONS,
  DEFAULT_COMPANY_INFO,
} from "./constants";

/**
 * Creates a standard header for invoice documents
 * 
 * @param {jsPDF} doc - The jsPDF document instance
 * @param {Object} config - Configuration options
 * @param {string} config.documentTitle - Title of the document (e.g., "TAX INVOICE")
 * @param {Object} config.company - Company information
 * @returns {number} The Y position after the header
 * 
 * @example
 * const headerEndY = createInvoiceHeader(doc, {
 *   documentTitle: "TAX INVOICE",
 *   company: { name: "SURYA POWER", ... }
 * });
 */
export function createInvoiceHeader(doc, { documentTitle = "TAX INVOICE", company = {} }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = PDF_MARGINS.page;
  
  // Merge with defaults
  const companyInfo = { ...DEFAULT_COMPANY_INFO, ...company };

  // Logo (top-left)
  try {
    doc.addImage(
      image,
      "PNG",
      margin,
      8,
      LOGO_DIMENSIONS.width,
      LOGO_DIMENSIONS.height
    );
  } catch (err) {
    console.error("Logo loading error:", err);
  }

  const afterLogoY = 8 + LOGO_DIMENSIONS.height + 4;
  
  // GSTIN below logo
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(PDF_FONTS.small);
  doc.text(`GSTIN: ${companyInfo.gstin}`, margin, afterLogoY);

  // Document title (centered, top)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(PDF_FONTS.header);
  doc.text(documentTitle, pageWidth / 2, 15, { align: "center" });

  // Company name (centered, prominent)
  doc.setFontSize(PDF_FONTS.title);
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text(companyInfo.name, pageWidth / 2, 24, { align: "center" });

  // Tagline (centered)
  doc.setTextColor(...PDF_COLORS.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(PDF_FONTS.small);
  doc.text(companyInfo.tagline, pageWidth / 2, 30, { align: "center" });
  
  // Address (centered)
  doc.text(companyInfo.address, pageWidth / 2, 35, { align: "center" });
  
  // Contacts (right-aligned)
  doc.text(companyInfo.contacts, pageWidth - margin, 15, { align: "right" });

  // Divider line
  doc.setDrawColor(...PDF_COLORS.primary);
  doc.setLineWidth(0.8);
  doc.line(margin, 40, pageWidth - margin, 40);

  return 40; // Return Y position after header
}

/**
 * Creates a standard header for delivery challan documents
 * 
 * @param {jsPDF} doc - The jsPDF document instance
 * @param {Object} config - Configuration options
 * @param {string} config.challanNo - Challan number
 * @param {string} config.date - Challan date
 * @param {Object} config.company - Company information
 * @returns {number} The Y position after the header
 * 
 * @example
 * const headerEndY = createChallanHeader(doc, {
 *   challanNo: "DC001",
 *   date: "2024-01-01",
 *   company: { name: "SURYA POWER", ... }
 * });
 */
export function createChallanHeader(doc, { challanNo = "", date = "", company = {} }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = PDF_MARGINS.page;
  let yPos = 8;
  
  // Merge with defaults
  const companyInfo = { ...DEFAULT_COMPANY_INFO, ...company };

  // Logo (top-left)
  try {
    doc.addImage(
      image,
      "PNG",
      margin,
      yPos,
      LOGO_DIMENSIONS.width,
      LOGO_DIMENSIONS.height
    );
  } catch (err) {
    console.error("Logo loading error:", err);
  }

  // Company name (next to logo)
  doc.setFontSize(PDF_FONTS.header);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text(companyInfo.name, margin + LOGO_DIMENSIONS.width + 5, yPos + 6);
  yPos += 6;

  // Tagline
  doc.setFontSize(PDF_FONTS.small);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...PDF_COLORS.text);
  doc.text(companyInfo.tagline, margin + LOGO_DIMENSIONS.width + 5, yPos + 5);
  yPos += 5;

  // Address
  doc.setFontSize(PDF_FONTS.tiny);
  doc.setFont("helvetica", "normal");
  const addressLines = doc.splitTextToSize(
    companyInfo.address,
    pageWidth - 2 * margin - LOGO_DIMENSIONS.width - 5
  );
  doc.text(addressLines, margin + LOGO_DIMENSIONS.width + 5, yPos + 5);
  yPos += addressLines.length * 4 + 5;

  // Contact and GSTIN
  doc.text(
    `${companyInfo.contacts} | GSTIN: ${companyInfo.gstin}`,
    margin + LOGO_DIMENSIONS.width + 5,
    yPos
  );
  yPos += 8;

  // Horizontal line
  doc.setDrawColor(...PDF_COLORS.text);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Document title (centered)
  doc.setFontSize(PDF_FONTS.subheader);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text("DELIVERY CHALLAN", pageWidth / 2, yPos, { align: "center" });
  yPos += 8;

  // Challan No and Date
  doc.setFontSize(PDF_FONTS.body);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_COLORS.text);
  doc.text(`Challan No: ${challanNo}`, margin, yPos);
  doc.text(`Date: ${date}`, pageWidth - margin - 50, yPos);
  yPos += 8;

  return yPos; // Return Y position after header
}

/**
 * Creates a standard footer with page number
 * 
 * @param {jsPDF} doc - The jsPDF document instance
 * @param {Object} config - Configuration options
 * @param {string} config.text - Optional footer text
 * @param {boolean} config.showPageNumber - Whether to show page number (default: true)
 * 
 * @example
 * createFooter(doc, { text: "This is a computer-generated document" });
 */
export function createFooter(doc, { text = "", showPageNumber = true } = {}) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_MARGINS.page;

  doc.setFontSize(PDF_FONTS.tiny);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_COLORS.text);

  // Page number (right-aligned)
  if (showPageNumber) {
    doc.text(
      `Page ${doc.internal.getNumberOfPages()}`,
      pageWidth - margin,
      pageHeight - 5,
      { align: "right" }
    );
  }

  // Optional footer text (centered)
  if (text) {
    doc.setTextColor(...PDF_COLORS.secondary);
    doc.text(text, pageWidth / 2, pageHeight - 10, { align: "center" });
  }
}

/**
 * Format money value with 2 decimal places
 * @param {number} value - The value to format
 * @returns {string} Formatted money string
 */
export function toMoney(value) {
  return (Number(value) || 0).toFixed(2);
}

/**
 * Format date to readable format
 * @param {string} dateStr - Date string
 * @returns {string} Formatted date
 */
export function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateStr; // Return original string if invalid
    }
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-IN", options);
  } catch (err) {
    return dateStr;
  }
}

/**
 * Simple Indian system number to words (integer only)
 * Converts a number to its word representation in Indian English
 * 
 * @param {number} num - The number to convert
 * @returns {string} Word representation of the number
 * 
 * @example
 * numberToWordsIndian(12345) // "twelve thousand three hundred forty five"
 * numberToWordsIndian(1000000) // "ten lakh"
 */
export function numberToWordsIndian(num) {
  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];

  const n = Math.floor(Number(num) || 0);
  if (n === 0) return "zero";

  const chunk = (x) => {
    let r = "";
    if (x >= 100) {
      r += ones[Math.floor(x / 100)] + " hundred ";
      x %= 100;
    }
    if (x >= 20) {
      r += tens[Math.floor(x / 10)] + " ";
      if (x % 10) r += ones[x % 10];
    } else if (x >= 10) {
      r += teens[x - 10];
    } else if (x > 0) {
      r += ones[x];
    }
    return r.trim();
  };

  let res = "";
  const crore = Math.floor(n / 1e7);
  const lakh = Math.floor((n % 1e7) / 1e5);
  const thousand = Math.floor((n % 1e5) / 1e3);
  const hundred = n % 1e3;

  if (crore) res += chunk(crore) + " crore ";
  if (lakh) res += chunk(lakh) + " lakh ";
  if (thousand) res += chunk(thousand) + " thousand ";
  if (hundred) res += chunk(hundred);

  return res.trim();
}

/**
 * Calculate GST breakdown based on type
 * 
 * @param {number} amount - Base amount
 * @param {number} gstRate - GST rate percentage (e.g., 18)
 * @param {string} gstType - Type of GST: "igst" or "cgst_sgst"
 * @returns {Object} Object containing igst, cgst, and sgst amounts
 * 
 * @example
 * gstBreakup(1000, 18, "igst") // { igst: 180, cgst: 0, sgst: 0 }
 * gstBreakup(1000, 18, "cgst_sgst") // { igst: 0, cgst: 90, sgst: 90 }
 */
export function gstBreakup(amount, gstRate, gstType) {
  const base = Number(amount) || 0;
  const rate = Number(gstRate) || 0;

  if (gstType === "igst") {
    return { igst: (base * rate) / 100, cgst: 0, sgst: 0 };
  }

  const half = (base * (rate / 2)) / 100;
  return { igst: 0, cgst: half, sgst: half };
}

/**
 * Check if there's enough space on current page for content
 * If not, add a new page with header/footer
 * 
 * @param {jsPDF} doc - The jsPDF document instance
 * @param {number} currentY - Current Y position
 * @param {number} requiredSpace - Required space in mm
 * @param {Function} drawHeader - Function to draw header
 * @param {Function} drawFooter - Function to draw footer
 * @returns {number} New Y position to start content
 * 
 * @example
 * yPos = ensureSpace(doc, yPos, 80, drawHeader, drawFooter);
 */
export function ensureSpace(doc, currentY, requiredSpace, drawHeader, drawFooter) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const remainingSpace = pageHeight - currentY - PDF_MARGINS.footerBottom;

  if (remainingSpace < requiredSpace) {
    doc.addPage();
    drawHeader();
    drawFooter();
    return PDF_MARGINS.headerTop + 5; // Start after header
  }

  return currentY;
}
