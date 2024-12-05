import React from 'react';
import { View, Text } from '@react-pdf/renderer';

export const ChartElement = ({ data, type }) => {
  // For now, we'll just display a placeholder for charts
  // In a real implementation, you'd need to use a library that can render charts in PDFs
  return (
    <View>
      <Text>{type} Chart Placeholder</Text>
    </View>
  );
};

