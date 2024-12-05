import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function ExportModal({ onClose, pages, canvasSize }) {
  const [exportType, setExportType] = useState('pdf');
  const [resolution, setResolution] = useState(2);

  const handleExport = async () => {
    const canvases = document.querySelectorAll('.canvas');
    
    try {
      if (exportType === 'pdf') {
        const pdf = new jsPDF({
          orientation: canvasSize.width > canvasSize.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvasSize.width, canvasSize.height]
        });

        for (let i = 0; i < canvases.length; i++) {
          const canvas = await html2canvas(canvases[i], { 
            scale: resolution,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null // Transparent background
          });
          
          const imgData = canvas.toDataURL('image/png');
          
          if (i > 0) pdf.addPage();
          
          // Ensure full canvas is captured
          pdf.addImage(
            imgData, 
            'PNG', 
            0, 
            0, 
            canvasSize.width, 
            canvasSize.height, 
            null, 
            'FAST'
          );
        }

        pdf.save('report.pdf');
      } else {
        for (let i = 0; i < canvases.length; i++) {
          const canvas = await html2canvas(canvases[i], { 
            scale: resolution,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null
          });
          
          const link = document.createElement('a');
          link.download = `report-page-${i + 1}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      }

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal-content bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Export Report</h2>
        <div className="export-options space-y-4">
          <select
            className="w-full p-2 border rounded"
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
          >
            <option value="pdf">PDF (All Pages)</option>
            <option value="image">High-Resolution Images</option>
          </select>
          
          <select
            className="w-full p-2 border rounded"
            value={resolution}
            onChange={(e) => setResolution(Number(e.target.value))}
          >
            <option value="1">Normal Resolution</option>
            <option value="2">High Resolution</option>
            <option value="3">Ultra High Resolution</option>
          </select>
        </div>
        
        <div className="modal-actions mt-6 flex space-x-4">
          <button 
            onClick={handleExport} 
            className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Export
          </button>
          <button 
            onClick={onClose} 
            className="flex-1 bg-gray-200 p-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;