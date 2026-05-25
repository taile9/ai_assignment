import React from 'react';
import { MonthlyStats, ComparisonResult, RiskAnalysis, MonthStr } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CreditCard,
  Percent,
  Activity,
  UserCheck
} from 'lucide-react';

interface Props {
  selectedMonth: MonthStr;
  may: MonthlyStats;
  avg: MonthlyStats;
  comparison: ComparisonResult | undefined;
  risk: RiskAnalysis;
  onWarningClick: (warningType: string) => void;
  activeFilter: string | null;
  isCompareOnly?: boolean;
}

export const SummaryCards: React.FC<Props> = ({ 
  selectedMonth, 
  may, 
  avg, 
  comparison, 
  risk, 
  onWarningClick, 
  activeFilter,
  isCompareOnly = false
}) => {
  const getRiskColor = (level: string) => {
    switch(level) {
      case '안정형': return 'text-green';
      case '주의형': return 'text-yellow';
      case '위험형': return 'text-orange';
      case '고위험형': return 'text-red';
      default: return '';
    }
  };

  const getRiskBg = (level: string) => {
    switch(level) {
      case '안정형': return 'bg-green-light';
      case '주의형': return 'bg-yellow-light';
      case '위험형': return 'bg-orange-light';
      case '고위험형': return 'bg-red-light';
      default: return 'bg-gray';
    }
  };

  const RiskIcon = () => {
    switch(risk.level) {
      case '안정형': return <ShieldCheck className="text-green" size={28} />;
      case '주의형': return <AlertCircle className="text-yellow" size={28} />;
      case '위험형': return <AlertTriangle className="text-orange" size={28} />;
      case '고위험형': return <ShieldAlert className="text-red" size={28} />;
      default: return null;
    }
  };

  const formattedMonth = selectedMonth.split('-')[1];

  // Find the most dangerous pattern based on the highest score in breakdown
  const top2DangerousRules = risk.scoreBreakdown.length > 0 
    ? [...risk.scoreBreakdown].sort((a, b) => b.score - a.score).slice(0, 2)
    : [];

  return (
    <div className="summary-cards-container">
      <div className={`summary-cards-grid ${isCompareOnly ? 'compare-only-grid' : ''}`}>
        
        {/* 1. 위험 점수 카드 */}
        {!isCompareOnly && (
          <>
            <div className={`card summary-card risk-card-new ${activeFilter === '위험 점수' ? 'active-highlight' : ''}`}>
              <div className="card-header-flex">
                <span className="card-lbl flex items-center gap-1">
              <Activity size={14} className="text-gray-500" />
              과소비 위험 점수
            </span>
            <RiskIcon />
          </div>
          <div className={`risk-score-value ${getRiskColor(risk.level)} font-bold`}>
            {risk.score} <span className="text-xs text-gray-500 font-normal">/ 100</span>
          </div>
          <div className="flex items-center justify-between mt-2 w-full">
            <span className={`badge-large font-bold ${getRiskBg(risk.level)}`}>
              {risk.level}
            </span>
            <span className="text-xs text-gray-500">{formattedMonth}월 분석 기준</span>
          </div>
        </div>

        {/* 2. 총 지출 카드 */}
        <div className="card summary-card">
          <div className="card-header-flex">
            <span className="card-lbl flex items-center gap-1">
              <CreditCard size={14} className="text-gray-500" />
              {formattedMonth}월 총 지출
            </span>
          </div>
          <div className="stat-value text-navy font-bold mt-2">
            {formatCurrency(may.totalAmount)}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            건당 평균: {formatCurrency(Math.round(may.averageAmount))} ({may.transactionCount}건)
          </div>
        </div>
        </>
        )}

        {/* 3. 나머지 3개월 평균 대비 증감률 카드 */}
        <div className="card summary-card">
          <div className="card-header-flex">
            <span className="card-lbl flex items-center gap-1">
              <Percent size={14} className="text-gray-500" />
              나머지 3개월 평균 대비
            </span>
          </div>
          {comparison ? (
            <div className="mt-2">
              <div className={`stat-value font-bold flex items-center gap-1 ${comparison.totalIncreaseAmount > 0 ? 'text-red' : 'text-green'}`}>
                {comparison.totalIncreaseAmount > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                {comparison.totalIncreaseRatio > 0 ? '+' : ''}{(comparison.totalIncreaseRatio * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-2">
                평균({formatCurrency(Math.round(avg.totalAmount))}) 대비 {formatCurrency(Math.abs(comparison.totalIncreaseAmount))} {comparison.totalIncreaseAmount > 0 ? '초과' : '절약'}
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <div className="text-sm font-semibold text-gray-600">비교 데이터 없음</div>
              <div className="text-xs text-gray-500 mt-2">나머지 3개월의 데이터가 부족합니다.</div>
            </div>
          )}
        </div>

        {/* 4. 소비 유형 카드 (Clickable) */}
        {!isCompareOnly && (
        <div className="card summary-card">
          <div className="card-header-flex mb-2">
            <span className="card-lbl flex items-center gap-1">
              <UserCheck size={14} className="text-gray-500" />
              소비 유형 분류 상세
            </span>
          </div>
          <div className="spending-types-list mt-2 flex flex-col gap-2">
            {risk.spendingTypeSummaries && risk.spendingTypeSummaries.map(summary => {
              const isActive = activeFilter === summary.type;
              return (
                <button
                  key={summary.type}
                  className={`w-full text-left p-3 border rounded-xl transition ${isActive ? 'border-purple bg-purple-50 ring-1 ring-purple' : 'border-gray-200 hover:bg-gray-50'} ${summary.count === 0 && summary.type !== '균형 소비형' ? 'hidden' : ''}`}
                  onClick={() => summary.type !== '균형 소비형' && onWarningClick(summary.type)}
                  title="클릭하여 관련 소비 내역 보기"
                  disabled={summary.type === '균형 소비형'}
                >
                  <div className="font-bold text-sm text-navy">{summary.label}</div>
                  {summary.count > 0 ? (
                    <>
                      <div className="text-xs font-bold text-purple mt-1">{summary.count}건 / {formatCurrency(summary.totalAmount)}</div>
                      <div className="text-xs text-gray-600 mt-1">{summary.description}</div>
                    </>
                  ) : summary.type === '균형 소비형' ? (
                    <div className="text-xs text-gray-500 mt-1">{summary.description}</div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
        )}

        {/* 5. 가장 위험한 소비 패턴 카드 (Clickable) */}
        {!isCompareOnly && (
        <div className="card summary-card col-span-mobile">
          <div className="card-header-flex mb-2">
            <span className="card-lbl flex items-center gap-1 text-red font-semibold">
              <AlertCircle size={14} className="text-red" />
              가장 위험한 감점 요인 (Top 2)
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {top2DangerousRules.length > 0 ? top2DangerousRules.map(rule => (
              <button 
                key={rule.rule}
                className={`btn-danger-pattern text-left p-3 rounded-lg border border-red-200 hover:bg-red-50 transition w-full ${activeFilter === rule.rule ? 'active-pattern-highlight ring-2 ring-red' : ''}`}
                onClick={() => onWarningClick(rule.rule)}
                title="클릭하여 관련 소비 내역 보기"
              >
                <div className="font-bold text-red-dark">{rule.rule}</div>
                <div className="text-xs text-red mt-1">감점: -{rule.score}점</div>
              </button>
            )) : (
              <button className="btn-danger-pattern opacity-50 w-full text-center p-3 rounded-lg" disabled>없음</button>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            감점 요인 중 가장 점수가 높은 항목들입니다.
          </div>
        </div>
        )}

      </div>
    </div>
  );
};
