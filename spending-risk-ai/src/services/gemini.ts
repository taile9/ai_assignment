import { GeminiAnalysisInput, AiReportResponse, Category } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export const testGeminiConnection = async (): Promise<{ success: boolean; message: string; logData: any }> => {
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  const promptText = '연결 테스트입니다. JSON으로만 {"status":"ok"}를 반환해줘.';
  
  const logData = {
    apiKeyExists: !!API_KEY,
    selectedModel: '',
    allCandidates: modelsToTry,
    requestUrl: '',
    prompt: promptText,
    rawResponse: '',
    cleanedResponse: '',
    parsedJsonString: '',
    errorMessage: '',
    isFallback: false
  };

  if (!API_KEY) {
    logData.errorMessage = 'API 키가 설정되지 않았습니다.';
    logData.isFallback = true;
    return { success: false, message: 'Gemini 연결 실패: API 키가 없습니다.', logData };
  }

  for (const model of modelsToTry) {
    try {
      logData.selectedModel = model;
      const url = `${GEMINI_API_BASE}/${model}:generateContent`;
      logData.requestUrl = url; // log without key

      const response = await fetch(`${url}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || '알 수 없는 API 에러');
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      logData.rawResponse = text;

      let cleaned = text.trim();
      if (cleaned.includes('```')) {
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      }
      logData.cleanedResponse = cleaned;

      const parsed = JSON.parse(cleaned);
      logData.parsedJsonString = JSON.stringify(parsed, null, 2);

      if (parsed.status === 'ok') {
        return { success: true, message: 'Gemini 연결 성공', logData };
      } else {
        throw new Error('응답 JSON 형식이 올바르지 않습니다.');
      }
    } catch (error: any) {
      logData.errorMessage = error.message;
      // Try next model if current one fails
    }
  }

  logData.isFallback = true;
  return { success: false, message: `Gemini 연결 실패: ${logData.errorMessage}`, logData };
};

