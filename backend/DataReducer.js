const _ = require('lodash');

class DataReducer {
  /**
 
   * @param {Array} data  
   * @param {Object} options 
   * @returns {Array} 
   */
  static reduceDataset(data, options = {}) {
    if (!data || data.length <= options.maxDataPoints) {
      return data;
    }

    const {
      maxDataPoints = 100,  // Default max number of data points
      preservePeaks = true,
      smoothingMethod = 'slidingWindow',
      smoothingWindow = 5,
      peakPreservationThreshold = 0.1 // 10% of data range
    } = options;


    const numericColumns = this.identifyNumericColumns(data);


    let peakIndices = [];
    if (preservePeaks) {
      peakIndices = this.detectPeaks(data, numericColumns, peakPreservationThreshold);
    }


    let reducedData;
    switch (smoothingMethod) {
      case 'slidingWindow':
        reducedData = this.slidingWindowReduction(data, maxDataPoints, numericColumns, smoothingWindow, peakIndices);
        break;
      case 'weightedAverage':
        reducedData = this.weightedAverageReduction(data, maxDataPoints, numericColumns, peakIndices);
        break;
      default:
        reducedData = this.uniformSamplingReduction(data, maxDataPoints, peakIndices);
    }

    return reducedData;
  }

  /**
   * Identify numeric columns in the dataset
   * @param {Array} data - Dataset to analyze
   * @returns {Array} List of numeric column names
   */
  static identifyNumericColumns(data) {
    if (!data.length) return [];

    const firstRow = data[0];
    return Object.keys(firstRow).filter(key => 
      data.every(row => typeof row[key] === 'number')
    );
  }

  /**
   * Detect peaks in numeric columns
   * @param {Array} data - Dataset to analyze
   * @param {Array} numericColumns - Columns to check for peaks
   * @param {number} threshold - Peak significance threshold
   * @returns {Array} Indices of peak data points
   */
  static detectPeaks(data, numericColumns, threshold) {
    if (!numericColumns.length) return [];

    const peakIndices = new Set();
    
    numericColumns.forEach(column => {
      const values = data.map(row => row[column]);
      const valueRange = Math.max(...values) - Math.min(...values);
      const significantThreshold = valueRange * threshold;

      // Simple peak detection algorithm
      for (let i = 1; i < values.length - 1; i++) {
        if (
          values[i] > values[i-1] + significantThreshold && 
          values[i] > values[i+1] + significantThreshold
        ) {
          peakIndices.add(i);
        }
      }

      // Always keep first and last indices
      peakIndices.add(0);
      peakIndices.add(values.length - 1);
    });

    return Array.from(peakIndices).sort((a, b) => a - b);
  }

  /**
   * Reduce data using sliding window averaging
   * @param {Array} data - Original dataset
   * @param {number} maxDataPoints - Maximum number of data points
   * @param {Array} numericColumns - Columns to smooth
   * @param {number} windowSize - Size of sliding window
   * @param {Array} peakIndices - Indices to preserve
   * @returns {Array} Reduced dataset
   */
  static slidingWindowReduction(data, maxDataPoints, numericColumns, windowSize, peakIndices) {
    const reducedData = [];
    const step = Math.max(1, Math.floor(data.length / maxDataPoints));

    for (let i = 0; i < data.length; i += step) {
      // Always include peak indices
      if (peakIndices.includes(i) || reducedData.length < maxDataPoints) {
        const windowStart = Math.max(0, i - Math.floor(windowSize / 2));
        const windowEnd = Math.min(data.length - 1, windowStart + windowSize);
        
        const windowData = data.slice(windowStart, windowEnd);
        const smoothedRow = {...data[i]};

        // Smooth numeric columns
        numericColumns.forEach(column => {
          const windowValues = windowData.map(row => row[column]);
          smoothedRow[column] = this.calculateAverage(windowValues);
        });

        reducedData.push(smoothedRow);
      }
    }

    return reducedData;
  }

  /**
   * Reduce data using weighted average
   * @param {Array} data - Original dataset
   * @param {number} maxDataPoints - Maximum number of data points
   * @param {Array} numericColumns - Columns to smooth
   * @param {Array} peakIndices - Indices to preserve
   * @returns {Array} Reduced dataset
   */
  static weightedAverageReduction(data, maxDataPoints, numericColumns, peakIndices) {
    const reducedData = [];
    const step = Math.max(1, Math.floor(data.length / maxDataPoints));

    for (let i = 0; i < data.length; i += step) {
      // Always include peak indices
      if (peakIndices.includes(i) || reducedData.length < maxDataPoints) {
        const smoothedRow = {...data[i]};

        // Apply weighted average to numeric columns
        numericColumns.forEach(column => {
          const weights = [0.1, 0.2, 0.4, 0.2, 0.1]; // Gaussian-like weighting
          const windowStart = Math.max(0, i - 2);
          const windowEnd = Math.min(data.length - 1, i + 3);
          
          const windowData = data.slice(windowStart, windowEnd);
          const weightedValues = windowData.map((row, index) => 
            row[column] * weights[index]
          );

          smoothedRow[column] = weightedValues.reduce((a, b) => a + b, 0);
        });

        reducedData.push(smoothedRow);
      }
    }

    return reducedData;
  }

  /**
   * Uniform sampling reduction
   * @param {Array} data - Original dataset
   * @param {number} maxDataPoints - Maximum number of data points
   * @param {Array} peakIndices - Indices to preserve
   * @returns {Array} Reduced dataset
   */
  static uniformSamplingReduction(data, maxDataPoints, peakIndices) {
    const reducedData = [];
    const step = Math.max(1, Math.floor(data.length / maxDataPoints));

    for (let i = 0; i < data.length; i += step) {
      // Always include peak indices
      if (peakIndices.includes(i) || reducedData.length < maxDataPoints) {
        reducedData.push(data[i]);
      }
    }

    return reducedData;
  }

  /**
   * Calculate average of an array of numbers
   * @param {Array} values - Array of numeric values
   * @returns {number} Average value
   */
  static calculateAverage(values) {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
}

module.exports = DataReducer;