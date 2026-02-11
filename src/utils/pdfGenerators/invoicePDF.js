import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import image from "./image.png"; 
const toMoney = (n) => (Number(n) || 0).toFixed(2);

// Simple Indian system number to words (integer only)
const numberToWordsIndian = (num) => {
  const ones = ["","one","two","three","four","five","six","seven","eight","nine"];
  const tens = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
  const teens = ["ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return "zero";
  const chunk = (x) => {
    let r = "";
    if (x >= 100) { r += ones[Math.floor(x/100)]+" hundred "; x %= 100; }
    if (x >= 20) { r += tens[Math.floor(x/10)]+" "; if (x%10) r += ones[x%10]; }
    else if (x >= 10) { r += teens[x-10]; }
    else if (x > 0) { r += ones[x]; }
    return r.trim();
  };
  let res = "";
  const crore = Math.floor(n/1e7);
  const lakh  = Math.floor((n%1e7)/1e5);
  const thousand = Math.floor((n%1e5)/1e3);
  const hundred  = n%1e3;
  if (crore)   res += chunk(crore) + " crore ";
  if (lakh)    res += chunk(lakh) + " lakh ";
  if (thousand)res += chunk(thousand) + " thousand ";
  if (hundred) res += chunk(hundred);
  return res.trim();
};

const gstBreakup = (amount, gstRate, gstType) => {
  const base = Number(amount) || 0;
  const rate = Number(gstRate) || 0;
  if (gstType === "igst") return { igst: base * rate/100, cgst: 0, sgst: 0 };
  const half = base * (rate/2) / 100;
  return { igst: 0, cgst: half, sgst: half };
};

export function generateInvoicePDF(invoice, { gstType = "igst", company } = {}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

  // Common header/footer per page
  const drawHeader = () => {
    // Logo (top-left)
    const logoW = 30, logoH = 18;
    const logoX = margin, logoY = 8;
    doc.addImage(image, "PNG", logoX, logoY, logoW, logoH);

    const afterLogoY = logoY + logoH + 4;
    doc.setTextColor(0,0,0);
    doc.setFont("helvetica","normal");
    doc.setFontSize(9);
    doc.text((company?.gstin || "GSTIN: 33AKNPR3914K1ZT"), margin, afterLogoY);

    // Title + company
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("TAX INVOICE", pageWidth/2, 15, { align: "center" });

    // NOTE: removed the 2nd duplicate addImage here
    doc.setFontSize(18);
    doc.setTextColor(0,0,139);
    doc.text((company?.name || "SURYA POWER"), pageWidth/2, 24, { align: "center" });

    doc.setTextColor(0,0,0);
    doc.setFont("helvetica","normal");
    doc.setFontSize(9);
    doc.text((company?.tagline || "DG Set Hiring, Old DG Set Buying, Selling & Servicing"), pageWidth/2, 30, { align: "center" });
    doc.text((company?.address || "No.1/11, G.N.T Road, Padiyanallur Redhills, Chennai, Thiruvallur, Tamil Nadu - 600 052"), pageWidth/2, 35, { align: "center" });
    doc.text((company?.contacts || "Mob: 9790987190 / 9840841887"), pageWidth - margin, 15, { align: "right" });

    // divider
    doc.setDrawColor(0,0,139);
    doc.setLineWidth(0.8);
    doc.line(margin, 40, pageWidth - margin, 40);
  };

  const drawFooter = () => {
    doc.setFontSize(8);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - margin, pageHeight - 5, { align:"right" });
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
    [{ content: "Bill To:", styles:{ fontStyle: "bold" } }],
    [invoice.customerName || ""],
    ...((invoice.customerAddress || "").split("\n").map(l => [l])),
    [invoice.partyGstin ? `GSTIN: ${invoice.partyGstin}` : ""],
  ];

  autoTable(doc,{
    startY: 45,
    body: invLeft,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 0.8 },
    margin: { left: margin, right: pageWidth/2 + 2 }
  });

  autoTable(doc,{
    startY: 45,
    body: billTo,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 0.8 },
    margin: { left: pageWidth/2, right: margin }
  });

  // ---------- Items ----------
  const items = (invoice.items || []).map((it, i) => {
    const qty = Number(it.qty) || 0;
    const rate = Number(it.rate) || 0;
    const base = qty * rate;
    return [ i + 1, it.description || "", it.hsnCode || it.hsn || "", qty, toMoney(rate), toMoney(base) ];
  });

  autoTable(doc,{
    startY: Math.max(doc.lastAutoTable?.finalY || 60, 60) + 6,
    head: [["S.No","Description","HSN/SAC","Qty","Rate","Amount"]],
    body: items.length ? items : [["","","","","",""]],
    styles: { fontSize: 9, cellPadding: 2, valign: "top" },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { halign: "left",   cellWidth: 80 },
      2: { halign: "center", cellWidth: 22 },
      3: { halign: "center", cellWidth: 16 },
      4: { halign: "right",  cellWidth: 22 },
      5: { halign: "right",  cellWidth: 24 },
    },
    headStyles: { fillColor: [0,0,139], textColor: [255,255,255] },
    theme: "grid",
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        data.cell.styles.halign = "left";
        data.cell.styles.cellWidth = "wrap";
      }
    },
    // ✅ Repeat header/footer when this (long) table spans to new pages
    didDrawPage: () => { drawHeader(); drawFooter(); },
    margin: { top: 42, bottom: 18, left: margin, right: margin } // keep clear of header/footer
  });

  const afterItemsY = doc.lastAutoTable.finalY + 8;

  // ---------- Totals ----------
  const subtotal = (invoice.items || []).reduce((s, it) => s + ((Number(it.qty)||0) * (Number(it.rate)||0)), 0);
  const gst = gstBreakup(subtotal, 18, gstType);
  const grand = subtotal + gst.igst + gst.cgst + gst.sgst;

  const words = `Amount in words: Rupees ${numberToWordsIndian(Math.round(grand))} only`;
  autoTable(doc,{
    startY: afterItemsY,
    body: [[words]],
    styles: { fontSize: 10, cellPadding: 3 },
    theme: "plain",
    margin: { left: margin, right: pageWidth/2 + 2 }
  });

  const rightStartY = doc.lastAutoTable.finalY;
  const totalsRows = [
    [{content: "Subtotal", styles: { fontStyle: "bold" }}, {content: `₹ ${toMoney(subtotal)}`, styles: { halign: "right" }}],
    ...(gstType === "igst"
      ? [[{content: "IGST (18%)"}, {content: `₹ ${toMoney(gst.igst)}`, styles:{ halign:"right" }}]]
      : [
          [{content: "CGST (9%)"}, {content: `₹ ${toMoney(gst.cgst)}`, styles:{ halign:"right" }}],
          [{content: "SGST (9%)"}, {content: `₹ ${toMoney(gst.sgst)}`, styles:{ halign:"right" }}],
        ]
    ),
    [{content: "Grand Total", styles: { fontStyle: "bold" }}, {content: `₹ ${toMoney(grand)}`, styles: { halign: "right", fontStyle: "bold" }}],
  ];

  autoTable(doc,{
    startY: rightStartY,
    body: totalsRows,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 40, halign: "right" } },
    margin: { left: pageWidth - margin - 85, right: margin }
  });

  // ---------- Bank + terms ----------
  const afterTotalsY = doc.lastAutoTable.finalY + 8;
  autoTable(doc,{
    startY: afterTotalsY,
    body: [
      [{ content: (company?.bankTitle || "TAMILNAD MERCANTILE BANK"), styles: { fontStyle: "bold" } }],
      [`NAME: ${company?.bankName || "SURYA POWER"}`],
      [`AC.NO: ${company?.accountNo || "22815005800163"}`],
      [`BRANCH: ${company?.branch || "NARAVARIKUPPAM BRANCH"}`],
      [`IFSC CODE: ${company?.ifsc || "TMBL0000228"}`],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.2 },
    margin: { left: margin, right: margin }
  });

  autoTable(doc,{
    startY: doc.lastAutoTable.finalY + 4,
    body: [
      ["Terms & Conditions:"],
      ["1. Interest 24% p.a. will be charged on all invoices if not paid within due date."],
      ["2. All payment to be made only by crossed cheques drawn in our favour."],
      ["3. PAYMENT WITHIN .............. DAYS"],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.2 }
  });

  // ---------- Signature ----------
  const sigY = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica","bold");
  doc.setFontSize(10);
  doc.text(`For ${(company?.name || "SURYA POWER")}`, pageWidth - margin - 50, sigY);
  doc.setDrawColor(0,0,0);
  doc.line(pageWidth - margin - 50, sigY + 6, pageWidth - margin, sigY + 6);
  doc.setFontSize(9);
  doc.text("Proprietor", pageWidth - margin - 50, sigY + 12);

  const fileName = `${invoice.invoiceNo || "Invoice"}_SURYA_POWER.pdf`;
  doc.save(fileName);
}
