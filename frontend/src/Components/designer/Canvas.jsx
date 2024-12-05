import React from 'react';
import { useDrop } from 'react-dnd';
import { Rnd } from 'react-rnd';
import ElementRenderer from './ElementRenderer';
import { 
  snapToGrid, 
  calculateGridPosition, 
  findNearestEmptySpace 
} from './utils/grid';

function Canvas({ elements = [], setElements, canvasSize, showGrid }) {
  const gridSize = 10;

  const [, drop] = useDrop(() => ({
    accept: 'element',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = document.querySelector('.canvas')?.getBoundingClientRect();
      
      if (!canvasRect || !offset) return;

      const position = calculateGridPosition(offset, canvasRect, gridSize);
      
      addElement(item.type, item.category, position);
    },
  }));

  const addElement = (type, category, position) => {
    const newElement = {
      id: Date.now(),
      type,
      category,
      position,
      size: getDefaultSize(type),
      content: type === 'Text' ? 'Edit Text' : null
    };

    // Find nearest empty space
    const adjustedPosition = findNearestEmptySpace(
      position, 
      elements, 
      canvasSize, 
      newElement.size
    );
    newElement.position = adjustedPosition;

    setElements([...elements, newElement]);
  };

  const getDefaultSize = (type) => {
    switch (type) {
      case 'Text': return { width: 200, height: 100 };
      case 'Image': return { width: 300, height: 200 };
      case 'Bar':
      case 'Line':
      case 'Pie': return { width: 400, height: 300 };
      default: return { width: 200, height: 200 };
    }
  };

  const updateElement = (id, newProps) => {
    setElements(
      elements.map(el => 
        el.id === id ? { ...el, ...newProps } : el
      )
    );
  };

  const removeElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
  };

  return (
    <div
      ref={drop}
      className="canvas"
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #ccc'
      }}
    >
      {showGrid && (
        <div 
          className="grid-overlay" 
          style={{ 
            gridTemplateColumns: `repeat(${canvasSize.width / gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${canvasSize.height / gridSize}, 1fr)`
          }}
        >
          {Array.from({ 
            length: (canvasSize.width / gridSize) * (canvasSize.height / gridSize) 
          }).map((_, i) => (
            <div key={i} className="grid-cell" />
          ))}
        </div>
      )}

      {elements.map((element) => (
        <Rnd
          key={element.id}
          size={{ width: element.size.width, height: element.size.height }}
          position={{ x: element.position.x, y: element.position.y }}
          onDragStop={(e, d) => {
            updateElement(element.id, { 
              position: { 
                x: snapToGrid(d.x, gridSize), 
                y: snapToGrid(d.y, gridSize) 
              } 
            });
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            updateElement(element.id, {
              size: {
                width: snapToGrid(ref.offsetWidth, gridSize),
                height: snapToGrid(ref.offsetHeight, gridSize)
              },
              position: {
                x: snapToGrid(position.x, gridSize),
                y: snapToGrid(position.y, gridSize)
              }
            });
          }}
          bounds="parent"
          dragGrid={[gridSize, gridSize]}
          resizeGrid={[gridSize, gridSize]}
        >
          <div className="element-container">
            <ElementRenderer 
              element={element} 
              updateElement={updateElement} 
            />
            <button 
              className="remove-button" 
              onClick={() => removeElement(element.id)}
            >
              ×
            </button>
          </div>
        </Rnd>
      ))}
    </div>
  );
}

export default Canvas;