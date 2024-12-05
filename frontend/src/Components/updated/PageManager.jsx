import { CircleX } from 'lucide-react';
import React from 'react';

function PageManager({ pages, currentPageId, onPageAdd, onPageChange, onCanvasResize }) {
  const handleCanvasResize = (e) => {
    const { name, value } = e.target;
    const currentPage = pages.find(page => page.id === currentPageId);
    onCanvasResize({
      ...currentPage.canvasSize,
      [name]: parseInt(value, 10)
    });
  };

  return (
    <div className="page-manager">
      <div className="page-controls">
        {pages.map(page => (
          <button
            key={page.id}
            onClick={() => onPageChange(page.id)}
            className={currentPageId === page.id ? 'active' : ''}
          >
          <span className='flex items-center'>Page {page.id} {currentPageId === page.id && <CircleX className='text-red-500 ml-2 cursor-pointer hover:text-red-600 w-5 h-5'/>}</span>
          
          </button>
        ))}
        <button onClick={onPageAdd}>+ Add Page</button>
      </div>
      <div className="canvas-size-controls">
        <label>
          Width:
          <input
            type="number"
            name="width"
            value={pages.find(page => page.id === currentPageId).canvasSize.width}
            onChange={handleCanvasResize}
            min="100"
            max="3000"
          />
        </label>
        <label>
          Height:
          <input
            type="number"
            name="height"
            value={pages.find(page => page.id === currentPageId).canvasSize.height}
            onChange={handleCanvasResize}
            min="100"
            max="3000"
          />
        </label>
      </div>
    </div>
  );
}

export default PageManager;

