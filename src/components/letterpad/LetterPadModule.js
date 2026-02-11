import React, { useState } from 'react';
import LetterPadForm from './LetterPadForm';
import LetterPadList from './LetterPadList';
import { getItems, addItem, updateItem, deleteItem, STORAGE_KEYS } from '../../utils/storage';
import { generateLetterPadPDF } from '../../utils/pdfGenerators/letterPadPDF';

/**
 * LetterPadModule Component
 * Main container for Letter Pad Generator module
 */
const LetterPadModule = () => {
  const [showForm, setShowForm] = useState(true);
  const [editingLetter, setEditingLetter] = useState(null);
  const [savedLetters, setSavedLetters] = useState(getItems(STORAGE_KEYS.LETTERPADS));

  const handleSave = (letterData) => {
    if (editingLetter) {
      // Update existing letter
      updateItem(STORAGE_KEYS.LETTERPADS, editingLetter.id, letterData);
    } else {
      // Add new letter
      addItem(STORAGE_KEYS.LETTERPADS, letterData);
    }
    
    // Refresh list
    setSavedLetters(getItems(STORAGE_KEYS.LETTERPADS));
    setEditingLetter(null);
    setShowForm(false);
  };

  const handleEdit = (letter) => {
    setEditingLetter(letter);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this letter?')) {
      deleteItem(STORAGE_KEYS.LETTERPADS, id);
      setSavedLetters(getItems(STORAGE_KEYS.LETTERPADS));
    }
  };

  const handleDownload = (letter) => {
    generateLetterPadPDF(letter, {
      name: "SURYA POWER",
      tagline: "DG Set Hiring, Old DG Set Buying, Selling & Servicing",
      address: "No.1/11, G.N.T Road, Padiyanallur Redhills, Chennai, Thiruvallur, Tamil Nadu - 600 052",
      gstin: "33AKNPR3914K1ZT",
      contacts: "Mob: 9790987190 / 9840841887",
    });
  };

  const handleCancel = () => {
    setEditingLetter(null);
    setShowForm(false);
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>
              <i className="bi bi-envelope me-2"></i>
              Letter Pad Generator
            </h2>
            <p>Create professional business letters</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <>
                <i className="bi bi-list me-2"></i>
                View Saved Letters
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle me-2"></i>
                Create New Letter
              </>
            )}
          </button>
        </div>
      </div>

      {showForm ? (
        <LetterPadForm
          letter={editingLetter}
          onSave={handleSave}
          onCancel={handleCancel}
          onDownload={handleDownload}
        />
      ) : (
        <LetterPadList
          letters={savedLetters}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

export default LetterPadModule;
