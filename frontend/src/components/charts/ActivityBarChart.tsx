// === FILE: src/components/charts/ActivityBarChart.tsx ===
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface DataPoint { day?: string; date?: string; sessions?: number; bookings?: number; }

interface ActivityBarChartProps {
  data: DataPoint[];
  xKey?: string;
  dataKey?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-bg-surface border border-border rounded-lg px-3 py-2 shadow-card">
        <p className="font-inter text-[10px] uppercase font-bold tracking-widest text-text-light mb-1">{label}</p>
        <p className="font-bold text-lg text-accent">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export const ActivityBarChart: React.FC<ActivityBarChartProps> = ({
  data, xKey = 'day', dataKey = 'sessions', height = 220,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barCategoryGap="40%" margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontFamily: 'Inter', fontSize: 10, fill: '#64748B', fontWeight: 600 }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fontFamily: 'Inter', fontSize: 10, fill: '#64748B' }}
          axisLine={false} tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
        <Bar dataKey={dataKey} fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
};
