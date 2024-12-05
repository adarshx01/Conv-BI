import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  BarChart2, 
  PieChart, 
  LineChart, 
  Type, 
  Image, 
  Square, 
  Circle, 
  Triangle,
  Smile,
} from 'lucide-react';

const ElementType = ({ type, icon: Icon, category }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'element',
    item: { type, category },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="element-item"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Icon size={24} />
      <span>{type}</span>
    </div>
  );
};

const categories = [
  {
    name: 'Charts',
    items: [
      { type: 'Bar', icon: BarChart2 },
      { type: 'Line', icon: LineChart },
      { type: 'Pie', icon: PieChart },
      { type: 'Gauge', icon: PieChart },
    ],
  },
  {
    name: 'Basic',
    items: [
      { type: 'Text', icon: Type },
      { type: 'Image', icon: Image },
    ],
  },
  {
    name: 'Shapes',
    items: [
      { type: 'Rectangle', icon: Square },
      { type: 'Circle', icon: Circle },
      { type: 'Triangle', icon: Triangle },
    ],
  },
  {
    name: 'Icons',
    items: [
      { type: 'Emoji', icon: Smile },
    ],
  },
];

function ElementList() {
  return (
    <div className="sidebar">
      <input
        type="search"
        placeholder="Search Visualizers..."
        className="m-4"
      />
      <div className="element-list">
        {categories.map((category) => (
          <div key={category.name} className="element-category">
            <h3>{category.name}</h3>
            <div className="element-grid">
              {category.items.map((item) => (
                <ElementType
                  key={item.type}
                  type={item.type}
                  icon={item.icon}
                  category={category.name.toLowerCase()}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ElementList;

