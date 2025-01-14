import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { Rnd } from 'react-rnd';
import ElementRenderer from './ElementRenderer';
import { CircleX } from 'lucide-react';

function Canvas({ elements, setElements, canvasSize, pageId, isActive }) {
  const [hoveredElement, setHoveredElement] = useState(null);
  const [, drop] = useDrop(() => ({
    accept: 'element',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = document.querySelector(`.canvas-page-${pageId}`).getBoundingClientRect();
      
      const position = {
        x: offset.x - canvasRect.left,
        y: offset.y - canvasRect.top,
      };

      const newElement = {
        id: Date.now(),
        type: item.type,
        position,
        size: { width: 400, height: 300 },
      };

      setElements([...elements, newElement]);
    },
  }));

  const handleElementUpdate = (id, updates) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const handleElementRemove = (id) => {
    setElements(elements.filter(el => el.id !== id));
  };

  // Grid size in pixels
  const gridSize = 10;

  return (
    <div 
      className={`canvas-wrapper ${isActive ? '' : 'hidden'}`} 
      style={{ overflow: 'auto', maxHeight: '80vh' }}
    >
      <div
        ref={drop}
        className={`canvas canvas-page-${pageId}`}
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          position: 'relative',
          backgroundColor: 'white',
          backgroundImage: `
            linear-gradient(to right, #f0f0f0 1px, transparent 1px),
            linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          margin: '0 auto',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          display: isActive ? 'block' : 'none', // Hide inactive pages
        }}
      >
        {elements.map((element) => (
          <Rnd
            key={element.id}
            size={{ width: element.size.width, height: element.size.height }}
            position={{ x: element.position.x, y: element.position.y }}
            onDragStop={(e, d) => {
              // Snap to grid
              const newX = Math.round(d.x / gridSize) * gridSize;
              const newY = Math.round(d.y / gridSize) * gridSize;
              handleElementUpdate(element.id, { 
                position: { x: newX, y: newY } 
              });
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              // Snap size to grid
              const newWidth = Math.round(parseInt(ref.style.width, 10) / gridSize) * gridSize;
              const newHeight = Math.round(parseInt(ref.style.height, 10) / gridSize) * gridSize;
              handleElementUpdate(element.id, {
                size: {
                  width: newWidth,
                  height: newHeight,
                },
                position,
              });
            }}
            bounds="parent"
            dragGrid={[gridSize, gridSize]}
            resizeGrid={[gridSize, gridSize]}
          >
            <div 
              className="canvas-element relative" 
              style={{ 
                width: '100%', 
                height: '100%',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
              onMouseEnter={() => setHoveredElement(element.id)}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <ElementRenderer element={element} onUpdate={handleElementUpdate} />
              {hoveredElement === element.id && (
                <div className="element-controls absolute top-2 right-2">
                  <button type="button" class="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  onClick={() => handleElementRemove(element.id)}>
                    <span class="sr-only">Close menu</span>
                    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </Rnd>
        ))}
      </div>
    </div>
  );
}

export default Canvas;
