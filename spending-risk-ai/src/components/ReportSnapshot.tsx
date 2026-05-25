import React from 'react';
import { MonthStr, RiskAnalysis, AiReportResponse } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { Camera, Calendar, Award, Sparkles, AlertOctagon } from 'lucide-react';

interface Props {
  selectedMonth: MonthStr;
  risk: RiskAnalysis;
  totalAmount: number;
  report: AiReportResponse | null;
}

export const ReportSnapshot: React.FC<Props> = ({ selectedMonth, risk, totalAmount, report }) => {
  const getRiskColorClass = (level: string) => {
    switch(level) {
      case '안정형': return 'snapshot-green';
      case '주의형': return 'snapshot-yellow';
      case '위험형': return 'snapshot-orange';
      case '고위험형': return 'snapshot-red';
      default: return '';
    }
  };

  const formattedMonth = selectedMonth.split('-')[1];

  return (
    <div className="card snapshot-card border-double" id="report-snapshot-card">
      <div className="snapshot-header">
        <div className="flex items-center gap-2">
          <Camera className="text-navy" size={20} />
          <h3 className="snapshot-title">보고서용 요약 (과제 제출 및 기록용)</h3>
        </div>
        <span className="snapshot-tip">※ 이 영역을 캡처하여 대학 과제 보고서 등에 첨부할 수 있습니다.</span>
      </div>

      <div className="snapshot-canvas">
        <div className="snapshot-grid">
          {/* Month & Spending */}
          <div className="snapshot-cell">
            <div className="cell-label flex items-center gap-1">
              <Calendar size={14} className="text-gray-500" />
              분석 기준 월 및 총 지출
            </div>
            <div className="cell-value">{formattedMonth}월 지출</div>
            <div className="cell-sub font-semibold text-navy">{formatCurrency(totalAmount)}</div>
          </div>

          {/* Risk Level */}
          <div className="snapshot-cell">
            <div className="cell-label flex items-center gap-1">
              <AlertOctagon size={14} className="text-gray-500" />
              과소비 위험 등급
            </div>
            <div className={`cell-value font-bold ${getRiskColorClass(risk.level)}-text`}>
              {risk.level}
            </div>
            <div className="cell-sub">위험도 점수: <strong className="text-navy">{risk.score}점</strong> / 100</div>
          </div>

          {/* Consumer Types */}
          <div className="snapshot-cell col-span-2">
            <div className="cell-label">소비 위험 유형 분류</div>
            <div className="snapshot-badges-container">
              {risk.spendingTypes.map(t => (
                <span key={t} className={`snapshot-badge ${getRiskColorClass(risk.level)}-badge`}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Most Urgent Risk */}
          <div className="snapshot-cell col-span-2">
            <div className="cell-label flex items-center gap-1">
              <AlertOctagon size={14} className="text-red" />
              가장 긴급한 소비 위험
            </div>
            <div className="cell-value mt-1 text-red font-bold text-sm">
              {report && report.mostUrgentRisk ? report.mostUrgentRisk.title : "분석 대기 중"}
            </div>
            {report && report.mostUrgentRisk && (
              <div className="cell-sub mt-1 text-xs text-gray-700">
                {report.mostUrgentRisk.reason}
              </div>
            )}
          </div>
        </div>

        {/* Diagnosis & Recommendations */}
        <div className="snapshot-diagnosis-section">
          <div className="diagnosis-box">
            <h4 className="flex items-center gap-1">
              <Sparkles size={16} className="text-purple" />
              AI 종합 분석 및 한 줄 진단
            </h4>
            <p className="diagnosis-text">
              {report 
                ? report.selectedMonthDiagnosis 
                : "소비 패턴 상세 리포트를 생성해 주세요. AI 분석 진단이 실시간으로 이곳에 반영됩니다."}
            </p>
          </div>

          <div className="diagnosis-box">
            <h4 className="flex items-center gap-1">
              <Award size={16} className="text-green" />
              핵심 행동 개선 권장사항
            </h4>
            <ul className="snapshot-rules-list">
              {report && report.nextMonthRules && report.nextMonthRules.length > 0 ? (
                report.nextMonthRules.map((rule, i) => <li key={i}>{rule}</li>)
              ) : (
                <>
                  <li>비필수 결제 빈도수(식비 배달, 카페 테이크아웃)를 기존 대비 20% 줄이십시오.</li>
                  <li>정기결제(구독) 항목 중 사용하지 않는 서비스를 파악해 정리해 보십시오.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
