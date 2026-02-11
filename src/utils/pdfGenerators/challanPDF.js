import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  createChallanHeader,
  createFooter,
  formatDate,
  ensureSpace,
} from "./commonComponents";
import { PDF_MARGINS, DEFAULT_COMPANY_INFO } from "./constants";

/**
 * Generate Delivery Challan PDF with multi-page pagination support
 * 
 * @param {Object} challan - Challan details
 * @param {string} challan.challanNo - Challan number
 * @param {string} challan.date - Challan date
 * @param {string} challan.supplierName - Supplier name
 * @param {string} challan.supplierAddress - Supplier address
 * @param {string} challan.recipientName - Recipient name
 * @param {string} challan.recipientAddress - Recipient address
 * @param {Array} challan.items - Array of items
 * @param {Object} challan.transportDetails - Transport details
 * @param {string} challan.terms - Terms and conditions
 * @param {Object} company - Company information (optional)
 * 
 * @example
 * generateChallanPDF({
 *   challanNo: "DC001",
 *   date: "2024-01-01",
 *   items: [{ description: "Item 1", quantity: 10, unit: "pcs", remarks: "" }],
 *   ...
 * }, { name: "SURYA POWER", ... });
 */
export function generateChallanPDF(challan, company = {}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_MARGINS.page;

  // Merge with defaults
  const companyInfo = { ...DEFAULT_COMPANY_INFO, ...company };

  /**
   * Draws the header for each page
   * This is called for the first page and for each new page created by autoTable
   */
  const drawHeader = () => {
    createChallanHeader(doc, {
      challanNo: challan.challanNo || "N/A",
      date: formatDate(challan.date),
      company: companyInfo,
    });
  };

  /**
   * Draws the footer for each page
   * This is called for the first page and for each new page created by autoTable
   */
  const drawFooter = () => {
    createFooter(doc, {
      text: "This is a computer-generated delivery challan",
      showPageNumber: true,
    });
  };

  // ✅ Draw header/footer for page 1 BEFORE any tables
  drawHeader();
  drawFooter();

  // Starting Y position after header
  let yPos = 55;

  // Supplier and Recipient Details in two columns
  const colWidth = (pageWidth - 2 * margin - 5) / 2;
  const col1X = margin;
  const col2X = margin + colWidth + 5;

  // Supplier Details (Left Column)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("From:", col1X, yPos);
  yPos += 5;

  doc.setFont("helvetica", "normal");
  doc.text(challan.supplierName || "", col1X, yPos);
  yPos += 5;

  let maxHeight = 0;
  if (challan.supplierAddress) {
    const supplierLines = doc.splitTextToSize(challan.supplierAddress, colWidth);
    doc.text(supplierLines, col1X, yPos);
    maxHeight = supplierLines.length * 5;
  }

  // Recipient Details (Right Column) - start at same Y position
  const recipientStartY = yPos - 10;
  doc.setFont("helvetica", "bold");
  doc.text("To:", col2X, recipientStartY);

  doc.setFont("helvetica", "normal");
  doc.text(challan.recipientName || "", col2X, recipientStartY + 5);

  if (challan.recipientAddress) {
    const recipientLines = doc.splitTextToSize(challan.recipientAddress, colWidth);
    doc.text(recipientLines, col2X, recipientStartY + 10);
    maxHeight = Math.max(maxHeight, recipientLines.length * 5);
  }

  yPos += maxHeight + 10;

  // Prepare items table data
  const itemsTableData = challan.items.map((item, index) => [
    index + 1,
    item.description || "",
    item.quantity || 0,
    item.unit || "",
    item.remarks || "",
  ]);

  /**
   * ✅ CRITICAL: Multi-page pagination support using autoTable
   * 
   * The didDrawPage callback is crucial for multi-page documents:
   * - It fires for EVERY page (including the first)
   * - We redraw header/footer on each page
   * - Margins prevent content from overlapping header/footer
   * 
   * The showHead: 'everyPage' ensures table headers repeat on all pages
   * 
   * How pagination works:
   * 1. autoTable automatically detects when content exceeds page height
   * 2. It creates a new page and continues rendering the table
   * 3. didDrawPage fires for the new page, redrawing header/footer
   * 4. Table headers are repeated automatically
   * 5. Process continues until all rows are rendered
   */
  autoTable(doc, {
    startY: yPos,
    head: [["S.No", "Description", "Quantity", "Unit", "Remarks"]],
    body: itemsTableData.length ? itemsTableData : [["", "", "", "", ""]],
    theme: "grid",
    headStyles: {
      fillColor: [0, 0, 139], // Dark blue
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 10,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      1: { halign: "left", cellWidth: 60 },
      2: { halign: "center", cellWidth: 25 },
      3: { halign: "center", cellWidth: 20 },
      4: { halign: "left", cellWidth: "auto" },
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: "top",
    },
    // ✅ KEY FEATURE: Repeat header on every page
    showHead: "everyPage",
    // ✅ KEY FEATURE: Redraw custom header/footer on each new page
    didDrawPage: () => {
      drawHeader();
      drawFooter();
    },
    // ✅ KEY FEATURE: Margins to keep space for header/footer
    margin: {
      top: PDF_MARGINS.headerTop + 15, // Space for header + supplier/recipient info
      bottom: PDF_MARGINS.footerBottom + 5,
      left: margin,
      right: margin,
    },
    // Prevent rows from being split across pages
    rowPageBreak: "auto",
  });

  // Get Y position after items table
  yPos = doc.lastAutoTable.finalY + 10;

  /**
   * Calculate total quantity for all items
   * This provides a summary of total items in the challan
   */
  const totalQuantity = challan.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );

  // Display total quantity
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Quantity: ${totalQuantity}`, pageWidth - margin - 50, yPos, {
    align: "right",
  });
  yPos += 10;

  /**
   * Transport Details Section
   * Only displayed on the last page if transport details are provided
   */
  if (
    challan.transportDetails &&
    (challan.transportDetails.vehicleNo || challan.transportDetails.driverName)
  ) {
    // Ensure enough space for transport details (minimum 30mm)
    yPos = ensureSpace(doc, yPos, 30, drawHeader, drawFooter);

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

  /**
   * Terms & Conditions Section
   * Only displayed on the last page if terms are provided
   */
  if (challan.terms) {
    // Ensure enough space for terms (minimum 40mm)
    yPos = ensureSpace(doc, yPos, 40, drawHeader, drawFooter);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions:", margin, yPos);
    yPos += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const termsLines = doc.splitTextToSize(challan.terms, pageWidth - 2 * margin);
    termsLines.forEach((line) => {
      // Check if we need a new page for each line
      if (yPos > pageHeight - 40) {
        doc.addPage();
        drawHeader();
        drawFooter();
        yPos = PDF_MARGINS.headerTop + 15;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });
    yPos += 10;
  }

  /**
   * Signature Section
   * Always displayed on the last page at the bottom
   * Ensures proper spacing from the bottom of the page
   */
  // Ensure enough space for signatures (minimum 40mm)
  yPos = ensureSpace(doc, yPos, 40, drawHeader, drawFooter);

  // Position signatures at a comfortable distance from bottom
  yPos = Math.max(yPos, pageHeight - 50);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Supplier Signature (Left)
  doc.text("For " + (challan.supplierName || companyInfo.name), margin, yPos);
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, yPos + 15, margin + 50, yPos + 15);
  doc.text("Authorized Signatory", margin, yPos + 20);

  // Recipient Signature (Right)
  const rightX = pageWidth - margin - 50;
  doc.text("Receiver's Signature", rightX, yPos);
  doc.line(rightX, yPos + 15, rightX + 50, yPos + 15);
  doc.text("Name & Stamp", rightX, yPos + 20);

  // Save PDF with descriptive filename
  const filename = `Challan_${challan.challanNo || "draft"}_${companyInfo.name.replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}
