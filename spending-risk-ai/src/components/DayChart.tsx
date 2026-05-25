import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyStats } from '../types';

interface Props {
  may: MonthlyStats;
  selectedMonth: string;
}

export const DayChart: React.FC<Props> = ({ may, selectedMonth }) => {
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const formattedMonth = selectedMonth.split('-')[1];
  const data = days.map(day => ({
    name: day,
    amount: may.dayOfWeekTotals[day] || 0
  }));

  return (
    <div className="card chart-card">
      <h3 className="card-title">{formattedMonth}월 요일별 지출</h3>
      <div className="chart-container" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
            <XAxis dataKey="name" tick={{fill: '#666'}} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(val) => `${(val/10000).toFixed(0)}만`} tick={{fill: '#666'}} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: any) => [`${value.toLocaleString()}원`, '지출액']} cursor={{fill: '#f5f5f5'}} />
            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
