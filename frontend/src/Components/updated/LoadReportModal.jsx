import React, { useState, useEffect } from 'react';
import { loadReports, loadReport } from './api';
import ErrorPopup from './ErrorPopup';
import { X, Lock, Globe, User } from 'lucide-react';

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
      console.log('Loaded reports:', reports);
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

  const getReportColor = (index) => {
    const colors = ['bg-blue-50', 'bg-green-50', 'bg-yellow-50', 'bg-purple-50', 'bg-pink-50'];
    return colors[index % colors.length];
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-3 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="absolute top-2 right-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-2 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Load Report</h3>
          <div className="mt-2 px-2 py-2">
            {isLoading ? (
              <p>Loading reports...</p>
            ) : savedReports.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {savedReports.map((report, index) => (
                  <div key={report.id} className={`${getReportColor(index)} rounded-lg shadow-sm p-2`}>
                    <button
                      onClick={() => handleLoad(report.id)}
                      className="w-full text-left hover:bg-opacity-80 rounded-lg transition duration-150 ease-in-out"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm truncate">{report.name}</span>
                        {report.isPrivate ? (
                          <Lock className="h-3 w-3 text-gray-500" />
                        ) : (
                          <Globe className="h-3 w-3 text-gray-500" />
                        )}
                      </div>
                      <div className="mt-1 flex justify-between items-center text-xs text-gray-500">
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                        <span className="bg-gray-200 px-1 py-0.5 rounded-full text-xxs">
                          {report.isPrivate ? 'Private' : 'Public'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <User className="h-3 w-3 mr-1" />
                        <span className="truncate">{report.createdBy}</span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No saved reports found.</p>
            )}
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

