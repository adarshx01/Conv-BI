import React, { useState, useRef, useEffect } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import DataSelector from './DataSelector';
import { TableElement } from './TableElement';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const getUniqueColors = (count) => {
  const hueStep = 360 / count;
  return Array.from({ length: count }, (_, i) => {
    let hue = i * hueStep;
    const randomVariation = (Math.random() - 0.5) * hueStep * 0.5;
    hue = (hue + randomVariation) % 360;     
    return `hsla(${hue}, 70%, 60%, 0.8)`;
  });
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          size: 12,
          family: 'Inter, sans-serif',
        },
        padding: 20,
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#000',
      bodyColor: '#666',
      borderColor: '#ddd',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart',
  },
};

function ElementRenderer({ element, onUpdate, customData }) {
  const [data, setData] = useState(element.data || null);
  const [chartData, setChartData] = useState(element.chartData || null);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (customData) {
      console.log("Custom data received:", customData);
    }
  }, [customData]);

  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      chart.options.devicePixelRatio = 2;
      chart.update();
    }
  }, [chartData]);

  const handleDataSelect = (selectedData, axisInfo) => {
    setError(null);
    if (selectedData && selectedData.length > 0) {
      if (element.type === 'table') {
        setData(selectedData);
        onUpdate(element.id, { data: selectedData });
      } else {
        const { xAxis, yAxis } = axisInfo;

        // Ensure xAxis is always an array
        const xAxisArray = Array.isArray(xAxis) ? xAxis : [xAxis];

        // Process X-axis data
        const xData = xAxisArray.map(x => {
          const [xTable, xColumn] = x.split('.');
          return selectedData.map(row => row[xColumn]);
        });

        // Process Y-axis data
        const datasets = yAxis.map((y, index) => {
          const [yTable, yColumn] = y.split('.');
          const yData = selectedData.map(row => {
            const value = parseFloat(row[yColumn]);
            return isNaN(value) ? null : value;
          });

          if (yData.every(val => val === null)) {
            setError(`No valid numeric data available for ${yColumn}. Please check your selection.`);
            return null;
          }

          const uniqueColors = getUniqueColors(yAxis.length);

          return {
            label: yColumn,
            data: yData,
            backgroundColor: element.type === 'pie' || element.type === 'halfPie' || element.type === 'hollowPie' 
              ? getUniqueColors(yData.length)
              : uniqueColors[index],
            borderColor: element.type === 'pie' || element.type === 'halfPie' || element.type === 'hollowPie'
              ? 'rgba(255, 255, 255, 0.8)'
              : uniqueColors[index].replace('0.8', '1'),
            borderWidth: 1,
            fill: element.type === 'area' || element.type === 'stackedBar',
            tension: 0.4,
          };
        }).filter(dataset => dataset !== null);

        if (datasets.length === 0) {
          setError("No valid data available for the selected columns. Please check your selection.");
          return;
        }

        const newChartData = {
          labels: xData[0], // Use the first X-axis column as labels
          datasets: datasets,
        };

        setChartData(newChartData);
        onUpdate(element.id, { chartData: newChartData });
      }
    } else {
      setError("No data returned from the query. Please check your selection and try again.");
    }
  };

  const renderChart = () => {
    if (!chartData) return null;

    const ChartComponent = {
      bar: Bar,
      stackedBar: Bar,
      stripedBar: Bar,
      line: Line,
      lineWithValues: Line,
      area: Line,
      pie: Pie,
      halfPie: Pie,
      hollowPie: Doughnut,
      barLine: Bar,
    }[element.type] || Bar;  // Default to Bar if type is not recognized

    const chartSpecificOptions = {
      ...chartOptions,
      indexAxis: element.type === 'stripedBar' ? 'y' : 'x',
      scales: {
        x: {
          ...chartOptions.scales.x,
          stacked: element.type === 'stackedBar' || element.type === 'stripedBar',
          title: {
            display: true,
            text: Array.isArray(element.xAxis) ? element.xAxis.join(', ') : element.xAxis,
          },
        },
        y: {
          ...chartOptions.scales.y,
          stacked: element.type === 'stackedBar' || element.type === 'stripedBar',
          title: {
            display: true,
            text: chartData.datasets.map(ds => ds.label).join(', '),
          },
        },
      },
      plugins: {
        ...chartOptions.plugins,
        legend: {
          ...chartOptions.plugins.legend,
          display: element.type !== 'bar' && element.type !== 'line',
        },
      },
    };

    // Pie chart specific handling
    if (element.type === 'pie' || element.type === 'halfPie' || element.type === 'hollowPie') {
      const pieChartData = {
        labels: chartData.labels,
        datasets: [{
          data: chartData.datasets[0].data,
          backgroundColor: getUniqueColors(chartData.datasets[0].data.length),
          borderColor: 'rgba(255, 255, 255, 0.8)',
          borderWidth: 2,
        }],
      };

      const pieOptions = {
        ...chartSpecificOptions,
        ...(element.type === 'halfPie' && {
          rotation: -90,
          circumference: 180,
        }),
      };

      return (
        <div id={`chart-${element.id}`} className="w-full h-full p-4 bg-white rounded-lg shadow-sm">
          <ChartComponent
            ref={chartRef}
            data={pieChartData}
            options={pieOptions}
          />
        </div>
      );
    }

    return (
      <div id={`chart-${element.id}`} className="w-full h-full p-4 bg-white rounded-lg shadow-sm">
        <ChartComponent
          ref={chartRef}
          data={chartData}
          options={chartSpecificOptions}
        />
      </div>
    );
  };

  switch (element.type) {
    case 'table':
      return data ? (
        <TableElement data={data} />
      ) : (
        <DataSelector onDataSelect={handleDataSelect} />
      );
    case 'bar':
    case 'stackedBar':
    case 'stripedBar':
    case 'line':
    case 'lineWithValues':
    case 'area':
    case 'pie':
    case 'halfPie':
    case 'hollowPie':
    case 'barLine':
      return chartData ? renderChart() : (
        error ? (
          <div className="w-full h-full flex items-center justify-center bg-red-100 p-4 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <DataSelector onDataSelect={handleDataSelect} />
        )
      );
    case 'text':
      return (
        <div
          contentEditable
          suppressContentEditableWarning
          className="w-full h-full p-2 bg-white rounded-lg shadow-sm"
          onBlur={(e) => onUpdate(element.id, { content: e.target.textContent })}
        >
          {element.content || 'Double click to edit'}
        </div>
      );
    case 'image':
      return (
        <div className="w-full h-full bg-white rounded-lg shadow-sm overflow-hidden">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  onUpdate(element.id, { imageUrl: e.target.result });
                };
                reader.readAsDataURL(file);
              }
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {element.imageUrl ? (
            <img
              src={element.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400">
              Click to upload image
            </div>
          )}
        </div>
      );
    case 'shape':
      return (
        <div
          className="w-full h-full bg-blue-500 rounded-lg"
          style={{ clipPath: element.shape === 'circle' ? 'circle(50% at 50% 50%)' : 'none' }}
        />
      );
    case 'emoji':
      return (
        <div className="w-full h-full flex items-center justify-center text-6xl bg-white rounded-lg shadow-sm">
          {element.content || '😊'}
        </div>
      );
    default:
      return <div>Unsupported element type</div>;
  }
}

export default ElementRenderer;