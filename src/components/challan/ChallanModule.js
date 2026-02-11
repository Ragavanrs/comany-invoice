import React, { useState } from 'react';
import ChallanForm from './ChallanForm';
import ChallanList from './ChallanList';
import { getItems, addItem, updateItem, deleteItem, STORAGE_KEYS } from '../../utils/storage';
import { generateChallanPDF } from '../../utils/pdfGenerators/challanPDF';

/**
 * ChallanModule Component
 * Main container for Delivery Challan module
 */
const ChallanModule = () => {
  const [showForm, setShowForm] = useState(true);
  const [editingChallan, setEditingChallan] = useState(null);
  const [savedChallans, setSavedChallans] = useState(getItems(STORAGE_KEYS.CHALLANS));

  const handleSave = (challanData) => {
    if (editingChallan) {
      // Update existing challan
      updateItem(STORAGE_KEYS.CHALLANS, editingChallan.id, challanData);
    } else {
      // Add new challan
      addItem(STORAGE_KEYS.CHALLANS, challanData);
    }
    
    // Refresh list
    setSavedChallans(getItems(STORAGE_KEYS.CHALLANS));
    setEditingChallan(null);
    setShowForm(false);
  };

  const handleEdit = (challan) => {
    setEditingChallan(challan);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this delivery challan?')) {
      deleteItem(STORAGE_KEYS.CHALLANS, id);
      setSavedChallans(getItems(STORAGE_KEYS.CHALLANS));
    }
  };

  const handleDownload = (challan) => {
    generateChallanPDF(challan, {
      company: {
        name: "SURYA POWER",
        tagline: "DG Set Hiring, Old DG Set Buying, Selling & Servicing",
        address: "No.1/11, G.N.T Road, Padiyanallur Redhills, Chennai, Thiruvallur, Tamil Nadu - 600 052",
        gstin: "33AKNPR3914K1ZT",
        contacts: "Mob: 9790987190 / 9840841887",
      }
    });
  };

  const handleCancel = () => {
    setEditingChallan(null);
    setShowForm(false);
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>
              <i className="bi bi-truck me-2"></i>
              Delivery Challan
            </h2>
            <p>Create and manage delivery challans</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <>
                <i className="bi bi-list me-2"></i>
                View Saved Challans
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle me-2"></i>
                Create New Challan
              </>
            )}
          </button>
        </div>
      </div>

      {showForm ? (
        <ChallanForm
          challan={editingChallan}
          onSave={handleSave}
          onCancel={handleCancel}
          onDownload={handleDownload}
        />
      ) : (
        <ChallanList
          challans={savedChallans}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

export default ChallanModule;
