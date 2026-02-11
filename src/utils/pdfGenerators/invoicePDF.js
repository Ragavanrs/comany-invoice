import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  createInvoiceHeader,
  createFooter,
  toMoney,
  numberToWordsIndian,
  gstBreakup,
  ensureSpace,
} from "./commonComponents";
import { PDF_MARGINS, DEFAULT_COMPANY_INFO } from "./constants";

/**
 * Generate Invoice PDF with multi-page pagination support
 * 
 * @param {Object} invoice - Invoice details
 * @param {string} invoice.invoiceNo - Invoice number
 * @param {string} invoice.date - Invoice date
 * @param {string} invoice.poNo - Purchase order number
 * @param {string} invoice.dcNo - Delivery challan number
 * @param {string} invoice.customerName - Customer name
 * @param {string} invoice.customerAddress - Customer address
 * @param {string} invoice.partyGstin - Customer GSTIN
 * @param {Array} invoice.items - Array of invoice items
 * @param {Object} options - Additional options
 * @param {string} options.gstType - Type of GST: "igst" or "cgst_sgst" (default: "igst")
 * @param {Object} options.company - Company information (optional)
 * 
 * @example
 * generateInvoicePDF({
 *   invoiceNo: "INV001",
 *   date: "2024-01-01",
 *   items: [{ description: "Item 1", qty: 10, rate: 100, hsnCode: "1234" }],
 *   ...
 * }, { gstType: "igst", company: { name: "SURYA POWER", ... } });
 */
