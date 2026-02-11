import React from 'react';
import PropTypes from 'prop-types';
import DocumentList from '../common/DocumentList';

/**
 * LetterPadList Component
 * Displays list of saved letters
 */
const LetterPadList = ({ letters, onEdit, onDelete, onDownload }) => {
  // Format letters for DocumentList
  const formattedLetters = letters.map(letter => ({
    ...letter,
    title: `Ref: ${letter.refNo} - ${letter.subject}`,
  }));

  return (
    <div>
      <h4 className="mb-3">Saved Letters ({letters.length})</h4>
      <DocumentList
        documents={formattedLetters}
        onEdit={onEdit}
        onDelete={onDelete}
        onDownload={onDownload}
        emptyMessage="No letters saved yet. Create your first letter!"
        emptyIcon="bi-envelope"
      />
    </div>
  );
};

LetterPadList.propTypes = {
  letters: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

export default LetterPadList;
