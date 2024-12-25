import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

function ExportModal({ onClose, pages }) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [exportFormat, setExportFormat] = useState('pdf');

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      if (exportFormat === 'pdf') {
        await exportToPDF();
      } else {
        await exportToImages();
      }
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      setError('Export failed due to a temporary issue. Please try exporting again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    const pdf = new jsPDF({
      orientation: (pages[0].canvasSize.width>=pages[0].canvasSize.height)?'l':'p',
      unit: 'px',
      format: [pages[0].canvasSize.width, pages[0].canvasSize.height],
    });

    for (let i = 0; i < pages.length; i++) {
      const canvas = document.querySelector(`.canvas-page-${pages[i].id}`);
      if (!canvas) throw new Error(`Canvas for page ${pages[i].id} not found`);

      // Ensure the canvas is visible before capturing
      canvas.style.display = 'block';
  
      const scale = 2; // Increase scale for higher resolution
      const canvasImage = await html2canvas(canvas, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: pages[i].canvasSize.width,
        height: pages[i].canvasSize.height,
      });

      // Hide the canvas again if it's not the current page
      if (i !== pages.findIndex(p => p.id === pages[i].id)) {
        canvas.style.display = 'none';
      }

      const imgData = canvasImage.toDataURL('image/jpeg', 1.0);

      if (i > 0) {
        pdf.addPage([pages[i].canvasSize.width, pages[i].canvasSize.height]);
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, pages[i].canvasSize.width, pages[i].canvasSize.height, '', 'FAST');

      // Add a small delay between pages to ensure proper rendering
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    pdf.save('report.pdf');
  };

  const exportToImages = async () => {
    for (let i = 0; i < pages.length; i++) {
      const canvas = document.querySelector(`.canvas-page-${pages[i].id}`);
      if (!canvas) throw new Error(`Canvas for page ${pages[i].id} not found`);

      // Ensure the canvas is visible before capturing
      canvas.style.display = 'block';

      const scale = 2; // Increase scale for higher resolution
      const canvasImage = await html2canvas(canvas, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        width: pages[i].canvasSize.width,
        height: pages[i].canvasSize.height,
      });

      // Hide the canvas again if it's not the current page
      if (i !== pages.findIndex(p => p.id === pages[i].id)) {
        canvas.style.display = 'none';
      }

      canvasImage.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `report-page-${i + 1}.png`);
        } else {
          console.error('Failed to create blob from canvas');
        }
      }, 'image/png');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Export Report</h2>
          <button onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <label>
            Export Format:
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="ml-2 p-1 border rounded"
            >
              <option value="pdf">PDF</option>
              <option value="image">Images</option>
            </select>
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleExport} className="export-button" disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
