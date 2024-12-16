import React, { useState } from 'react';
import { saveReport } from './api';
import ErrorPopup from './ErrorPopup';

function SaveReportModal({ onClose, onSave, reportData }) {
  const [reportName, setReportName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const handleSave = async () => {
    if (!reportName.trim()) {
      setError('Please enter a report name');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const result = await saveReport(reportName, reportData);
      onSave(result);
      onClose();
    } catch (err) {
      console.error('Failed to save report:', err);
      setError('Failed to save report. Please try again.');
      setShowErrorPopup(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Save Report</h3>
          <div className="mt-2 px-7 py-3">
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Enter report name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {isSaving ? 'Saving...' : 'Save Report'}
            </button>
            <button
              onClick={onClose}
              className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      {showErrorPopup && (
        <ErrorPopup message={error} onClose={() => setShowErrorPopup(false)} />
      )}
    </div>
  );
}

export default SaveReportModal;

