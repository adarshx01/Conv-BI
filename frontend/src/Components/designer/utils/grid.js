export const snapToGrid = (value, gridSize) => {
  return Math.round(value / gridSize) * gridSize;
};

export const calculateGridPosition = (offset, canvasRect, gridSize) => {
  if (!offset) return { x: 0, y: 0 };
  
  const x = snapToGrid(offset.x - canvasRect.left, gridSize);
  const y = snapToGrid(offset.y - canvasRect.top, gridSize);
  
  return { x, y };
};

export const findNearestEmptySpace = (position, elements, canvasSize, elementSize) => {
  // Basic collision detection and space finding logic
  let foundPosition = position;
  let collision = true;
  
  while (collision) {
    collision = elements.some(el => 
      el.position.x < foundPosition.x + elementSize.width &&
      el.position.x + el.size.width > foundPosition.x &&
      el.position.y < foundPosition.y + elementSize.height &&
      el.position.y + el.size.height > foundPosition.y
    );
    
    if (collision) {
      foundPosition.x += 10;
      if (foundPosition.x + elementSize.width > canvasSize.width) {
        foundPosition.x = 0;
        foundPosition.y += 10;
      }
    }
  }
  
  return foundPosition;
};

export const checkCollision = (newElement, elements) => {
  return elements.some(element => 
    element.position.x < newElement.position.x + newElement.size.width &&
    element.position.x + element.size.width > newElement.position.x &&
    element.position.y < newElement.position.y + newElement.size.height &&
    element.position.y + element.size.height > newElement.position.y
  );
};