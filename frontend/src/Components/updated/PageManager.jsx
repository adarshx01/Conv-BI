import { CircleX, Plus, Minus } from 'lucide-react';
import React, { useState } from 'react';

function PageManager({ pages, currentPageId, onPageAdd, onPageChange, onPageRemove, onCanvasResize }) {
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  const handleCanvasResize = (name, value) => {
    setCanvasSize((prevSize) => ({
      ...prevSize,
      [name]: parseInt(value, 10),
    }));
    onCanvasResize(currentPageId, { ...canvasSize, [name]: parseInt(value, 10) });
  };

  const handlePageAdd = () => {
    onPageAdd();
    onPageChange(pages.length + 1);
  };

  const handlePageRemove = (pageId) => {
    if (pages.length > 1) {
      onPageRemove(pageId);
      onPageChange(currentPageId > pageId ? currentPageId - 1 : currentPageId);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center mb-2">
        <p className='text-[1rem] mr-8'>Page : </p>
        <button
          className="px-2 py-1 mr-2 text-gray-600 border border-gray-600 rounded-md hover:bg-gray-200"
          onClick={() => handlePageRemove(currentPageId)}
          disabled={pages.length === 1}
        >
          <Minus size={16} />
        </button>
        <div className="px-2 py-1 font-semibold">{currentPageId}</div>
        <button
          className="px-2 py-1  ml-2 text-gray-600 border border-gray-600 rounded-md hover:bg-gray-200"
          onClick={handlePageAdd}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="flex flex-col mr-4">
          <label htmlFor="width" className="mb-1 text-gray-600">
            Width:
          </label>
          <input
            id="width"
            type="number"
            className="px-2 py-1 border border-gray-400 rounded-md"
            value={canvasSize.width}
            onChange={(e) => handleCanvasResize('width', e.target.value)}
            min="100"
            max="3000"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="height" className="mb-1 text-gray-600">
            Height:
          </label>
          <input
            id="height"
            type="number"
            className="px-2 py-1 border border-gray-400 rounded-md"
            value={canvasSize.height}
            onChange={(e) => handleCanvasResize('height', e.target.value)}
            min="100"
            max="3000"
          />
        </div>
      </div>

      <div className="flex flex-col items-center max-h-28 overflow-y-auto w-full overflow-y-auto">
        {pages.map((page) => (
          <div
            key={page.id}
            className={`flex items-center justify-between w-48 px-4 py-2 mb-2 border border-gray-400  cursor-pointer rounded-xl ${
              currentPageId === page.id ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            onClick={() => onPageChange(page.id)}
          >
            <div className="flex items-center mx-1">
              <span className="mr-2 font-semibold">Page {page.id}</span>
              {currentPageId === page.id && (
                <span className="px-2 py-1 text-white bg-green-500 rounded-md">
                  Current
                </span>
              )}
            </div>
            <button
              className="text-gray-600 hover:text-gray-800 ml-1"
              onClick={(e) => {
                e.stopPropagation();
                handlePageRemove(page.id);
              }}
            >
              <CircleX size={20}  />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PageManager;