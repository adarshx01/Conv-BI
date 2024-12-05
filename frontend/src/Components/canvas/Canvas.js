import React from 'react';
import { useDrop } from 'react-dnd';
import { Rnd } from 'react-rnd';
import ChartRenderer from './ChartRenderer';

function Canvas({ elements, setElements }) {
  const [, drop] = useDrop(() => ({
    accept: 'chart',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = document.querySelector('.canvas').getBoundingClientRect();
      const x = offset.x - canvasRect.left;
      const y = offset.y - canvasRect.top;
      addElement(item.type, { x, y });
    },
  }));

  const addElement = (type, position) => {
    const newElement = {
      id: Date.now(),
      type,
      position,
      size: { width: 300, height: 200 },
    };
    setElements((prevElements) => [...prevElements, newElement]);
  };

  const updateElement = (id, newProps) => {
    setElements((prevElements) =>
      prevElements.map((el) => (el.id === id ? { ...el, ...newProps } : el))
    );
  };

  return (
    <div ref={drop} className="canvas" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {elements.map((element) => (
        <Rnd
          key={element.id}
          size={{ width: element.size.width, height: element.size.height }}
          position={{ x: element.position.x, y: element.position.y }}
          onDragStop={(e, d) => updateElement(element.id, { position: { x: d.x, y: d.y } })}
          onResizeStop={(e, direction, ref, delta, position) => {
            updateElement(element.id, {
              size: { width: ref.style.width, height: ref.style.height },
              position,
            });
          }}
          bounds="parent"
        >
          <div className="chart-container" style={{ width: '100%', height: '100%' }}>
            <ChartRenderer type={element.type} />
          </div>
        </Rnd>
      ))}
    </div>
  );
}

export default Canvas;

