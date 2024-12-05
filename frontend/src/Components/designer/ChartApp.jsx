import React, { useState, useCallback, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ElementList from './ElementList';
import Canvas from './Canvas';
import ExportModal from './ExportModal';
import './styles/ChartApp.css';

function ChartApp() {
  const [pages, setPages] = useState([{ id: 1, elements: [] }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const [showGrid, setShowGrid] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  // Memoize page-related functions
  const handleAddPage = useCallback(() => {
    const newPageId = pages.length + 1;
    setPages(prevPages => [...prevPages, { id: newPageId, elements: [] }]);
    setCurrentPage(newPageId);
  }, [pages]);

  const handlePageChange = useCallback((pageId) => {
    setCurrentPage(pageId);
  }, []);

  // Optimize canvas size change
  const handleCanvasSizeChange = useCallback((e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setCanvasSize({ width: 1200, height: 800 });
    } else {
      const [width, height] = value.split('x').map(Number);
      setCanvasSize({ width, height });
    }
  }, []);

  const handleCustomSizeChange = useCallback((e) => {
    const { name, value } = e.target;
    setCanvasSize(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseInt(value, 10)
    }));
  }, []);

  // Memoize elements update
  const updateElements = useCallback((newElements) => {
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === currentPage ? { ...page, elements: newElements } : page
      )
    );
  }, [currentPage]);

  // Memoize current page elements
  const currentPageElements = useMemo(() => 
    pages.find(page => page.id === currentPage)?.elements || [], 
    [pages, currentPage]
  );

  // Memoize page buttons
  const PageButtons = useMemo(() => 
    pages.map(page => (
      <button
        key={page.id}
        onClick={() => handlePageChange(page.id)}
        className={currentPage === page.id ? 'active' : ''}
      >
        Page {page.id}
      </button>
    )), 
    [pages, currentPage, handlePageChange]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <header className="app-header">
          <h1>Report Builder</h1>
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={() => setShowExportModal(true)}>
              Export 📤
            </button>
          </div>
        </header>
        
        <div className="app-content">
          <ElementList />
          
          <div className="canvas-container">
            <div className="canvas-controls">
              <select
                value={`${canvasSize.width}x${canvasSize.height}`}
                onChange={handleCanvasSizeChange}
              >
                <option value="800x600">800 x 600</option>
                <option value="1200x800">1200 x 800</option>
                <option value="1920x1080">1920 x 1080</option>
                <option value="custom">Custom</option>
              </select>
              
              <div className="custom-size-inputs">
                <input
                  type="number"
                  name="width"
                  value={canvasSize.width}
                  onChange={handleCustomSizeChange}
                  placeholder="Width"
                  min="100"
                  max="3840"
                />
                <input
                  type="number"
                  name="height"
                  value={canvasSize.height}
                  onChange={handleCustomSizeChange}
                  placeholder="Height"
                  min="100"
                  max="2160"
                />
              </div>

              <button onClick={() => setShowGrid(!showGrid)}>
                {showGrid ? 'Hide Grid' : 'Show Grid'}
              </button>
            </div>

            <div className="page-controls">
              {PageButtons}
              <button onClick={handleAddPage}>Add Page</button>
            </div>

            <Canvas
              elements={currentPageElements}
              setElements={updateElements}
              canvasSize={canvasSize}
              showGrid={showGrid}
            />
          </div>
        </div>

        {showExportModal && (
          <ExportModal
            onClose={() => setShowExportModal(false)}
            pages={pages}
            canvasSize={canvasSize}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default React.memo(ChartApp);