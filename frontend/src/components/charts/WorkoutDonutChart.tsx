// === FILE: src/components/charts/WorkoutDonutChart.tsx ===
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint { name: string; value: number; color: string; }

interface WorkoutDonutChartProps {
  data: DataPoint[];
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-border rounded-lg px-3 py-2 shadow-card-hover">
        <p className="font-inter text-xs text-text-secondary">{payload[0].name}</p>
        <p className="font-barlow font-bold text-lg text-accent">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export const WorkoutDonutChart: React.FC<WorkoutDonutChartProps> = ({ data, height = 240 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#64748B' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
