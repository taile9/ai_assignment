import React from 'react';
import { MonthlyStats, Category } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { PieChart } from 'lucide-react';

interface Props {
  may: MonthlyStats;
  selectedMonth: string;
}

export const CategorySummaryList: React.FC<Props> = ({ may, selectedMonth }) => {
  const formattedMonth = selectedMonth.split('-')[1];
  const categories: Category[] = ['식비', '카페', '배달', '쇼핑', '교통', '문화/취미', '구독', '생활용품', '의료/건강', '기타'];
  
  const summaries = categories
    .map(cat => ({
      category: cat,
      count: may.categoryCounts[cat] || 0,
      amount: may.categoryTotals[cat] || 0,
      percentage: may.totalAmount > 0 ? ((may.categoryTotals[cat] || 0) / may.totalAmount) * 100 : 0
    }))
    .filter(item => item.count > 0 || item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="card summary-card mt-6 col-span-full border-gray-200">
      <div className="card-header-flex mb-4 border-b pb-2 border-gray-100">
        <span className="card-lbl flex items-center gap-2 text-navy font-bold text-lg">
          <PieChart size={18} className="text-navy" />
          {formattedMonth}월 카테고리별 소비 요약
        </span>
      </div>
      
      {summaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {summaries.map(item => (
            <div key={item.category} className="p-3 bg-gray-50 rounded-lg flex flex-col gap-1 border border-gray-100 hover:shadow-sm transition">
              <div className="font-bold text-sm text-navy">{item.category}</div>
              <div className="text-sm font-semibold text-gray-800">
                {item.count}건 <span className="text-gray-300 mx-1">|</span> {formatCurrency(item.amount)}
              </div>
              <div className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded-md inline-block self-start mt-1 shadow-sm">
                전체의 {item.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 p-4 text-center">결제 내역이 없습니다.</div>
      )}
    </div>
  );
};
