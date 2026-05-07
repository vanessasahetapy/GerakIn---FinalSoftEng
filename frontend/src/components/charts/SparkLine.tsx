// === FILE: src/components/charts/SparkLine.tsx ===
import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface SparkLineProps {
  data: { value: number }[];
  color?: string;
  height?: number;
}

export const SparkLine: React.FC<SparkLineProps> = ({ data, color = '#FF4D00', height = 48 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
        <Tooltip
          content={() => null}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
