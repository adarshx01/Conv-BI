import React from 'react';
import { useDrag } from 'react-dnd';
import { BarChart, PieChart } from 'react-feather';
import { LineChart } from 'recharts';

const ChartType = ({ type, icon: Icon }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'chart',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`chart-type ${isDragging ? 'dragging' : ''}`}
    >
      <Icon />
      <span>{type} Chart</span>
    </div>
  );
};

function ChartList({ addElement }) {
  return (
    <div className="chart-list">
      <h2>Charts</h2>
      <ChartType type="Bar" icon={BarChart} />
      <ChartType type="Line" icon={LineChart} />
      <ChartType type="Pie" icon={PieChart} />
    </div>
  );
}

export default ChartList;

