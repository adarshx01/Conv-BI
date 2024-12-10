import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import ExportModal from './ExportModal';
import './styles/App.css';

function App() {
  const [showExportModal, setShowExportModal] = useState(false);
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
                  size: { width: 400, height: 300 }
                }
              ]
            }
          : page
      )
    );
  };

  const handlePageAdd = () => {
    const newPageId = pages.length + 1;
    setPages([...pages, { id: newPageId, elements: [], canvasSize: { width: 1200, height: 800 } }]);
    setCurrentPageId(newPageId);
  };

  const handlePageChange = (pageId) => {
    setCurrentPageId(pageId);
  };

  const handlePageRemove = (pageId) => {
    if (pages.length > 1) {
      setPages(prevPages => prevPages.filter(page => page.id !== pageId));
      setCurrentPageId(currentPageId > pageId ? currentPageId - 1 : currentPageId);
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        {/* <Navbar onExport={handleExport} /> */}
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
          />
        </div>
        {showExportModal && (
          <ExportModal
            onClose={() => setShowExportModal(false)}
            pages={pages}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App;