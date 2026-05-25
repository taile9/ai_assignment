import React from 'react';
import { GeminiAnalysisInput, AiReportResponse } from '../types';
import { testGeminiConnection } from '../services/gemini';
import { PromptLog } from './PromptLog';
import { 
  Bot, 
  Loader2, 
  Sparkles, 
  TrendingDown, 
  Heart, 
  Scale, 
  CalendarRange, 
  Clock, 
  HelpCircle,
  ThumbsUp,
  AlertOctagon,
  ListTodo,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

interface Props {
  input: GeminiAnalysisInput;
  loading: boolean;
  onGenerate: () => void;
  report: AiReportResponse | null;
  logData: {
    prompt: string;
    response: string;
    isFallback: boolean;
    modelName: string;
    errorMessage?: string;
    parsedJsonString?: string;
  } | null;
}

export const AiReport: React.FC<Props> = ({ 
  input, 
  loading, 
  onGenerate, 
  report, 
  logData 
}) => {
  const formattedMonth = input.selectedMonth.split('-')[1];
  const [testingConnection, setTestingConnection] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{success: boolean, message: string} | null>(null);
  const [testLog, setTestLog] = React.useState<any>(null);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    setTestLog(null);
    try {
      const res = await testGeminiConnection();
      setTestResult({ success: res.success, message: res.message });
      setTestLog(res.logData);
    } catch (e: any) {
      setTestResult({ success: false, message: `Gemini 연결 실패: ${e.message}` });
    } finally {
      setTestingConnection(false);
    }
  };

  const displayLogData = testLog || logData;

  return (
    <div className="ai-container mt-6">
      
      {/* 1. 리포트 생성 헤더 카드 */}
      <div className="card ai-report-header-card">
        <div className="ai-report-header">
          <div className="flex items-center gap-2">
            <Bot size={28} className="text-purple animate-pulse" />
            <div>
              <h3 className="card-title text-lg font-bold mb-0">
                AI 소비 심층 분석 & 개선 리포트
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Gemini AI가 {formattedMonth}월 소비 내역 및 지출 통계를 분석하여 맞춤 행동 지침을 수립합니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="btn btn-secondary flex items-center gap-2 font-bold"
              onClick={handleTestConnection}
              disabled={testingConnection || loading}
            >
              {testingConnection ? (
                <>
                  <Loader2 size={16} className="spin" />
                  테스트 중...
                </>
              ) : (
                "Gemini 연결 테스트"
              )}
            </button>
            <button 
              className="btn btn-primary btn-ai flex items-center gap-2 font-bold"
              onClick={onGenerate}
              disabled={loading || testingConnection}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  분석 보고서 작성 중...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  {input.mode === 'compare' ? '5월 비교 리포트 재생성' : `${formattedMonth}월 AI 리포트 생성`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {testResult && (
        <div className={`alert ${testResult.success ? 'alert-success' : 'alert-danger'} mt-4 font-bold`}>
          {testResult.message}
        </div>
      )}

      {(report || displayLogData) && (
        <div className="ai-report-results-grid animate-fade-in mt-4">
          {displayLogData?.isFallback && !testLog && (
            <div className="alert alert-warning mb-4 flex items-center gap-2">
              <AlertOctagon size={18} />
              <span>
                Gemini API 키가 없거나 호출에 실패하여 통계 규칙 기반의 기본 AI 리포트를 로드했습니다. 
                Vite 환경 변수를 추가하면 더욱 깊이 있는 제미나이 맞춤 분석이 가능합니다.
              </span>
            </div>
          )}

          {/* 2. 종합 요약 진단 */}
          {report && (
            <>
              <div className="card ai-result-card border-purple">
                <h4 className="ai-section-title flex items-center gap-2">
              <Bot size={20} className="text-purple" />
              {formattedMonth}월 AI 소비 패턴 종합 진단
            </h4>
            <div className="ai-summary-highlight-box mt-3">
              <p className="summary-text font-semibold text-purple">“ {report.summary} ”</p>
            </div>
            
            <div className="report-detail-group mt-4">
              <h5 className="detail-subtitle">선택 월 집중 분석</h5>
              <p className="detail-desc text-md leading-relaxed">{report.selectedMonthDiagnosis}</p>
            </div>

            <div className="report-detail-group mt-4">
              <h5 className="detail-subtitle">위험 점수 책정 해설 ({input.risk.score}점)</h5>
              <p className="detail-desc text-md leading-relaxed">{report.riskScoreExplanation}</p>
            </div>

            {input.mode === 'compare' && (
              <div className="report-detail-group mt-4 border-t pt-4">
                <h5 className="detail-subtitle flex items-center gap-1">
                  <TrendingUp size={16} className="text-orange" />
                  전월 대비 과소비 증감 진단
                </h5>
                <p className="detail-desc text-md leading-relaxed">{report.baselineComparison}</p>
              </div>
            )}
          </div>

          {/* 3. AI 개선안 추천 (New Section Requirement 6) */}
          <div className="card ai-result-card border-green mt-4">
            <h4 className="ai-section-title flex items-center gap-2 text-green">
              <Sparkles size={20} className="text-green animate-pulse" />
              AI 개선안 추천 (Action Plan)
            </h4>

            <div className="ai-recommendations-grid mt-4">
              
              {/* 가장 먼저 줄여야 할 소비 (가장 심각한 위험) */}
              <div className="recommendation-module module-danger">
                <h5 className="module-title flex items-center gap-2 text-red font-bold">
                  <AlertOctagon size={16} className="text-red" />
                  가장 먼저 줄여야 할 소비 : {report.mostUrgentRisk.title}
                </h5>
                <div className="module-content mt-2">
                  <p className="mb-2"><strong>상태 진단:</strong> {report.mostUrgentRisk.reason}</p>
                  <p className="text-sm bg-red-light p-2 rounded-md font-mono">
                    <strong>소비 증거:</strong> {report.mostUrgentRisk.evidence}
                  </p>
                  <div className="mt-2 text-xs flex items-center justify-between">
                    <span className="badge bg-red-light font-bold">위험 우선순위: {report.mostUrgentRisk.priority}</span>
                  </div>
                </div>
              </div>

              {/* 유지해도 되는 소비 */}
              <div className="recommendation-module module-success mt-4">
                <h5 className="module-title flex items-center gap-2 text-green font-bold">
                  <ThumbsUp size={16} className="text-green" />
                  비교적 안전하며 유지해도 되는 소비
                </h5>
                <div className="module-content mt-2">
                  <p className="text-sm">
                    식비(배달 제외), 대중교통, 약국 등 건강 관리 및 공과금성 필수 고정비는 
                    현재 권장 한도 내에서 우수한 균형을 보여주고 있습니다. 무리한 필수비 통제보다는 
                    비필수 쇼핑 및 배달 충동 결제를 줄이는 데 집중하십시오.
                  </p>
                </div>
              </div>

              {/* 다음 달 카테고리별 권장 한도 */}
              <div className="recommendation-module mt-4">
                <h5 className="module-title flex items-center gap-2 text-navy font-bold">
                  <Scale size={16} className="text-navy" />
                  다음 달 카테고리별 AI 권장 지출 한도
                </h5>
                <div className="limit-table-container mt-2">
                  <table className="limit-table">
                    <thead>
                      <tr>
                        <th>카테고리</th>
                        <th>현재 지출 진단</th>
                        <th className="text-right">AI 제안 지출 한도</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.categoryRecommendations.map((item, i) => (
                        <tr key={i}>
                          <td className="font-semibold text-navy">{item.category}</td>
                          <td className="text-xs text-gray-600">{item.currentStatus}</td>
                          <td className="text-right font-bold text-green">{item.suggestedLimit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 특화 지출 통제 전략 */}
              <div className="recommendation-module mt-4">
                <h5 className="module-title flex items-center gap-2 text-purple font-bold">
                  <Clock size={16} className="text-purple" />
                  테마별 지출 패턴 통제 전략
                </h5>
                <div className="strategies-list mt-2">
                  {report.patternAnalyses.map((pa, i) => (
                    <div key={i} className="strategy-box p-3 rounded-xl bg-gray mb-3">
                      <strong className="text-xs text-purple block mb-1">【{pa.pattern}】</strong>
                      <p className="text-xs text-gray-700 mb-1"><strong>위험 분석:</strong> {pa.diagnosis}</p>
                      <p className="text-xs font-mono text-gray-500 mb-1"><strong>증거:</strong> {pa.evidence} / {pa.relatedTransactionSummary}</p>
                      <p className="text-sm font-semibold text-navy mt-2">👉 실천 지침: {pa.improvementAction}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 다음 달 행동 수칙 */}
              <div className="recommendation-module mt-4 bg-[#f8fafc] p-4 rounded-xl border border-slate-200">
                <h5 className="module-title flex items-center gap-2 text-navy font-bold">
                  <CalendarRange size={16} className="text-navy" />
                  다음 달 꼭 실천해야 할 핵심 지출 수칙
                </h5>
                <ol className="next-rules-ol mt-2">
                  {report.nextMonthRules.map((rule, i) => (
                    <li key={i} className="text-sm font-medium text-slate-800 mb-2">
                      <span className="ol-num">{i + 1}</span> {rule}
                    </li>
                  ))}
                </ol>
              </div>

              {/* 다음 달 체크리스트 */}
              <div className="recommendation-module mt-4">
                <h5 className="module-title flex items-center gap-2 text-navy font-bold">
                  <ListTodo size={16} className="text-navy" />
                  다음 달 소비 다이어트 실천 체크리스트
                </h5>
                <ul className="checklist-ul mt-2">
                  {report.nextMonthChecklist.map((task, i) => (
                    <li key={i} className="checklist-li flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <input type="checkbox" className="custom-chk" defaultChecked={false} />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {report?.reportText && (
              <div className="report-footer-text border-t pt-4 mt-6 text-sm text-gray-500 italic leading-relaxed text-center">
                “ {report.reportText} ”
              </div>
            )}
          </div>
          </>
          )}

          {/* 4. 프롬프트 로그 & API 응답 디버거 */}
          {displayLogData && (
            <PromptLog 
              prompt={displayLogData.prompt} 
              response={displayLogData.response || displayLogData.rawResponse} 
              isFallback={displayLogData.isFallback} 
              modelName={displayLogData.selectedModel || displayLogData.modelName} 
              errorMessage={displayLogData.errorMessage}
              parsedJsonString={displayLogData.parsedJsonString}
              apiKeyExists={displayLogData.apiKeyExists}
              allCandidates={displayLogData.allCandidates}
              requestUrl={displayLogData.requestUrl}
              cleanedResponse={displayLogData.cleanedResponse}
            />
          )}

        </div>
      )}
    </div>
  );
};
