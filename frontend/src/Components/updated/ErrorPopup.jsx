import React from 'react';

const ErrorPopup = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p className="mb-4">{message}</p>
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ErrorPopup;

