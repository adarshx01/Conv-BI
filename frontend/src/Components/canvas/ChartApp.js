import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ChartList from './ChartList';
import Canvas from './Canvas';
import './ChartApp.css';

function ChartApp() {
  const [elements, setElements] = useState([]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <header className="app-header">
          <h1>Report Builder</h1>
          <button className="export-button">Export</button>
        </header>
        <div className="app-content">
          <ChartList />
          <Canvas elements={elements} setElements={setElements} />
        </div>
      </div>
    </DndProvider>
  );
}

export default ChartApp;

