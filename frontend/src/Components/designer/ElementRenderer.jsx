import React, { useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const sampleData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Dataset 1',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

function ElementRenderer({ element, updateElement }) {
  const [imageUrl, setImageUrl] = useState('/placeholder.svg');

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `${element.type} Chart`,
      },
    },
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
        updateElement(element.id, { imageData: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  switch (element.type) {
    case 'Bar':
      return <Bar data={sampleData} options={options} />;
    case 'Line':
      return <Line data={sampleData} options={options} />;
    case 'Pie':
      return <Pie data={sampleData} options={options} />;
    case 'Text':
      return (
        <div
          contentEditable
          suppressContentEditableWarning
          className="w-full h-full p-2 focus:outline-none text-center"
          onBlur={(e) => updateElement(element.id, { content: e.target.textContent })}
        >
          {element.content || 'Double click to edit text'}
        </div>
      );
    case 'Image':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <img
            src={element.imageData || imageUrl}
            alt="Selected"
            className="max-w-full max-h-full object-contain"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2"
          />
        </div>
      );
    case 'Rectangle':
      return (
        <div 
          className="w-full h-full border-2 border-blue-500" 
          style={{ 
            borderRadius: '4px',
            boxSizing: 'border-box'
          }} 
        />
      );
    case 'Circle':
      return (
        <div 
          className="w-full h-full border-2 border-green-500 rounded-full" 
          style={{ 
            boxSizing: 'border-box'
          }} 
        />
      );
    case 'Triangle':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div
            style={{
              width: '0',
              height: '0',
              borderLeft: '50% solid transparent',
              borderRight: '50% solid transparent',
              borderBottom: '100% solid #ef4444',
              boxSizing: 'border-box'
            }}
          />
        </div>
      );
    case 'Emoji':
      return (
        <div className="w-full h-full flex items-center justify-center text-6xl">
          😊
        </div>
      );
    case 'Gauge':
      const gaugeData = {
        labels: ['Progress'],
        datasets: [{
          data: [75],
          backgroundColor: ['rgba(54, 162, 235, 0.8)'],
          circumference: 180,
          rotation: 270,
        }]
      };
      const gaugeOptions = {
        ...options,
        plugins: {
          ...options.plugins,
          tooltip: { enabled: false },
        },
        cutout: '75%',
      };
      return <Pie data={gaugeData} options={gaugeOptions} />;
    default:
      return <div>Unsupported element type</div>;
  }
}

export default ElementRenderer;