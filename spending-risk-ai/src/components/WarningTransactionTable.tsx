import React from 'react';
import { SpendingTypeSummary } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { X, ShieldAlert } from 'lucide-react';

interface Props {
  summary: SpendingTypeSummary | null;
  onClear: () => void;
}

export const WarningTransactionTable: React.FC<Props> = ({ summary, onClear }) => {
  if (!summary) return null;
  const transactions = summary.relatedTransactions;

  return (
    <div className="card warning-transactions-card animate-fade-in" id="warning-transactions-section">
      <div className="warning-table-header">
        <h3 className="card-title flex items-center gap-2 text-red font-semibold">
          <ShieldAlert size={20} className="text-red" />
          경고 관련 소비 내역
        </h3>
        <button className="btn btn-secondary btn-sm flex items-center gap-1" onClick={onClear}>
          <X size={14} />
          필터 해제
        </button>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4 mt-2">
        <div className="font-bold text-red-dark text-lg mb-2">선택된 유형: {summary.label}</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2 text-sm text-gray-800">
          <div>
            <span className="text-gray-500 block text-xs">관련 소비</span>
            <span className="font-bold">{summary.count}건</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">총액</span>
            <span className="font-bold">{formatCurrency(summary.totalAmount)}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">평균 결제액</span>
            <span className="font-bold">{formatCurrency(summary.averageAmount)}</span>
          </div>
          <div className="col-span-2 md:col-span-4">
            <span className="text-gray-500 block text-xs">탐지 기준</span>
            <span className="font-semibold">{summary.description}</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        {transactions.length === 0 ? (
          <div className="empty-state">조건에 부합하는 지출 내역이 없습니다.</div>
        ) : (
          <table className="data-table warning-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>시간</th>
                <th>카테고리</th>
                <th>가맹점</th>
                <th>금액</th>
                <th>메모</th>
                <th>구독</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="warning-row">
                  <td>{t.date}</td>
                  <td>{t.time}</td>
                  <td>
                    <span className={`badge category-badge-${t.category} bg-gray`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="font-medium">{t.merchant}</td>
                  <td className="text-right font-semibold text-red">{formatCurrency(t.amount)}</td>
                  <td>{t.memo || '-'}</td>
                  <td>{t.isSubscription || t.category === '구독' ? 'O' : 'X'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
