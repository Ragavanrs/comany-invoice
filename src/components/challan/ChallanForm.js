import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ChallanForm Component
 * Reusable form for creating and editing delivery challans
 */
const ChallanForm = ({ challan, onSave, onCancel, onDownload }) => {
  const [challanDetails, setChallanDetails] = useState({
    challanNo: "",
    date: "",
    supplierName: "",
    supplierAddress: "",
    recipientName: "",
    recipientAddress: "",
    items: [
      { description: "", quantity: 0, unit: "", remarks: "" },
    ],
    transportDetails: {
      vehicleNo: "",
      driverName: "",
    },
    terms: "",
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (challan) {
      setChallanDetails({
        challanNo: challan.challanNo || "",
        date: challan.date || "",
        supplierName: challan.supplierName || "",
        supplierAddress: challan.supplierAddress || "",
        recipientName: challan.recipientName || "",
        recipientAddress: challan.recipientAddress || "",
        items: challan.items || [
          { description: "", quantity: 0, unit: "", remarks: "" },
        ],
        transportDetails: {
          vehicleNo: challan.transportDetails?.vehicleNo || "",
          driverName: challan.transportDetails?.driverName || "",
        },
        terms: challan.terms || "",
      });
    }
  }, [challan]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChallanDetails({ ...challanDetails, [name]: value });
  };

  const handleTransportChange = (e) => {
    const { name, value } = e.target;
    setChallanDetails({
      ...challanDetails,
      transportDetails: {
        ...challanDetails.transportDetails,
        [name]: value,
      },
    });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...challanDetails.items];
    
    if (field === "quantity") {
      items[index][field] = parseFloat(value) || 0;
    } else {
      items[index][field] = value;
    }

    setChallanDetails({ ...challanDetails, items });
  };

  const addItemRow = () => {
    setChallanDetails({
      ...challanDetails,
      items: [...challanDetails.items, { description: "", quantity: 0, unit: "", remarks: "" }],
    });
  };

  const removeItemRow = (index) => {
    const items = challanDetails.items.filter((_, i) => i !== index);
    setChallanDetails({ ...challanDetails, items });
  };

  const handleSave = () => {
    const dataToSave = {
      ...challanDetails,
      id: challan?.id || Date.now(),
      createdAt: challan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(dataToSave);
  };

  const handleDownload = () => {
    onDownload(challanDetails);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <form>
          <div className="row mb-4">
            <div className="col-12">
              <h4 className="text-primary border-bottom pb-2">
                <i className="bi bi-truck me-2"></i>Delivery Challan Details
              </h4>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="challanNo" className="form-label fw-bold">
                <i className="bi bi-hash me-1"></i>Challan Number
              </label>
              <input type="text" className="form-control" id="challanNo" name="challanNo" 
                value={challanDetails.challanNo} onChange={handleInputChange} required placeholder="Enter challan number" />
            </div>
            <div className="col-md-6">
              <label htmlFor="date" className="form-label fw-bold">
                <i className="bi bi-calendar me-1"></i>Date
              </label>
              <input type="date" className="form-control" id="date" name="date" 
                value={challanDetails.date} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <h4 className="text-primary border-bottom pb-2">
                <i className="bi bi-building me-2"></i>Supplier Details
              </h4>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="supplierName" className="form-label fw-bold">
                <i className="bi bi-person me-1"></i>Supplier Name
              </label>
              <input type="text" className="form-control" id="supplierName" name="supplierName" 
                value={challanDetails.supplierName} onChange={handleInputChange} required placeholder="Enter supplier name" />
            </div>
            <div className="col-md-6">
              <label htmlFor="supplierAddress" className="form-label fw-bold">
                <i className="bi bi-geo-alt me-1"></i>Supplier Address
              </label>
              <textarea className="form-control" id="supplierAddress" name="supplierAddress" 
                value={challanDetails.supplierAddress} onChange={handleInputChange} rows="3" placeholder="Enter supplier address" />
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <h4 className="text-primary border-bottom pb-2">
                <i className="bi bi-person-check me-2"></i>Recipient Details
              </h4>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="recipientName" className="form-label fw-bold">
                <i className="bi bi-person me-1"></i>Recipient Name
              </label>
              <input type="text" className="form-control" id="recipientName" name="recipientName" 
                value={challanDetails.recipientName} onChange={handleInputChange} required placeholder="Enter recipient name" />
            </div>
            <div className="col-md-6">
              <label htmlFor="recipientAddress" className="form-label fw-bold">
                <i className="bi bi-geo-alt me-1"></i>Recipient Address
              </label>
              <textarea className="form-control" id="recipientAddress" name="recipientAddress" 
                value={challanDetails.recipientAddress} onChange={handleInputChange} rows="3" placeholder="Enter recipient address" />
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="text-primary border-bottom pb-2">
                  <i className="bi bi-list-ul me-2"></i>Items Details
                </h4>
                <button type="button" className="btn btn-success btn-sm" onClick={addItemRow}>
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
                  <th scope="col" className="text-center">Quantity</th>
                  <th scope="col" className="text-center">Unit</th>
                  <th scope="col">Remarks</th>
                  <th scope="col" className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {challanDetails.items.map((item, index) => (
                  <tr key={index} className="align-middle">
                    <td className="text-center fw-bold">{index + 1}</td>
                    <td>
                      <input type="text" className="form-control form-control-sm" value={item.description} 
                        onChange={(e) => handleItemChange(index, "description", e.target.value)} placeholder="Item description" />
                    </td>
                    <td>
                      <input type="number" className="form-control form-control-sm text-center" value={item.quantity} 
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)} min="0" step="0.01" />
                    </td>
                    <td>
                      <input type="text" className="form-control form-control-sm text-center" value={item.unit} 
                        onChange={(e) => handleItemChange(index, "unit", e.target.value)} placeholder="Unit" />
                    </td>
                    <td>
                      <input type="text" className="form-control form-control-sm" value={item.remarks} 
                        onChange={(e) => handleItemChange(index, "remarks", e.target.value)} placeholder="Remarks" />
                    </td>
                    <td className="text-center">
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeItemRow(index)}
                        disabled={challanDetails.items.length === 1}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="row mb-4">
            <div className="col-12">
              <h4 className="text-primary border-bottom pb-2">
                <i className="bi bi-truck-flatbed me-2"></i>Transport Details
              </h4>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="vehicleNo" className="form-label fw-bold">
                <i className="bi bi-car-front me-1"></i>Vehicle Number
              </label>
              <input type="text" className="form-control" id="vehicleNo" name="vehicleNo" 
                value={challanDetails.transportDetails.vehicleNo} onChange={handleTransportChange} placeholder="Enter vehicle number" />
            </div>
            <div className="col-md-6">
              <label htmlFor="driverName" className="form-label fw-bold">
                <i className="bi bi-person-badge me-1"></i>Driver Name
              </label>
              <input type="text" className="form-control" id="driverName" name="driverName" 
                value={challanDetails.transportDetails.driverName} onChange={handleTransportChange} placeholder="Enter driver name" />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-12">
              <label htmlFor="terms" className="form-label fw-bold">
                <i className="bi bi-file-text me-1"></i>Terms & Conditions
              </label>
              <textarea className="form-control" id="terms" name="terms" 
                value={challanDetails.terms} onChange={handleInputChange} rows="4" placeholder="Enter terms and conditions" />
            </div>
          </div>

          <div className="row">
            <div className="col-12 text-end">
              <div className="btn-group" role="group">
                {challan && (
                  <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    <i className="bi bi-x-circle me-1"></i>Cancel
                  </button>
                )}
                <button type="button" className="btn btn-success" onClick={handleSave}>
                  <i className="bi bi-save me-1"></i>Save Challan
                </button>
                <button type="button" className="btn btn-primary" onClick={handleDownload}>
                  <i className="bi bi-file-earmark-pdf me-1"></i>Generate PDF
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

ChallanForm.propTypes = {
  challan: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

export default ChallanForm;
