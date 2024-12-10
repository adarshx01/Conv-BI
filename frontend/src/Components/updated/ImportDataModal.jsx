import React, { useState } from 'react';
import { X } from 'lucide-react';

function ImportDataModal({ onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    // Here you would parse the file and extract columns
    // For this example, we'll use dummy data
    setColumns(['Column A', 'Column B', 'Column C', 'Column D']);
  };

  const handleImport = () => {
    // Here you would process the file and columns
    onImport({ columns, data: [] }); // Pass the actual data here
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Import Data</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          <input type="file" onChange={handleFileChange} accept=".csv,.xlsx" />
          {columns.length > 0 && (
            <div className="column-list">
              <h3>Available Columns:</h3>
              <ul>
                {columns.map((column, index) => (
                  <li key={index} draggable>
                    {column}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleImport} disabled={!file}>
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportDataModal;

