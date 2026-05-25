import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MonthlyStats, Category } from '../types';

interface Props {
  may: MonthlyStats;
  avg: MonthlyStats;
  selectedMonth: string;
}

export const CategoryChart: React.FC<Props> = ({ may, avg, selectedMonth }) => {
  const categories: Category[] = ['식비', '카페', '배달', '쇼핑', '교통', '문화/취미', '구독', '생활용품', '의료/건강', '기타'];
  const formattedMonth = selectedMonth.split('-')[1];
  
  const data = categories.map(cat => ({
    name: cat,
    '나머지 3개월 평균': avg.categoryTotals[cat] || 0,
    [`${formattedMonth}월`]: may.categoryTotals[cat] || 0,
  })).filter(item => (item['나머지 3개월 평균'] as number) > 0 || (item[`${formattedMonth}월`] as number) > 0);

  return (
    <div className="card chart-card">
      <h3 className="card-title">카테고리별 지출 비교 (평균 vs {formattedMonth}월)</h3>
      <div className="chart-container" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
            <XAxis dataKey="name" tick={{fill: '#666', fontSize: 12}} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(val) => `${(val/10000).toFixed(0)}만`} tick={{fill: '#666'}} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: any) => `${value.toLocaleString()}원`} cursor={{fill: '#f5f5f5'}} />
            <Legend iconType="circle" />
            <Bar dataKey="나머지 3개월 평균" fill="#9ca3af" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey={`${formattedMonth}월`} fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
