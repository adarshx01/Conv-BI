import React, { useState, useEffect } from 'react';
import { loadReports, loadReport } from './api';
import ErrorPopup from './ErrorPopup';

function LoadReportModal({ onClose, onLoad }) {
  const [savedReports, setSavedReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const reports = await loadReports();
      setSavedReports(reports);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to fetch reports. Please try again.');
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async (reportId) => {
    try {
      setIsLoading(true);
      setError('');
      const report = await loadReport(reportId);
      if (report) {
        onLoad(report);
        onClose();
      } else {
        throw new Error('Report data is empty or invalid');
      }
    } catch (err) {
      console.error('Failed to load report:', err);
      setError('Failed to load report. Please try again.');
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Load Report</h3>
          <div className="mt-2 px-7 py-3">
            {isLoading ? (
              <p>Loading reports...</p>
            ) : savedReports.length > 0 ? (
              <ul className="space-y-2">
                {savedReports.map((report) => (
                  <li key={report.id}>
                    <button
                      onClick={() => handleLoad(report.id)}
                      className="w-full text-left px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded"
                    >
                      {report.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No saved reports found.</p>
            )}
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Close
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

export default LoadReportModal;

