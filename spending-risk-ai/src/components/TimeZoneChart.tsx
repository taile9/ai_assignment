import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MonthlyStats } from '../types';

interface Props {
  may: MonthlyStats;
  selectedMonth: string;
}

export const TimeZoneChart: React.FC<Props> = ({ may, selectedMonth }) => {
  const zones = ['새벽', '오전', '오후', '저녁', '야간'];
  const formattedMonth = selectedMonth.split('-')[1];
  const data = zones.map(zone => ({
    name: zone,
    amount: may.timeZoneTotals[zone] || 0
  }));

  const COLORS = {
    '새벽': '#8b5cf6',
    '오전': '#3b82f6',
    '오후': '#10b981',
    '저녁': '#f59e0b',
    '야간': '#ef4444'
  };

  return (
    <div className="card chart-card">
      <h3 className="card-title">{formattedMonth}월 시간대별 지출</h3>
      <div className="chart-container" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
            <XAxis dataKey="name" tick={{fill: '#666'}} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(val) => `${(val/10000).toFixed(0)}만`} tick={{fill: '#666'}} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: any) => [`${value.toLocaleString()}원`, '지출액']} cursor={{fill: '#f5f5f5'}} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
