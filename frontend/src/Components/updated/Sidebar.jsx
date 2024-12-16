import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { BarChart, LineChart, PieChart, AreaChart, Layers, BarChartHorizontal, PieChartIcon, Donut, TrendingUp, Image, Type, Square, Circle, Triangle, Smile, Table, Star, Share, ShareIcon, Save, Upload } from 'lucide-react';
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
    { type: 'lineWithValues', icon: TrendingUp, label: 'Line + Value' },
    { type: 'area', icon: AreaChart, label: 'Area Chart' },
    { type: 'pie', icon: PieChart, label: 'Pie Chart' },
    { type: 'halfPie', icon: PieChartIcon, label: 'Half Pie' },
    { type: 'hollowPie', icon: Donut, label: 'Hollow Pie' },
    { type: 'barLine', icon: BarChart, label: 'Bar + Line' },
  ],
  data: [
    { 
      type: 'table', 
      icon: Table, 
      label: 'Import Data',
    }
  ],
};

function Sidebar({ onElementAdd, pages, currentPageId, onPageAdd, onPageChange, onPageRemove, onCanvasResize, onExport, onSave, onLoad }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('charts');

  const filteredElements = elementCategories[activeCategory].filter(element =>
    element.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sidebar">
      <div className='my-3 mx-auto flex flex-row'>
        <button 
          onClick={onSave} 
          className='flex items-center border-2 rounded-3xl px-3 mx-1 h-10 space-x-2 hover:bg-green-300 focus:bg-violet-400'>
          <Save className='w-5 h-5' /> 
          <span>Save Report</span>
        </button>

        <button 
          onClick={onLoad} 
          className='flex items-center border-2 rounded-3xl px-3 mx-1 h-10 space-x-2 hover:bg-green-300 focus:bg-violet-400'>
          <Upload className='w-5 h-5' /> 
          <span>Load Report</span>
        </button>

        <button 
          onClick={onExport} 
          className='flex items-center border-2 rounded-3xl px-3 mx-1 h-10 space-x-2 hover:bg-green-300 focus:bg-violet-400'>
          <ShareIcon className='w-5 h-5' /> 
          <span>Export</span>
        </button>
      </div>

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
            className={`category-button ${activeCategory === category ? 'active bg-orange-200' : 'bg-violet-400'} px-2 rounded-3xl   border-2 mx-0.5`}
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
      <div className='p-2 border-2 mx-4  rounded-xl mt-24'>
        <p className='font-semibold text-[1rem] text-center'>Page Settings</p>
        <hr className='mb-4'></hr>
        <PageManager
          pages={pages}
          currentPageId={currentPageId}
          onPageAdd={onPageAdd}
          onPageChange={onPageChange}
          onPageRemove={onPageRemove}
          onCanvasResize={onCanvasResize}
        />
      </div>
    </div>
  );
}

export default Sidebar;

