import React from 'react';
import { Transaction, MonthStr } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { Trash2 } from 'lucide-react';

interface Props {
  selectedMonth: MonthStr;
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onClear: () => void;
  onLoadSample: () => void;
}

export const TransactionTable: React.FC<Props> = ({ selectedMonth, transactions, onDelete, onClear, onLoadSample }) => {
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  const monthLabel = selectedMonth.split('-')[1];

  return (
    <div className="card">
      <div className="table-header-actions">
        <h3 className="card-title">{monthLabel}월 소비 내역</h3>
        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={onLoadSample}>5월 샘플 데이터 불러오기</button>
          <button className="btn btn-danger" onClick={onClear}>초기화</button>
        </div>
      </div>
      
      <div className="table-container">
        {sortedTransactions.length === 0 ? (
          <div className="empty-state">내역이 없습니다. 새로운 소비를 추가하거나 샘플 데이터를 불러오세요.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>시간</th>
                <th>카테고리</th>
                <th>가맹점</th>
                <th>금액</th>
                <th>결제수단</th>
                <th>구독</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map(t => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.time}</td>
                  <td><span className={`badge bg-gray`}>{t.category}</span></td>
                  <td>{t.merchant}</td>
                  <td className="text-right font-semibold">{formatCurrency(t.amount)}</td>
                  <td>{t.paymentType}</td>
                  <td>{t.isSubscription || t.category === '구독' ? 'O' : 'X'}</td>
                  <td>
                    <button className="btn-icon" onClick={() => onDelete(t.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

