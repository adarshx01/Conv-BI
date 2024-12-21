import React, { useState, useRef, useEffect } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
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
    const hue = (i * hueStep) % 360;
    return `hsla(${hue}, 100%, 50%, 0.8)`;
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#fff',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      display: true,
      beginAtZero: true,
      grid: {
        display: false,
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

const BarLineChart = ({ data, options }) => {
  return (
    <Bar
      data={{
        ...data,
        datasets: data.datasets.map((dataset, index) => ({
          ...dataset,
          type: index === 0 ? 'bar' : 'line',
        })),
      }}
      options={options}
    />
  );
};

function ElementRenderer({ element, onUpdate, customData }) {
  const [data, setData] = useState(element.data || null);
  const [chartData, setChartData] = useState(element.chartData || null);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (customData) {
      console.log("Custom data received:", customData);
      handleDataSelect(customData, element.axisInfo);
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

        // Check if the data is in the monthly/yearly format
        const isAggregatedData = selectedData[0].hasOwnProperty('period');

        let labels, datasets;

        if (isAggregatedData) {
          // Process aggregated data (monthly/yearly)
          labels = selectedData.map(item => item.period);
          const metrics = Object.keys(selectedData[0]).filter(key => key !== 'period');
        
          datasets = metrics.flatMap(metric => {
            const highestData = selectedData.map(item => item[metric]?.highest);
            const lowestData = selectedData.map(item => item[metric]?.lowest);
            const averageData = selectedData.map(item => item[metric]?.average);

            return [
              {
                label: `${metric} (Highest)`,
                data: highestData,
                backgroundColor: getUniqueColors(metrics.length * 3)[0],
                borderColor: getUniqueColors(metrics.length * 3)[0],
                borderWidth: 2,
                fill: false,
              },
              {
                label: `${metric} (Lowest)`,
                data: lowestData,
                backgroundColor: getUniqueColors(metrics.length * 3)[1],
                borderColor: getUniqueColors(metrics.length * 3)[1],
                borderWidth: 2,
                fill: false,
              },
              {
                label: `${metric} (Average)`,
                data: averageData,
                backgroundColor: getUniqueColors(metrics.length * 3)[2],
                borderColor: getUniqueColors(metrics.length * 3)[2],
                borderWidth: 2,
                fill: false,
              }
            ];
          });
        } else {
          // Process regular data
          // Process X-axis data
          const xData = xAxisArray.map(x => {
            const [xTable, xColumn] = x.split('.');
            return selectedData.map(row => row[xColumn]);
          });

          // Combine data points with the same x-axis value
          const combinedData = {};
          xData[0].forEach((xValue, index) => {
            if (!combinedData[xValue]) {
              combinedData[xValue] = {};
              yAxis.forEach(y => {
                const [yTable, yColumn] = y.split('.');
                combinedData[xValue][yColumn] = 0;
              });
            }
            yAxis.forEach(y => {
              const [yTable, yColumn] = y.split('.');
              const value = parseFloat(selectedData[index][yColumn]);
              if (!isNaN(value)) {
                combinedData[xValue][yColumn] += value;
              }
            });
          });

          labels = Object.keys(combinedData);

          // Process Y-axis data
          datasets = yAxis.map((y, index) => {
            const [yTable, yColumn] = y.split('.');
            const yData = labels.map(label => combinedData[label][yColumn]);

            if (yData.every(val => val === null)) {
              setError(`No valid numeric data available for ${yColumn}. Please check your selection.`);
              return null;
            }

            const uniqueColors = getUniqueColors(yAxis.length);

            return {
              label: yColumn,
              data: yData,
              backgroundColor: element.type === 'barLine' && index === 0 ? uniqueColors[index] : (element.type === 'pie' || element.type === 'halfPie' || element.type === 'hollowPie' ? getUniqueColors(yData.length) : 'transparent'),
              borderColor: element.type === 'pie' || element.type === 'halfPie' || element.type === 'hollowPie' ? 'rgba(255, 255, 255, 1)' : uniqueColors[index],
              borderWidth: 2,
              fill: element.type === 'area' || element.type === 'stackedBar',
              tension: 0.4,
              ...(element.type === 'barLine' && index > 0 && { type: 'line' }),
            };
          }).filter(dataset => dataset !== null);
        }

        if (datasets.length === 0) {
          setError("No valid data available for the selected columns. Please check your selection.");
          return;
        }

        const newChartData = { labels, datasets };
        setChartData(newChartData);
        onUpdate(element.id, { chartData: newChartData, axisInfo });
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
      barLine: BarLineChart,
    }[element.type] || Bar;

    const chartSpecificOptions = {
      ...chartOptions,
      indexAxis: element.type === 'stripedBar' ? 'y' : 'x',
      scales: {
        ...chartOptions.scales,
        x: {
          ...chartOptions.scales.x,
          stacked: element.type === 'stackedBar' || element.type === 'stripedBar',
        },
        y: {
          ...chartOptions.scales.y,
          stacked: element.type === 'stackedBar' || element.type === 'stripedBar',
        },
      },
    };

    // Remove axes for pie charts
    if (['pie', 'halfPie', 'hollowPie'].includes(element.type)) {
      delete chartSpecificOptions.scales;
    }

    const pieChartData = {
      labels: chartData.labels,
      datasets: [{
        data: chartData.datasets[0].data,
        backgroundColor: getUniqueColors(chartData.datasets[0].data.length),
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 2,
      }],
    };

    const pieOptions = {
      ...chartSpecificOptions,
      plugins: {
        ...chartSpecificOptions.plugins,
        legend: {
          ...chartSpecificOptions.plugins.legend,
          position: 'bottom',
        },
      },
      ...(element.type === 'halfPie' && {
        rotation: -90,
        circumference: 180,
      }),
    };

    return (
      <div id={`chart-${element.id}`} className="w-full h-full p-1 rounded-lg shadow-sm">
        <ChartComponent
          ref={chartRef}
          data={['pie', 'halfPie', 'hollowPie'].includes(element.type) ? pieChartData : chartData}
          options={['pie', 'halfPie', 'hollowPie'].includes(element.type) ? pieOptions : chartSpecificOptions}
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

  