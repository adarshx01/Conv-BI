import React, { useState, useRef, useEffect } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import ChartDropZone from './ChartDropZone';
import { TableElement } from './TableElement';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const colorPalette = [
  '#CDC1FF', '#FCC737', '#A8CD89', '#9694FF', '#A1EEBD', 
  '#4CC9FE', '#2E236C', '#E68369', '#FF7EE2', '#BBE9FF', 
  '#FFD1E3', '#FA7070', '#AD88C6', '#15F5BA', '#7ED7C1',
  '#89B9AD', '#C7DCA7', '#FFC436', '#FF8989', '#9DB2BF'
];

const getUniqueColors = (count) => {
  const hueStep = 360 / count;
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * hueStep) % 360;
    return `hsla(${hue}, 100%, 50%, 0.8)`;
  });
};

const getColors = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(colorPalette[i % colorPalette.length]);
  }
  return colors;
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

function ElementRenderer({ element, onUpdate }) {
  const [data, setData] = useState(element.data || null);
  const [chartData, setChartData] = useState(element.chartData || null);
  const [error, setError] = useState(null);
  const [axisInfo, setAxisInfo] = useState(element.axisInfo || { xAxis: [], yAxis: [] });
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      chart.options.devicePixelRatio = 2;
      chart.update();
    }
  }, [chartData]);

  const handleDataSelect = (selectedData, newAxisInfo) => {
    setAxisInfo(newAxisInfo);
    setError(null);
    if (selectedData && selectedData.length > 0) {
      if (element.type === 'table') {
        setData(selectedData);
        onUpdate(element.id, { data: selectedData });
      } else {
        processChartData(selectedData, newAxisInfo);
      }
    } else {
      setError("No data returned from the query. Please check your selection and try again.");
    }
  };

  const processChartData = (selectedData, { xAxis, yAxis }) => {
    const xAxisArray = Array.isArray(xAxis) ? xAxis : [xAxis];
    const isAggregatedData = selectedData[0] && selectedData[0].hasOwnProperty('period');

    let labels, datasets;

    try {
      if (isAggregatedData) {
        [labels, datasets] = processAggregatedData(selectedData, yAxis);
      } else {
        [labels, datasets] = processRegularData(selectedData, xAxisArray, yAxis);
      }

      if (!datasets || datasets.length === 0) {
        setError("No valid data available for the selected columns. Please ensure Y-axis columns contain numeric data.");
        return;
      }

      const newChartData = { labels, datasets };
      setChartData(newChartData);
      onUpdate(element.id, { chartData: newChartData, axisInfo: { xAxis, yAxis } });
    } catch (error) {
      console.error('Error processing chart data:', error);
      setError("Error processing data. Please check if the selected columns are compatible with the chart type.");
      return;
    }
  };

  const processAggregatedData = (selectedData, yAxis) => {
    const labels = selectedData.map(item => item.period);
    const metrics = yAxis.map(y => y.path.split('.')[1]);
    
    const datasets = metrics.flatMap((metric, metricIndex) => {
      if (selectedData[0][metric] && typeof selectedData[0][metric] === 'string') {
        try {
          const parsedData = selectedData.map(item => JSON.parse(item[metric]));
          const highestData = parsedData.map(item => parseFloat(item.highest) || 0);
          const lowestData = parsedData.map(item => parseFloat(item.lowest) || 0);
          const averageData = parsedData.map(item => parseFloat(item.average) || 0);

          const colors = getColors(3);
          const baseIndex = metricIndex * 3;

          return [
            {
              label: `${metric} (Highest)`,
              data: highestData,
              backgroundColor: colors[baseIndex] + '80',
              borderColor: colors[baseIndex],
              borderWidth: 2,
              fill: element.type === 'area',
            },
            {
              label: `${metric} (Lowest)`,
              data: lowestData,
              backgroundColor: colors[baseIndex + 1] + '80',
              borderColor: colors[baseIndex + 1],
              borderWidth: 2,
              fill: element.type === 'area',
            },
            {
              label: `${metric} (Average)`,
              data: averageData,
              backgroundColor: colors[baseIndex + 2] + '80',
              borderColor: colors[baseIndex + 2],
              borderWidth: 2,
              fill: element.type === 'area',
            }
          ];
        } catch (error) {
          console.error(`Error parsing data for ${metric}:`, error);
          return [];
        }
      } else {
        const data = selectedData.map(item => parseFloat(item[metric]) || 0);
        const color = colorPalette[metricIndex % colorPalette.length];
        return [{
          label: metric,
          data: data,
          backgroundColor: color + '80',
          borderColor: color,
          borderWidth: 2,
          fill: element.type === 'area',
        }];
      }
    });

    return [labels, datasets];
  };

  const processRegularData = (selectedData, xAxisArray, yAxis) => {
    const labels = [...new Set(xAxisArray.flatMap(x => {
      const [xTable, xColumn] = x.path.split('.');
      return selectedData.map(row => row[xColumn]);
    }))];

    const datasets = yAxis.map((y, index) => {
      let yData;

      if (['ADD', 'SUBTRACT', 'DIVIDE'].includes(y.aggregationFunction)) {
        const [col1, col2] = y.path.match(/$$(.*?)$$/)[1].split(', ');
        const [table1, column1] = col1.split('.');
        const [table2, column2] = col2.split('.');

        yData = labels.map(label => {
          const matchingRows = selectedData.filter(row => 
            xAxisArray.some(x => {
              const [xTable, xColumn] = x.path.split('.');
              return row[xColumn] === label;
            })
          );

          const value1 = matchingRows.reduce((sum, row) => sum + (parseFloat(row[column1]) || 0), 0);
          const value2 = matchingRows.reduce((sum, row) => sum + (parseFloat(row[column2]) || 0), 0);

          switch (y.aggregationFunction) {
            case 'ADD':
              return value1 + value2;
            case 'SUBTRACT':
              return value1 - value2;
            case 'DIVIDE':
              return value2 !== 0 ? value1 / value2 : 0;
            default:
              return 0;
          }
        });
      } else if (y.aggregationFunction === 'COUNT_BY') {
        const [countColumn, byColumn] = y.path.match(/$$(.*?)$$/)[1].split(', ');
        const [countTable, countColumnName] = countColumn.split('.');
        const [byTable, byColumnName] = byColumn.split('.');

        yData = labels.map(label => {
          const matchingRows = selectedData.filter(row => 
            xAxisArray.some(x => {
              const [xTable, xColumn] = x.path.split('.');
              return row[xColumn] === label;
            })
          );

          const uniqueValues = new Set(matchingRows.map(row => row[byColumnName]));
          return uniqueValues.size;
        });
      } else {
        const [yTable, yColumn] = y.path.split('.');
        yData = labels.map(label => {
          const matchingRows = selectedData.filter(row => 
            xAxisArray.some(x => {
              const [xTable, xColumn] = x.path.split('.');
              return row[xColumn] === label;
            })
          );
          
          switch (y.aggregationFunction) {
            case 'SUM':
              return matchingRows.reduce((sum, row) => sum + (parseFloat(row[yColumn]) || 0), 0);
            case 'AVG':
              return matchingRows.reduce((sum, row) => sum + (parseFloat(row[yColumn]) || 0), 0) / matchingRows.length;
            case 'COUNT':
              return matchingRows.length;
            case 'MIN':
              return Math.min(...matchingRows.map(row => parseFloat(row[yColumn]) || 0));
            case 'MAX':
              return Math.max(...matchingRows.map(row => parseFloat(row[yColumn]) || 0));
            default:
              return matchingRows.reduce((sum, row) => sum + (parseFloat(row[yColumn]) || 0), 0) / matchingRows.length;
          }
        });
      }

      if (yData.every(val => val === null)) {
        setError(`No valid numeric data available for ${y.path}. Please check your selection.`);
        return null;
      }

      const color = colorPalette[index % colorPalette.length];

      return {
        label: y.path,
        data: yData,
        backgroundColor: getChartBackgroundColor(element.type, index, yData.length, color),
        borderColor: getBorderColor(element.type, color),
        borderWidth: 2,
        fill: element.type === 'area' || element.type === 'stackedBar',
        tension: 0.4,
        ...(element.type === 'barLine' && index > 0 && { type: 'line' }),
      };
    }).filter(dataset => dataset !== null);

    return [labels, datasets];
  };

  const getChartBackgroundColor = (chartType, index, dataLength, color) => {
    switch (chartType) {
      case 'bar':
      case 'stackedBar':
      case 'stripedBar':
        return color;
      case 'pie':
      case 'halfPie':
      case 'hollowPie':
        return getColors(dataLength);
      case 'area':
        return `${color}80`; // Add 50% opacity
      case 'barLine':
        return index === 0 ? color : 'transparent';
      default:
        return 'transparent';
    }
  };

  const getBorderColor = (chartType, color) => {
    return ['pie', 'halfPie', 'hollowPie'].includes(chartType) ? 'rgba(255, 255, 255, 1)' : color;
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

    if (['pie', 'halfPie', 'hollowPie'].includes(element.type)) {
      delete chartSpecificOptions.scales;
    }

    if (element.type === 'area') {
      chartSpecificOptions.elements = {
        ...chartSpecificOptions.elements,
        line: { fill: true }
      };
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

  const renderChartOrDropZone = () => {
    if (chartData) {
      return renderChart();
    } else if (error) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-100 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      );
    } else {
      return (
        <ChartDropZone
          onDataSelect={handleDataSelect}
          chartType={element.type}
          axisInfo={axisInfo}
        />
      );
    }
  };

  switch (element.type) {
    case 'table':
      return data ? (
        <TableElement data={data} />
      ) : (
        <ChartDropZone onDataSelect={handleDataSelect} chartType={element.type} />
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
      return renderChartOrDropZone();
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
