import React, { useState } from "react";
import jsPDF from "jspdf";
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceDetails({ ...invoiceDetails, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...invoiceDetails.items];
    items[index][field] = field === "gst" ? parseFloat(value) : value;

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

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("SURYA POWER", 80, 15);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("DG Set Hiring, Old DG Set Buying, Selling & Servicing", 55, 20);
    doc.text("No.1/11, G.N.T Road, Padiyanallur Redhills, Chennai,", 50, 25);
    doc.text("Thiruvallur, Tamil Nadu - 600 052", 65, 30);
    doc.text("GSTIN : 33AKNPR3914K1ZT", 10, 35);
    doc.text("Mob : 9790987190, 9840841887", 140, 35);

    doc.setFont("helvetica", "bold");
    doc.text("TAX INVOICE", 90, 42);

    // Invoice & Party Details
    doc.setFontSize(9);
    const details = invoiceDetails;
    doc.text(`Invoice No: ${details.invoiceNo}`, 10, 50);
    doc.text(`Date: ${details.date}`, 150, 50);

    doc.text(`To: ${details.customerName}`, 10, 58);
    doc.text(`${details.customerAddress}`, 10, 63);
    doc.text(`Party GSTIN: ${details.partyGstin}`, 10, 70);
    doc.text(`P.O. No: ${details.poNo}`, 150, 58);
    doc.text(`D.C. No: ${details.dcNo}`, 150, 63);

    // Table Headers
    const startY = 78;
    doc.autoTable({
      startY,
      head: [["S.No", "DESCRIPTION", "HSN Code", "QTY", "GST %", "RATE", "AMOUNT"]],
      body: details.items.map((item, index) => [
        index + 1,
        item.description,
        item.hsnCode,
        item.qty,
        item.gst + "%",
        item.rate.toFixed(2),
        item.amount.toFixed(2),
      ]),
      styles: { fontSize: 9 },
      theme: "grid",
      headStyles: { fillColor: [220, 220, 220] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 55 },
        2: { cellWidth: 25 },
        3: { cellWidth: 15 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 30 },
      },
    });

    const totalY = doc.lastAutoTable.finalY + 5;
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: ₹ ${calculateTotal()}`, 150, totalY);

    // Bank Info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const bankStart = totalY + 10;
    doc.text("TAMILNAD MERCANTILE BANK", 10, bankStart);
    doc.text("NAME: SURYA POWER", 10, bankStart + 5);
    doc.text("AC.NO: 22815005800163", 10, bankStart + 10);
    doc.text("BRANCH: NARAVARIKUPPAM BRANCH", 10, bankStart + 15);
    doc.text("IFSC CODE: TMBL0000228", 10, bankStart + 20);

    // Footer
    doc.setFontSize(8);
    doc.text("1. Interest 24% p.a. will be charged on all invoices if not paid within due date.", 10, bankStart + 28);
    doc.text("2. All payment to be made only by crossed cheques drawn in own favour.", 10, bankStart + 32);
    doc.text("3. PAYMENT WITHIN .............. DAYS", 10, bankStart + 38);

    doc.setFont("helvetica", "bold");
    doc.text("For SURYA POWER", 150, bankStart + 35);
    doc.text("Proprietor", 155, bankStart + 40);

    doc.save("TaxInvoice.pdf");
  };

  return (
    <div className="invoice-form">
      <h2>Tax Invoice Form</h2>
      <form>
        <div className="row">
          <label>Invoice No:</label>
          <input type="text" name="invoiceNo" value={invoiceDetails.invoiceNo} onChange={handleInputChange} required />
        </div>
        <div className="row">
          <label>Date:</label>
          <input type="date" name="date" value={invoiceDetails.date} onChange={handleInputChange} required />
        </div>
        <div className="row">
          <label>Customer Name:</label>
          <input type="text" name="customerName" value={invoiceDetails.customerName} onChange={handleInputChange} required />
        </div>
        <div className="row">
          <label>Customer Address:</label>
          <textarea name="customerAddress" value={invoiceDetails.customerAddress} onChange={handleInputChange} />
        </div>
        <div className="row">
          <label>Party GSTIN:</label>
          <input type="text" name="partyGstin" value={invoiceDetails.partyGstin} onChange={handleInputChange} />
        </div>
        <div className="row">
          <label>P.O. No:</label>
          <input type="text" name="poNo" value={invoiceDetails.poNo} onChange={handleInputChange} />
        </div>
        <div className="row">
          <label>D.C. No:</label>
          <input type="text" name="dcNo" value={invoiceDetails.dcNo} onChange={handleInputChange} />
        </div>

        <h3>Item Details</h3>
        <table className="item-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Description</th>
              <th>HSN Code</th>
              <th>Qty</th>
              <th>GST %</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoiceDetails.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td><input type="text" value={item.description} onChange={(e) => handleItemChange(index, "description", e.target.value)} /></td>
                <td><input type="text" value={item.hsnCode} onChange={(e) => handleItemChange(index, "hsnCode", e.target.value)} /></td>
                <td><input type="number" value={item.qty} onChange={(e) => handleItemChange(index, "qty", e.target.value)} /></td>
                <td>
                  <select value={item.gst} onChange={(e) => handleItemChange(index, "gst", e.target.value)}>
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </td>
                <td><input type="number" value={item.rate} onChange={(e) => handleItemChange(index, "rate", e.target.value)} /></td>
                <td><input type="number" value={item.amount.toFixed(2)} readOnly /></td>
                <td><button type="button" onClick={() => removeItemRow(index)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addItemRow}>Add Item</button>
        <h3>Total: ₹ {calculateTotal()}</h3>
        <button type="button" onClick={generatePDF}>Generate PDF</button>
      </form>
    </div>
  );
};

export default TaxInvoiceForm;
