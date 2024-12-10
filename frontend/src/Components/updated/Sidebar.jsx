import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  AreaChart, 
  Layers, 
  BarChartHorizontal, 
  PieChartIcon, 
  Donut, 
  TrendingUp, 
  Image, 
  Type, 
  Square, 
  Circle, 
  Triangle, 
  Smile, 
  Table, 
  Star
} from 'lucide-react';
import PageManager from './PageManager';

const DraggableElement = ({ type, icon: Icon, label, onAdd }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'element',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="element-item"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onAdd({ type })}
    >
      <Icon size={24} />
      <span>{label || type}</span>
    </div>
  );
};

const elementCategories = {
  basic: [
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'image', icon: Image, label: 'Image' },
  ],
  charts: [
    { type: 'bar', icon: BarChart, label: 'Bar Chart' },
    { type: 'stackedBar', icon: Layers, label: 'Stacked Bar' },
    { type: 'stripedBar', icon: BarChartHorizontal, label: 'Striped Bar' },
    { type: 'line', icon: LineChart, label: 'Line Chart' },
    { type: 'lineWithValues', icon: TrendingUp, label: 'Line with Values' },
    { type: 'area', icon: AreaChart, label: 'Area Chart' },
    { type: 'pie', icon: PieChart, label: 'Pie Chart' },
    { type: 'halfPie', icon: PieChartIcon, label: 'Half Pie Chart' },
    { type: 'hollowPie', icon: Donut, label: 'Hollow Pie Chart' },
    { type: 'barLine', icon: BarChart, label: 'Bar + Line Chart' },
  ],
  data: [
    { 
      type: 'table', 
      icon: Table, 
      label: 'Import Data',
    }
  ],
};

function Sidebar({ onElementAdd, pages, currentPageId, onPageAdd, onPageChange, onPageRemove, onCanvasResize }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('charts');

  const filteredElements = elementCategories[activeCategory].filter(element =>
    element.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sidebar">
      <PageManager
        pages={pages}
        currentPageId={currentPageId}
        onPageAdd={onPageAdd}
        onPageChange={onPageChange}
        onPageRemove={onPageRemove}
        onCanvasResize={onCanvasResize}
      />
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search elements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="sidebar-categories mx-auto ">
        {Object.keys(elementCategories).map(category => (
          <button
            key={category}
            className={`category-button ${activeCategory === category ? 'active' : ''} px-2 rounded-3xl bg-violet-400 border-2 mx-0.5`}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      <div className="element-list ">
        {filteredElements.map((element) => (
          <DraggableElement
            key={element.type}
            {...element}
            onAdd={onElementAdd}
          />
        ))}
      </div>
    </div>
  );
}

export default Sidebar;