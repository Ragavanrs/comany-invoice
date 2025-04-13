import React, { useState } from "react";
import jsPDF from "jspdf";

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
      { description: "", hsnCode: 0, qty: 0, gst: 18, rate: 0, amount: 0 },
    ],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceDetails({ ...invoiceDetails, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...invoiceDetails.items];
    if (field === "hsnCode" || field === "qty" || field === "rate") {
      items[index][field] = parseFloat(value) || 0;
    } else {
      items[index][field] = value;
    }
    items[index].amount = items[index].qty * items[index].rate;
    setInvoiceDetails({ ...invoiceDetails, items });
  };

  const addItemRow = () => {
    setInvoiceDetails({
      ...invoiceDetails,
      items: [...invoiceDetails.items, { description: "", hsnCode: 0, qty: 0, gst: 18, rate: 0, amount: 0 }],
    });
  };

  const removeItemRow = (index) => {
    const items = invoiceDetails.items.filter((_, i) => i !== index);
    setInvoiceDetails({ ...invoiceDetails, items });
  };

  const calculateTotal = () => {
    return invoiceDetails.items.reduce((total, item) => total + item.amount, 0);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Surya Power Generator Company", 10, 10);
    doc.text(`GSTIN: 33AKNPR3914K1ZT`, 10, 20);
    doc.text(`Contact: 9790987190`, 10, 30);
    doc.text(`Address: No.1/11, G.N.T Road, Padiyanallur Redhills, Chennai, Thiruvallur, Tamil Nadu - 600 052`, 10, 40);
    doc.text(`Invoice No: ${invoiceDetails.invoiceNo}`, 10, 50);
    doc.text(`Date: ${invoiceDetails.date}`, 10, 60);
    doc.text(`Customer Name: ${invoiceDetails.customerName}`, 10, 70);
    doc.text(`Customer Address: ${invoiceDetails.customerAddress}`, 10, 80);
    doc.text(`Party GSTIN: ${invoiceDetails.partyGstin}`, 10, 90);
    doc.text(`P.O. No: ${invoiceDetails.poNo}`, 10, 100);
    doc.text(`D.C. No: ${invoiceDetails.dcNo}`, 10, 110);

    let y = 120;
    invoiceDetails.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.description}, HSN: ${item.hsnCode}, Qty: ${item.qty}, GST: ${item.gst}%, Rate: ${item.rate}, Amount: ${item.amount}`, 10, y);
      y += 10;
    });

    doc.text(`Total Amount: ${calculateTotal()}`, 10, y + 10);
    doc.text(`Bank Details:`, 10, y + 20);
    doc.text(`Bank Name: TAMILNAD MERCANTILE BANK`, 10, y + 30);
    doc.text(`Account Name: SURYA POWER`, 10, y + 40);
    doc.text(`Account No.: 25466487664`, 10, y + 50);
    doc.text(`Branch: NARAVARIKUPPAM`, 10, y + 60);
    doc.text(`IFSC Code: TMBL0000228`, 10, y + 70);
    doc.text(`Payment Terms: Interest of 24% p.a. will be charged on all invoices if not paid within the due date.`, 10, y + 80);
    doc.text(`For SURYA POWER, Proprietor.`, 10, y + 90);

    doc.save("TaxInvoice.pdf");
  };

  return (
    <div>
      <h1>Tax Invoice Form</h1>
      <form>
        <div>
          <label>Invoice No:</label>
          <input type="text" name="invoiceNo" value={invoiceDetails.invoiceNo} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Date:</label>
          <input type="date" name="date" value={invoiceDetails.date} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Customer Name:</label>
          <input type="text" name="customerName" value={invoiceDetails.customerName} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Customer Address:</label>
          <textarea name="customerAddress" value={invoiceDetails.customerAddress} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Party GSTIN:</label>
          <input type="text" name="partyGstin" value={invoiceDetails.partyGstin} onChange={handleInputChange} />
        </div>
        <div>
          <label>P.O. No:</label>
          <input type="text" name="poNo" value={invoiceDetails.poNo} onChange={handleInputChange} />
        </div>
        <div>
          <label>D.C. No:</label>
          <input type="text" name="dcNo" value={invoiceDetails.dcNo} onChange={handleInputChange} />
        </div>
        <h3>Item Details</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Description</th>
              <th>HSN Code</th>
              <th>Quantity</th>
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
                <td>
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="HSN Code"
                    value={item.hsnCode}
                    onChange={(e) => handleItemChange(index, "hsnCode", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={item.gst}
                    onChange={(e) => handleItemChange(index, "gst", e.target.value)}
                  >
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                  />
                </td>
                <td>
                  <input type="number" value={item.amount} readOnly />
                </td>
                <td>
                  <button type="button" onClick={() => removeItemRow(index)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addItemRow}>
          Add Item
        </button>
        <h3>Total Amount: {calculateTotal()}</h3>
        <button type="button" onClick={generatePDF}>
          Generate PDF
        </button>
      </form>
    </div>
  );
};

export default TaxInvoiceForm;