export const generateAiReport = async (input: GeminiAnalysisInput): Promise<{
  report: AiReportResponse,
  promptUsed: string,
  rawResponse: string,
  isFallback: boolean,
  modelName: string,
  errorMessage?: string,
  parsedJsonString?: string,
  requestUrl?: string,
  apiKeyExists: boolean,
  allCandidates: string[],
  cleanedResponse?: string
}> => {
  const isCompareMode = input.mode === 'compare';
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  const inputJson = JSON.stringify({
    selectedMonth: input.selectedMonth,
    mode: isCompareMode ? '5월 vs 최근 3개월(2~4월) 평균 비교 분석' : '단일 월 분석',
    riskScore: input.risk.score,
    riskLevel: input.risk.level,
    spendingTypes: input.risk.spendingTypes,
    spendingTypeSummaries: input.risk.spendingTypeSummaries?.map(s => ({
      type: s.type,
      count: s.count,
      totalAmount: s.totalAmount,
      averageAmount: s.averageAmount,
      description: s.description
    })),
    scoreBreakdown: input.risk.scoreBreakdown,
    monthlyStats: {
      totalAmount: input.monthlyStats.totalAmount,
      transactionCount: input.monthlyStats.transactionCount,
      averageAmount: Math.round(input.monthlyStats.averageAmount),
      categoryTotals: input.monthlyStats.categoryTotals,
      dayOfWeekTotals: input.monthlyStats.dayOfWeekTotals,
      timeZoneTotals: input.monthlyStats.timeZoneTotals,
      lateNightAmount: input.monthlyStats.lateNightAmount,
      lateNightRatio: input.monthlyStats.lateNightRatio,
      subscriptionAmount: input.monthlyStats.subscriptionAmount,
      subscriptionRatio: input.monthlyStats.subscriptionRatio,
      highValueCount: input.monthlyStats.highValueCount,
      smallRepeatCount: input.monthlyStats.smallRepeatCount,
    },
    baselineComparison: (isCompareMode && input.baselineAvg && input.comparison) ? {
      baselineTotalAverage: Math.round(input.baselineAvg.totalAmount),
      totalIncreaseAmount: input.comparison.totalIncreaseAmount,
      totalIncreaseRatio: input.comparison.totalIncreaseRatio,
      categoryChanges: input.comparison.categoryChanges,
      lateNightRatioChange: input.comparison.lateNightRatioChange,
      subscriptionRatioChange: input.comparison.subscriptionRatioChange
    } : null,
    transactions: input.transactions.map(t => ({
      date: t.date,
      time: t.time,
      category: t.category,
      merchant: t.merchant,
      amount: t.amount,
      isSubscription: t.isSubscription
    }))
  }, null, 2);

  const prompt = `너는 개인 소비 패턴 분석 전문가야.

입력된 소비 내역 기준으로 사용자의 월별 소비 패턴을 분석해줘.
단순 요약이 아니라, 계산된 지표와 실제 소비 내역을 근거로 과소비 원인, 위험 패턴, 개선 우선순위, 다음 달 실천 전략을 분석해야 해.

중요 규칙:
1. 실제 개인정보를 추측하지 마.
2. 제공된 소비 데이터와 계산 지표만 기준으로 분석해.
3. 금융 투자 조언처럼 표현하지 마.
4. 반드시 "입력된 소비 내역 기준"이라는 표현을 포함해.
5. 출력은 반드시 JSON만 반환해.
6. 마크다운 코드블록을 쓰지 마.
7. JSON 내부 모든 문자열 값은 한국어로 작성해.
8. 각 소비 유형을 분석할 때 반드시 해당 유형의 거래 건수, 총액, 평균 결제액을 근거로 포함해.
   예를 들어 "카페 누적형"이라면 카페 소비가 몇 건이고 총 얼마인지 설명해야 해.
   "야간 배달형"이라면 22시 이후 배달 소비가 몇 건이고 총 얼마인지 설명해야 해.
   "구독 방치형"이라면 구독 결제가 몇 건이고 총 얼마인지 설명해야 해.
   단순히 "많다", "반복된다"라고 표현하지 말고, 입력된 소비 내역 기준의 수치를 사용해 근거를 제시해.

분석 대상:
- 선택 월
- 선택 월 소비 내역
- 월별 통계
- 위험 점수
- 위험 점수 산출 근거
- 소비 유형
- 위험 패턴
- 경고 관련 소비 내역
- 이전 월 비교
- 2~4월 평균 대비 5월 비교

분석해야 할 내용:
- 선택 월의 소비 진단
- 위험 점수가 나온 이유
- 가장 긴급한 소비 위험
- 실제 소비 내역 근거
- 카테고리별 개선안
- 다음 달 권장 한도
- 구독 점검 전략
- 야간 소비 줄이는 방법
- 소액 반복 소비 줄이는 방법
- 다음 달 체크리스트

입력 데이터:
${inputJson}

반환 JSON 스키마:
{
  "summary": "string",
  "selectedMonthDiagnosis": "string",
  "riskScoreExplanation": "string",
  "mostUrgentRisk": {
    "title": "string",
    "reason": "string",
    "evidence": "string",
    "priority": "높음" | "중간" | "낮음"
  },
  "patternAnalyses": [
    {
      "pattern": "string",
      "count": "number",
      "totalAmount": "number",
      "diagnosis": "string",
      "evidence": "string",
      "relatedTransactionSummary": "string",
      "improvementAction": "string"
    }
  ],
  "categoryRecommendations": [
    {
      "category": "string",
      "currentStatus": "string",
      "recommendation": "string",
      "suggestedLimit": "string"
    }
  ],
  "nextMonthRules": ["string"],
  "nextMonthChecklist": ["string"],
  "reportText": "string"
}`;

  const getFallbackReport = (): AiReportResponse => {
    return {
      summary: `${input.selectedMonth.split('-')[1]}월 총 지출은 ${input.monthlyStats.totalAmount.toLocaleString()}원이며, 입력된 소비 내역 기준 당신의 소비 위험 등급은 '${input.risk.level}'(위험 점수: ${input.risk.score}점)입니다.`,
      selectedMonthDiagnosis: `입력된 소비 내역 기준, ${input.selectedMonth.split('-')[1]}월 소비 분석 결과 비필수 소비 비중이 ${((input.monthlyStats.totalAmount > 0 ? (input.monthlyStats.categoryTotals['배달'] + input.monthlyStats.categoryTotals['카페'] + input.monthlyStats.categoryTotals['쇼핑'] + input.monthlyStats.categoryTotals['문화/취미']) / input.monthlyStats.totalAmount : 0) * 100).toFixed(1)}%로 나타납니다.`,
      riskScoreExplanation: `과소비 위험 점수는 ${input.risk.score}점입니다. 주요 감점 요인은 ${input.risk.scoreBreakdown.map(b => `${b.rule}(+${b.score}점)`).join(', ') || '없음'} 입니다.`,
      mostUrgentRisk: {
        title: input.risk.spendingTypes[0] || "균형 소비형",
        reason: `선택한 월에 경고 등급을 높이는 가장 결정적인 원인입니다.`,
        evidence: `야간 배달 ${input.monthlyStats.categoryCounts['배달'] || 0}회 결제, 소액 누적 결제 ${input.monthlyStats.smallRepeatCount}회 등이 감지되었습니다.`,
        priority: input.risk.score > 60 ? "높음" : (input.risk.score > 30 ? "중간" : "낮음")
      },
      patternAnalyses: [
        {
          pattern: "야간 소비 패턴",
          count: 5,
          totalAmount: input.monthlyStats.lateNightAmount,
          diagnosis: `야간 결제가 전체 지출의 ${(input.monthlyStats.lateNightRatio * 100).toFixed(1)}%를 차지하고 있습니다.`,
          evidence: `22시 이후 야간 지출액: ${input.monthlyStats.lateNightAmount.toLocaleString()}원`,
          relatedTransactionSummary: `주요 야간 지출 가맹점 다수 존재`,
          improvementAction: "야간 22시 이후 배달앱 결제를 주 1회 이하로 통제하는 것이 우선 과제입니다."
        },
        {
          pattern: "구독 및 반복 소비 패턴",
          count: 3,
          totalAmount: input.monthlyStats.subscriptionAmount,
          diagnosis: `정기 구독 결제 비율이 ${(input.monthlyStats.subscriptionRatio * 100).toFixed(1)}% 수준으로 파악됩니다.`,
          evidence: `정기 결제 및 구독 총액: ${input.monthlyStats.subscriptionAmount.toLocaleString()}원`,
          relatedTransactionSummary: `구독 가맹점 내역 존재`,
          improvementAction: "사용 빈도가 낮은 OTT 및 유료 멤버십 서비스를 선별하여 정기 구독 건수를 즉시 줄이십시오."
        }
      ],
      baselineComparison: isCompareMode && input.comparison
        ? `기준 3개월(2~4월) 평균 대비 총 지출이 ${input.comparison.totalIncreaseAmount > 0 ? (input.comparison.totalIncreaseAmount.toLocaleString() + '원 증가') : (Math.abs(input.comparison.totalIncreaseAmount).toLocaleString() + '원 감소')} (${(input.comparison.totalIncreaseRatio * 100).toFixed(1)}%) 하였습니다.`
        : "단일 월 분석 모드이므로 전월 대비 증감 비교는 생략합니다.",
      categoryRecommendations: (Object.keys(input.monthlyStats.categoryTotals) as Category[]).map(cat => {
        const amt = input.monthlyStats.categoryTotals[cat] || 0;
        const total = input.monthlyStats.totalAmount;
        return {
          category: cat,
          currentStatus: `지출액: ${amt.toLocaleString()}원 (${total > 0 ? ((amt / total) * 100).toFixed(1) : 0}%)`,
          recommendation: amt > 80000 ? "예산 통제가 시급하며 정기적인 한도 설정이 권장됩니다." : "현재 안정적인 수준을 유지하고 있습니다.",
          suggestedLimit: amt > 0 ? `${Math.round(amt * 0.8 / 1000) * 1000}원` : "0원"
        };
      }),
      nextMonthRules: [
        "충동 구매 전 '장바구니'에 담아두고 24시간 후 다시 결정하기",
        "야간 배달 결제는 일주일에 최대 1회로 한도 설정하기",
        "불필요한 고액 쇼핑 품목은 월 1회로 한정하기"
      ],
      nextMonthChecklist: [
        "안 쓰는 유료 멤버십/구독 서비스 해지 신청 완료하기",
        "하루 지출 예산 2만원 한도 챌린지 3회 도전하기",
        "소액 결제 모아보기로 주간 단위 잔고 체크하기"
      ],
      reportText: "이 리포트는 Gemini API 연동 실패로 인해 생성된 기본 통계 기반의 한국어 대체 리포트입니다."
    };
  };

  const baseLogData = {
    apiKeyExists: !!API_KEY,
    allCandidates: modelsToTry,
    isFallback: true,
    modelName: 'None (Local Rule fallback)'
  };

  if (!API_KEY) {
    return {
      report: getFallbackReport(),
      promptUsed: prompt,
      rawResponse: 'API 키가 설정되지 않아 호출을 건너뛰고 기본 통계 기반 리포트를 제공합니다.',
      errorMessage: 'API 키가 없습니다.',
      ...baseLogData
    };
  }

  for (const model of modelsToTry) {
    try {
      const url = `${GEMINI_API_BASE}/${model}:generateContent`;
      
      const response = await fetch(`${url}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || '알 수 없는 API 에러');
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      let cleaned = text.trim();
      if (cleaned.includes('```')) {
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      }
      
      const parsed = JSON.parse(cleaned) as AiReportResponse;

      return {
        report: parsed,
        promptUsed: prompt,
        rawResponse: text,
        cleanedResponse: cleaned,
        isFallback: false,
        modelName: model,
        parsedJsonString: JSON.stringify(parsed, null, 2),
        requestUrl: url,
        apiKeyExists: !!API_KEY,
        allCandidates: modelsToTry
      };
    } catch (error: any) {
      console.error(`Gemini API Error with model ${model}:`, error);
      // Try next model
    }
  }

  // All models failed
  return {
    report: getFallbackReport(),
    promptUsed: prompt,
    rawResponse: '모든 모델 호환성 테스트 실패 또는 API 호출 오류',
    errorMessage: '모든 모델에서 API 호출에 실패했습니다.',
    ...baseLogData
  };
};