export function generateInvoicePDF(invoice, { gstType = "igst", company } = {}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = PDF_MARGINS.page;

  // Merge with defaults
  const companyInfo = { ...DEFAULT_COMPANY_INFO, ...company };

  /**
   * Draws the header for each page
   * This is called for the first page and for each new page created by autoTable
   */
  const drawHeader = () => {
    createInvoiceHeader(doc, {
      documentTitle: "TAX INVOICE",
      company: companyInfo,
    });
  };

  /**
   * Draws the footer for each page
   * This is called for the first page and for each new page created by autoTable
   */
  const drawFooter = () => {
    createFooter(doc, {
      showPageNumber: true,
    });
  };

  // ✅ Draw header/footer for page 1 BEFORE any tables
  drawHeader();
  drawFooter();

  // ---------- Invoice + customer ----------
  const invLeft = [
    [`Invoice No: ${invoice.invoiceNo || ""}`],
    [`Date: ${invoice.date ? invoice.date : ""}`],
    [`PO No: ${invoice.poNo || ""}`],
    [`DC No: ${invoice.dcNo || ""}`],
  ];
  const billTo = [
    [{ content: "Bill To:", styles: { fontStyle: "bold" } }],
    [invoice.customerName || ""],
    ...((invoice.customerAddress || "").split("\n").map((l) => [l])),
    [invoice.partyGstin ? `GSTIN: ${invoice.partyGstin}` : ""],
  ];

  autoTable(doc, {
    startY: 45,
    body: invLeft,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 0.8 },
    margin: { left: margin, right: pageWidth / 2 + 2 },
  });

  autoTable(doc, {
    startY: 45,
    body: billTo,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 0.8 },
    margin: { left: pageWidth / 2, right: margin },
  });

  // ---------- Items ----------
  const items = (invoice.items || []).map((it, i) => {
    const qty = Number(it.qty) || 0;
    const rate = Number(it.rate) || 0;
    const base = qty * rate;
    return [
      i + 1,
      it.description || "",
      it.hsnCode || it.hsn || "",
      qty,
      toMoney(rate),
      toMoney(base),
    ];
  });

  /**
   * ✅ CRITICAL: Multi-page pagination support using autoTable
   * 
   * The didDrawPage callback is crucial for multi-page documents:
   * - It fires for EVERY page (including the first)
   * - We redraw header/footer on each page
   * - Margins prevent content from overlapping header/footer
   * 
   * How pagination works:
   * 1. autoTable automatically detects when content exceeds page height
   * 2. It creates a new page and continues rendering the table
   * 3. didDrawPage fires for the new page, redrawing header/footer
   * 4. Table headers are repeated automatically (not explicitly needed for single-head tables)
   * 5. Process continues until all rows are rendered
   */
  autoTable(doc, {
    startY: Math.max(doc.lastAutoTable?.finalY || 60, 60) + 6,
    head: [["S.No", "Description", "HSN/SAC", "Qty", "Rate", "Amount"]],
    body: items.length ? items : [["", "", "", "", "", ""]],
    styles: { fontSize: 9, cellPadding: 2, valign: "top" },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { halign: "left", cellWidth: 80 },
      2: { halign: "center", cellWidth: 22 },
      3: { halign: "center", cellWidth: 16 },
      4: { halign: "right", cellWidth: 22 },
      5: { halign: "right", cellWidth: 24 },
    },
    headStyles: { fillColor: [0, 0, 139], textColor: [255, 255, 255] },
    theme: "grid",
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        data.cell.styles.halign = "left";
        data.cell.styles.cellWidth = "wrap";
      }
    },
    // ✅ Repeat header/footer when this (long) table spans to new pages
    didDrawPage: () => {
      drawHeader();
      drawFooter();
    },
    // ✅ Keep clear of header/footer
    margin: {
      top: PDF_MARGINS.headerTop,
      bottom: PDF_MARGINS.footerBottom,
      left: margin,
      right: margin,
    },
    // Prevent rows from being split across pages
    rowPageBreak: "auto",
  });

  const afterItemsY = doc.lastAutoTable.finalY + 8;

  // ---------- Totals ----------
  const subtotal = (invoice.items || []).reduce(
    (s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0),
    0
  );
  const gst = gstBreakup(subtotal, 18, gstType);
  const grand = subtotal + gst.igst + gst.cgst + gst.sgst;

  // Amount in words
  const words = `Amount in words: Rupees ${numberToWordsIndian(Math.round(grand))} only`;
  autoTable(doc, {
    startY: afterItemsY,
    body: [[words]],
    styles: { fontSize: 10, cellPadding: 3 },
    theme: "plain",
    margin: { left: margin, right: pageWidth / 2 + 2 },
  });

  const rightStartY = doc.lastAutoTable.finalY;
  const totalsRows = [
    [
      { content: "Subtotal", styles: { fontStyle: "bold" } },
      { content: `₹ ${toMoney(subtotal)}`, styles: { halign: "right" } },
    ],
    ...(gstType === "igst"
      ? [
          [
            { content: "IGST (18%)" },
            { content: `₹ ${toMoney(gst.igst)}`, styles: { halign: "right" } },
          ],
        ]
      : [
          [
            { content: "CGST (9%)" },
            { content: `₹ ${toMoney(gst.cgst)}`, styles: { halign: "right" } },
          ],
          [
            { content: "SGST (9%)" },
            { content: `₹ ${toMoney(gst.sgst)}`, styles: { halign: "right" } },
          ],
        ]),
    [
      { content: "Grand Total", styles: { fontStyle: "bold" } },
      {
        content: `₹ ${toMoney(grand)}`,
        styles: { halign: "right", fontStyle: "bold" },
      },
    ],
  ];

  autoTable(doc, {
    startY: rightStartY,
    body: totalsRows,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 40, halign: "right" } },
    margin: { left: pageWidth - margin - 85, right: margin },
  });

  // ---------- Bank + terms ----------
  // Ensure enough space for bank details and terms (minimum 80mm)
  let afterTotalsY = doc.lastAutoTable.finalY + 8;
  afterTotalsY = ensureSpace(doc, afterTotalsY, 80, drawHeader, drawFooter);

  autoTable(doc, {
    startY: afterTotalsY,
    body: [
      [
        {
          content: companyInfo.bankTitle || "TAMILNAD MERCANTILE BANK",
          styles: { fontStyle: "bold" },
        },
      ],
      [`NAME: ${companyInfo.bankName || "SURYA POWER"}`],
      [`AC.NO: ${companyInfo.accountNo || "22815005800163"}`],
      [`BRANCH: ${companyInfo.branch || "NARAVARIKUPPAM BRANCH"}`],
      [`IFSC CODE: ${companyInfo.ifsc || "TMBL0000228"}`],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.2 },
    margin: { left: margin, right: margin },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 4,
    body: [
      ["Terms & Conditions:"],
      [
        "1. Interest 24% p.a. will be charged on all invoices if not paid within due date.",
      ],
      ["2. All payment to be made only by crossed cheques drawn in our favour."],
      ["3. PAYMENT WITHIN .............. DAYS"],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.2 },
  });

  // ---------- Signature ----------
  // Ensure enough space for signature (minimum 30mm)
  let sigY = doc.lastAutoTable.finalY + 10;
  sigY = ensureSpace(doc, sigY, 30, drawHeader, drawFooter);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `For ${companyInfo.name || "SURYA POWER"}`,
    pageWidth - margin - 50,
    sigY
  );
  doc.setDrawColor(0, 0, 0);
  doc.line(pageWidth - margin - 50, sigY + 6, pageWidth - margin, sigY + 6);
  doc.setFontSize(9);
  doc.text("Proprietor", pageWidth - margin - 50, sigY + 12);

  // Save PDF with descriptive filename
  const fileName = `Invoice_${invoice.invoiceNo || "Draft"}_${companyInfo.name.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}
