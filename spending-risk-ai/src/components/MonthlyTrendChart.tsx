import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { MonthlyStats } from '../types';

interface Props {
  feb: MonthlyStats;
  mar: MonthlyStats;
  apr: MonthlyStats;
  may: MonthlyStats;
}

export const MonthlyTrendChart: React.FC<Props> = ({ feb, mar, apr, may }) => {
  const data = [
    { name: '2월', amount: feb.totalAmount },
    { name: '3월', amount: mar.totalAmount },
    { name: '4월', amount: apr.totalAmount },
    { name: '5월(현재)', amount: may.totalAmount },
  ];

  return (
    <div className="card chart-card">
      <h3 className="card-title">월별 총 지출 추이</h3>
      <div className="chart-container" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
            <XAxis dataKey="name" tick={{fill: '#666'}} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(val) => `${(val/10000).toFixed(0)}만`} tick={{fill: '#666'}} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: any) => [`${value.toLocaleString()}원`, '총 지출']} cursor={{fill: '#f5f5f5'}} />
            <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={60}>
              <LabelList dataKey="amount" position="top" formatter={(val: any) => `${(val/10000).toFixed(0)}만`} fill="#666" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
