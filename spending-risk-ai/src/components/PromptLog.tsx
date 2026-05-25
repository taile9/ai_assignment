import React from 'react';
import { Terminal, CheckCircle, AlertOctagon } from 'lucide-react';

interface Props {
  prompt: string;
  response: string;
  isFallback: boolean;
  modelName: string;
  errorMessage?: string;
  parsedJsonString?: string;
  apiKeyExists?: boolean;
  allCandidates?: string[];
  requestUrl?: string;
  cleanedResponse?: string;
}

export const PromptLog: React.FC<Props> = ({ 
  prompt, 
  response, 
  isFallback, 
  modelName, 
  errorMessage, 
  parsedJsonString,
  apiKeyExists,
  allCandidates,
  requestUrl,
  cleanedResponse
}) => {
  return (
    <div className="prompt-log-container mt-6">
      <details className="prompt-details">
        <summary className="prompt-summary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-gray-600" />
            <span className="font-semibold text-sm">개발자용 프롬프트 및 API 응답 실시간 로그 (디버깅)</span>
          </div>
          <div className="flex items-center gap-2">
            {isFallback ? (
              <span className="badge bg-yellow-light text-yellow">Fallback 사용됨 (통계 기반 생성)</span>
            ) : (
              <span className="badge bg-green-light text-green flex items-center gap-1">
                <CheckCircle size={10} />
                Gemini API 연동 성공
              </span>
            )}
          </div>
        </summary>
        <div className="prompt-content animate-fade-in">
          
          <div className="log-section">
            <h5 className="log-title font-bold text-xs text-gray-500">API Key 설정 여부</h5>
            <div className="log-box font-mono">{apiKeyExists ? 'true' : 'false'}</div>
          </div>

          <div className="log-section mt-3">
            <h5 className="log-title font-bold text-xs text-gray-500">사용된 AI 모델 및 후보군</h5>
            <div className="log-box font-mono">
              <div>선택된 모델: {modelName}</div>
              {allCandidates && <div>시도한 후보군: {allCandidates.join(', ')}</div>}
            </div>
          </div>

          {requestUrl && (
            <div className="log-section mt-3">
              <h5 className="log-title font-bold text-xs text-gray-500">요청 URL (API 키 제외)</h5>
              <div className="log-box font-mono">{requestUrl}</div>
            </div>
          )}

          <div className="log-section mt-3">
            <h5 className="log-title font-bold text-xs text-gray-500">전송된 시스템 프롬프트 및 컨텍스트 (System Prompt & Input)</h5>
            <pre className="log-box-pre font-mono">{prompt}</pre>
          </div>

          <div className="log-section mt-3">
            <h5 className="log-title font-bold text-xs text-gray-500">API 응답 원본 (Raw AI JSON Response)</h5>
            <pre className="log-box-pre font-mono">{response}</pre>
          </div>

          {cleanedResponse && (
            <div className="log-section mt-3">
              <h5 className="log-title font-bold text-xs text-gray-500">마크다운 제거된 응답 (Cleaned Response)</h5>
              <pre className="log-box-pre font-mono">{cleanedResponse}</pre>
            </div>
          )}

          {parsedJsonString && (
            <div className="log-section mt-3">
              <h5 className="log-title font-bold text-xs text-gray-500">파싱 및 전처리된 JSON 문자열 (Parsed JSON String)</h5>
              <pre className="log-box-pre font-mono success-json">{parsedJsonString}</pre>
            </div>
          )}

          {errorMessage && (
            <div className="log-section mt-3">
              <h5 className="log-title font-bold text-xs text-red">파싱 에러 및 예외 로그 (Parser Exception Log)</h5>
              <div className="log-box font-mono text-red flex items-center gap-2">
                <AlertOctagon size={14} />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

        </div>
      </details>
    </div>
  );
};
