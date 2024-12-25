import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import ExportModal from './ExportModal';
import LoadReportModal from './LoadReportModal';
import SaveReportModal from './SaveReportModal';
import './styles/App.css';

function App() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pages, setPages] = useState([
    { id: 1, elements: [], canvasSize: { width: 1200, height: 800 } }
  ]);
  const [currentPageId, setCurrentPageId] = useState(1);

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleElementAdd = (element) => {
    setPages(prevPages =>
      prevPages.map(page =>
        page.id === currentPageId
          ? {
            ...page,
            elements: [
              ...page.elements,
              {
                ...element,
                id: Date.now(),
                position: { x: 0, y: 0 },
                size: { width: 400, height: 300 },
                axisInfo: { xAxis: [], yAxis: [] } // Initialize with empty arrays
              }
            ]
          }
        : page
      )
    );
  };

  const handlePageAdd = () => {
    const newPageId = Math.max(...pages.map(page => page.id)) + 1;
    setPages([...pages, { id: newPageId, elements: [], canvasSize: { width: 1200, height: 800 } }]);
    setCurrentPageId(newPageId);
  };

  const handlePageChange = (pageId) => {
    setCurrentPageId(pageId);
  };

  const handlePageRemove = (pageId) => {
    if (pages.length > 1) {
      setPages(prevPages => prevPages.filter(page => page.id !== pageId));
      setCurrentPageId(prev => prev === pageId ? Math.min(...pages.map(p => p.id).filter(id => id !== pageId)) : prev);
    }
  };

  const handleCanvasResize = (pageId, newSize) => {
    setPages(prevPages =>
      prevPages.map(page =>
        page.id === pageId ? { ...page, canvasSize: newSize } : page
      )
    );
  };

  const handleElementsUpdate = (pageId, newElements) => {
    setPages(prevPages =>
      prevPages.map(page =>
        page.id === pageId ? { ...page, elements: newElements } : page
      )
    );
  };

  const handleSaveReport = () => {
    setShowSaveModal(true);
  };

  const handleLoadReport = () => {
    setShowLoadModal(true);
  };

  const onReportSaved = (savedReport) => {
    console.log('Report saved:', savedReport);
    // You can add any additional logic here after a report is saved
  };

  const onReportLoaded = (loadedReport) => {
    if (loadedReport && loadedReport.pages && loadedReport.currentPageId) {
      setPages(loadedReport.pages);
      setCurrentPageId(loadedReport.currentPageId);
    } else {
      console.error('Invalid report data structure:', loadedReport);
      // You might want to show an error message to the user here
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <div className="main-content">
          <div className="canvas-container">
            {pages.map(page => (
              <Canvas
                key={page.id}
                elements={page.elements}
                setElements={(newElements) => handleElementsUpdate(page.id, newElements)}
                canvasSize={page.canvasSize}
                pageId={page.id}
                isActive={page.id === currentPageId}
              />
            ))}
          </div>
          <Sidebar
            onElementAdd={handleElementAdd}
            pages={pages}
            currentPageId={currentPageId}
            onPageAdd={handlePageAdd}
            onPageChange={handlePageChange}
            onPageRemove={handlePageRemove}
            onCanvasResize={handleCanvasResize}
            onExport={handleExport}
            onSave={handleSaveReport}
            onLoad={handleLoadReport}
          />
        </div>
        {showExportModal && (
          <ExportModal
            onClose={() => setShowExportModal(false)}
            pages={pages}
          />
        )}
        {showLoadModal && (
          <LoadReportModal
            onClose={() => setShowLoadModal(false)}
            onLoad={onReportLoaded}
          />
        )}
        {showSaveModal && (
          <SaveReportModal
            onClose={() => setShowSaveModal(false)}
            onSave={onReportSaved}
            reportData={{ pages, currentPageId }}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App;

