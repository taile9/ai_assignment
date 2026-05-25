import React from 'react';
import { Transaction, RiskAnalysis, MonthStr } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { HelpCircle, AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  risk: RiskAnalysis;
  selectedMonth: MonthStr;
  onWarningClick: (warningType: string) => void;
  activeFilter: string | null;
}

export const RiskPatternList: React.FC<Props> = ({ 
  transactions, 
  risk, 
  selectedMonth, 
  onWarningClick, 
  activeFilter 
}) => {
  const currentMonthTx = transactions.filter(t => t.month === selectedMonth);
  const formattedMonth = selectedMonth.split('-')[1];

  // 반복 소비 목록 (가맹점 3회 이상)
  const merchantCounts: Record<string, {count: number, total: number}> = {};
  currentMonthTx.forEach(t => {
    if (!merchantCounts[t.merchant]) merchantCounts[t.merchant] = {count: 0, total: 0};
    merchantCounts[t.merchant].count += 1;
    merchantCounts[t.merchant].total += t.amount;
  });
  const repeatedMerchants = Object.entries(merchantCounts)
    .filter(([_, data]) => data.count >= 3)
    .sort((a, b) => b[1].count - a[1].count);

  // 고액 소비 목록 (5만원 이상)
  const highValueTx = currentMonthTx.filter(t => t.amount >= 50000).sort((a, b) => b.amount - a.amount);

  // 구독 소비 목록
  const subTx = currentMonthTx.filter(t => t.isSubscription || t.category === '구독');

  // 소액 누적 소비 목록 (1만원 미만)
  const smallTx = currentMonthTx.filter(t => t.amount < 10000);

  // Helper to map rule name to filter name
  const mapRuleToFilterName = (rule: string): string => {
    if (rule.includes('비필수 소비')) return '비필수 소비';
    if (rule.includes('야간 소비')) return '야간 소비';
    if (rule.includes('동일 가맹점')) return '동일 가맹점 4회 이상';
    if (rule.includes('구독 소비')) return '구독';
    if (rule.includes('5만원 이상 결제')) return '5만원 이상 결제';
    if (rule.includes('1만원 미만 결제')) return '1만원 미만 결제';
    if (rule.includes('전월 대비')) return '전월 대비 과소비 증가형';
    return rule;
  };

  return (
    <div className="risk-pattern-container">
      
      {/* 1. 과소비 위험 점수 산출 내역 */}
      <div className="card">
        <div className="card-header-flex">
          <h3 className="card-title flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange" />
            {formattedMonth}월 과소비 위험 점수 산출 내역
          </h3>
          <span className="text-xs text-gray-500 font-normal">※ 각 항목 클릭 시 상세 지출 내역을 조회합니다.</span>
        </div>
        {risk.scoreBreakdown.length === 0 ? (
          <p className="empty-breakdown-text">감점된 위험 요인이 없는 우수한 소비 형태입니다.</p>
        ) : (
          <ul className="score-breakdown-list">
            {risk.scoreBreakdown.map((b, i) => {
              const filterName = mapRuleToFilterName(b.rule);
              const isActive = activeFilter === filterName;
              return (
                <li 
                  key={i} 
                  className={`score-breakdown-item-interactive ${isActive ? 'active-row-highlight' : ''}`}
                  onClick={() => onWarningClick(filterName)}
                  title="클릭하여 관련 거래 내역 필터링"
                >
                  <span className="rule-name">{b.rule}</span>
                  <span className="rule-points">+{b.score}점</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 2. 소비 패턴 그리드 (4가지 핵심 위험 채널) */}
      <div className="pattern-grid mt-4">
        
        {/* 반복 소비 */}
        <div 
          className={`card clickable-pattern-card ${activeFilter === '반복 소비' ? 'active-pattern-card-highlight' : ''}`}
          onClick={() => onWarningClick('반복 소비')}
          title="클릭하여 반복 소비 내역 필터링"
        >
          <div className="pattern-card-header">
            <h4 className="card-title text-sm font-semibold">반복 소비 (3회 이상)</h4>
            <span className="pattern-count">{repeatedMerchants.length}곳</span>
          </div>
          {repeatedMerchants.length === 0 ? (
            <p className="text-xs text-gray-500">감지된 반복 거래처가 없습니다.</p>
          ) : (
            <ul className="pattern-sub-list">
              {repeatedMerchants.slice(0, 3).map(([m, data], i) => (
                <li key={i}>
                  <span className="font-medium text-navy text-xs">{m}</span>
                  <span className="text-xs text-gray-600">{data.count}회 ({formatCurrency(data.total)})</span>
                </li>
              ))}
              {repeatedMerchants.length > 3 && (
                <li className="text-xs text-gray-500 text-center italic mt-1">외 {repeatedMerchants.length - 3}곳 더 있음</li>
              )}
            </ul>
          )}
        </div>

        {/* 고액 소비 */}
        <div 
          className={`card clickable-pattern-card ${activeFilter === '5만원 이상 결제' ? 'active-pattern-card-highlight' : ''}`}
          onClick={() => onWarningClick('5만원 이상 결제')}
          title="클릭하여 고액 결제 내역 필터링"
        >
          <div className="pattern-card-header">
            <h4 className="card-title text-sm font-semibold">고액 소비 (5만원 이상)</h4>
            <span className="pattern-count text-red">{highValueTx.length}건</span>
          </div>
          {highValueTx.length === 0 ? (
            <p className="text-xs text-gray-500">5만원 이상 단일 지출 내역이 없습니다.</p>
          ) : (
            <ul className="pattern-sub-list">
              {highValueTx.slice(0, 3).map(t => (
                <li key={t.id}>
                  <span className="font-medium text-navy text-xs truncate max-w-[80px]">{t.merchant}</span>
                  <span className="text-xs text-red font-semibold">{formatCurrency(t.amount)}</span>
                </li>
              ))}
              {highValueTx.length > 3 && (
                <li className="text-xs text-gray-500 text-center italic mt-1">외 {highValueTx.length - 3}건 더 있음</li>
              )}
            </ul>
          )}
        </div>

        {/* 구독 결제 내역 */}
        <div 
          className={`card clickable-pattern-card ${activeFilter === '구독' ? 'active-pattern-card-highlight' : ''}`}
          onClick={() => onWarningClick('구독')}
          title="클릭하여 구독 결제 내역 필터링"
        >
          <div className="pattern-card-header">
            <h4 className="card-title text-sm font-semibold">구독 결제 내역</h4>
            <span className="pattern-count text-purple">{subTx.length}건</span>
          </div>
          {subTx.length === 0 ? (
            <p className="text-xs text-gray-500">등록된 정기 결제 내역이 없습니다.</p>
          ) : (
            <ul className="pattern-sub-list">
              {subTx.slice(0, 3).map(t => (
                <li key={t.id}>
                  <span className="font-medium text-navy text-xs truncate max-w-[80px]">{t.merchant}</span>
                  <span className="text-xs text-purple font-semibold">{formatCurrency(t.amount)}</span>
                </li>
              ))}
              {subTx.length > 3 && (
                <li className="text-xs text-gray-500 text-center italic mt-1">외 {subTx.length - 3}건 더 있음</li>
              )}
            </ul>
          )}
        </div>

        {/* 소액 누적 */}
        <div 
          className={`card clickable-pattern-card ${activeFilter === '1만원 미만 결제' ? 'active-pattern-card-highlight' : ''}`}
          onClick={() => onWarningClick('1만원 미만 결제')}
          title="클릭하여 소액 결제 내역 필터링"
        >
          <div className="pattern-card-header">
            <h4 className="card-title text-sm font-semibold">소액 누적 (1만원 미만)</h4>
            <span className="pattern-count text-orange">{smallTx.length}건</span>
          </div>
          <p className="text-xs text-gray-500 mb-1">한 달 간 총 {smallTx.length}회 결제됨</p>
          {smallTx.length === 0 ? (
            <p className="text-xs text-gray-500">1만원 미만의 소액 누적 건이 없습니다.</p>
          ) : (
            <ul className="pattern-sub-list">
              {smallTx.slice(0, 3).map(t => (
                <li key={t.id}>
                  <span className="font-medium text-navy text-xs truncate max-w-[80px]">{t.merchant}</span>
                  <span className="text-xs text-gray-600">{formatCurrency(t.amount)}</span>
                </li>
              ))}
              {smallTx.length > 3 && (
                <li className="text-xs text-gray-500 text-center italic mt-1">외 {smallTx.length - 3}건 더 있음</li>
              )}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};
