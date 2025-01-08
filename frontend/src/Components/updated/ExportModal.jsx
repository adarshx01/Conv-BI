import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

function ExportModal({ onClose, pages }) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [progress, setProgress] = useState(0);
  // const [userName, setUserName] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setProgress(0);

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

  const preparePageForExport = async (pageId) => {
    const wrapper = document.querySelector(`.canvas-page-${pageId}`).parentElement;
    const canvas = document.querySelector(`.canvas-page-${pageId}`);
    
    if (!wrapper || !canvas) {
      throw new Error(`Canvas or wrapper for page ${pageId} not found`);
    }

    const originalWrapperClasses = wrapper.className;
    const originalWrapperDisplay = wrapper.style.display;
    const originalCanvasDisplay = canvas.style.display;

    wrapper.className = wrapper.className.replace('hidden', '').trim();
    wrapper.style.display = 'block';
    canvas.style.display = 'block';

    return () => {
      wrapper.className = originalWrapperClasses;
      wrapper.style.display = originalWrapperDisplay;
      canvas.style.display = originalCanvasDisplay;
    };
  };

  const exportToPDF = async () => {
    const pdf = new jsPDF({
      unit: 'px',
      format: [pages[0].canvasSize.width, pages[0].canvasSize.height],
      orientation: pages[0].canvasSize.width > pages[0].canvasSize.height ? 'l' : 'p'
    });

    for (let i = 0; i < pages.length; i++) {
      const cleanup = await preparePageForExport(pages[i].id);

      try {
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = document.querySelector(`.canvas-page-${pages[i].id}`);
        const scale = 4;
        
        const canvasImage = await html2canvas(canvas, {
          scale: scale,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: pages[i].canvasSize.width,
          height: pages[i].canvasSize.height,
          backgroundColor: 'white',
        });

        const imgData = canvasImage.toDataURL('image/jpeg', 1.0);

        if (i > 0) {
          pdf.addPage([pages[i].canvasSize.width, pages[i].canvasSize.height], 
                      pages[i].canvasSize.width > pages[i].canvasSize.height ? 'l' : 'p');
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pages[i].canvasSize.width, pages[i].canvasSize.height, '', 'FAST');

        // Add date, time, and username to bottom-right corner
        const now = new Date();
        const dateTimeString = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        // const footerText = `${dateTimeString}, created by ${userName}`;
        const footerText = `${dateTimeString}, created by [UserName]`;
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(footerText, pages[i].canvasSize.width - 10, pages[i].canvasSize.height - 10, { align: 'right' });

        setProgress(((i + 1) / pages.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 500));
      } finally {
        cleanup();
      }
    }

    pdf.save('report.pdf');
  };

  const exportToImages = async () => {
    for (let i = 0; i < pages.length; i++) {
      const cleanup = await preparePageForExport(pages[i].id);

      try {
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = document.querySelector(`.canvas-page-${pages[i].id}`);
        const scale = 4;
        
        const canvasImage = await html2canvas(canvas, {
          scale: scale,
          useCORS: true,
          allowTaint: true,
          width: pages[i].canvasSize.width,
          height: pages[i].canvasSize.height,
          backgroundColor: 'white',
        });

        // Add date, time, and username to bottom-right corner
        const ctx = canvasImage.getContext('2d');
        const now = new Date();
        const dateTimeString = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        // const footerText = `${dateTimeString}, created by ${userName}`;
        const footerText = `${dateTimeString}, created by [UserName]`;
        ctx.font = '10px Arial';
        ctx.fillStyle = 'rgba(100, 100, 100, 1)';
        ctx.textAlign = 'right';
        ctx.fillText(footerText, canvasImage.width - 10, canvasImage.height - 10);

        canvasImage.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `report-page-${i + 1}.png`);
          } else {
            console.error('Failed to create blob from canvas');
          }
        }, 'image/png');

        setProgress(((i + 1) / pages.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 500));
      } finally {
        cleanup();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Export Report</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
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
        {/* <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Your Name:
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-1 block w-full p-2 border rounded"
              placeholder="Enter your name"
            />
          </label>
        </div> */}

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {isExporting && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Exporting: {Math.round(progress)}%</p>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            // disabled={isExporting || !userName}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;

