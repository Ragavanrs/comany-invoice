import React from 'react';
import PropTypes from 'prop-types';
import DocumentList from '../common/DocumentList';

/**
 * ChallanList Component
 * Displays list of saved delivery challans
 */
const ChallanList = ({ challans, onEdit, onDelete, onDownload }) => {
  // Format challans for DocumentList
  const formattedChallans = challans.map(challan => ({
    ...challan,
    title: `Challan #${challan.challanNo} - ${challan.recipientName}`,
  }));

  return (
    <div>
      <h4 className="mb-3">Saved Delivery Challans ({challans.length})</h4>
      <DocumentList
        documents={formattedChallans}
        onEdit={onEdit}
        onDelete={onDelete}
        onDownload={onDownload}
        emptyMessage="No delivery challans saved yet. Create your first challan!"
        emptyIcon="bi-truck"
      />
    </div>
  );
};

ChallanList.propTypes = {
  challans: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

export default ChallanList;
