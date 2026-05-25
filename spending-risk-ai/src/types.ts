export type MonthStr = "2026-02" | "2026-03" | "2026-04" | "2026-05";

export type Category = 
  | "식비" 
  | "카페" 
  | "배달" 
  | "쇼핑" 
  | "교통" 
  | "문화/취미" 
  | "구독" 
  | "생활용품" 
  | "의료/건강" 
  | "기타";

export type PaymentType = "카드" | "현금" | "계좌이체" | "간편결제";

export interface Transaction {
  id: string;
  month: MonthStr;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: Category;
  merchant: string;
  amount: number;
  paymentType: PaymentType;
  memo: string;
  isSubscription: boolean;
}

export type RiskLevel = "안정형" | "주의형" | "위험형" | "고위험형";

export interface MonthlyStats {
  month: MonthStr;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  categoryTotals: Record<Category, number>;
  dayOfWeekTotals: Record<string, number>; // "월", "화", ...
  timeZoneTotals: Record<string, number>; // "새벽", "오전", "오후", "저녁", "야간"
  lateNightAmount: number;
  lateNightRatio: number; // 0~1
  subscriptionAmount: number;
  subscriptionRatio: number; // 0~1
  highValueCount: number; // >= 50,000
  smallRepeatCount: number; // < 10,000
  merchantCounts: Record<string, number>;
  categoryCounts: Record<Category, number>;
}

export interface ComparisonResult {
  totalIncreaseAmount: number;
  totalIncreaseRatio: number;
  categoryChanges: Record<Category, { increaseAmount: number, increaseRatio: number }>;
  lateNightRatioChange: number;
  subscriptionRatioChange: number;
  cafeCountChange: number;
  deliveryCountChange: number;
  shoppingAmountChange: number;
  highValueCountChange: number;
  smallRepeatCountChange: number;
}

export interface SpendingTypeSummary {
  type: string;
  label: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
  description: string;
  relatedTransactions: Transaction[];
}

export interface RiskAnalysis {
  score: number;
  level: RiskLevel;
  scoreBreakdown: { rule: string; score: number }[];
  spendingTypes: string[]; // Keep for backward compatibility
  spendingTypeSummaries: SpendingTypeSummary[];
}

export interface GeminiAnalysisInput {
  selectedMonth: MonthStr;
  mode: 'single' | 'compare';
  monthlyStats: MonthlyStats;
  baselineAvg?: MonthlyStats;
  comparison?: ComparisonResult;
  risk: RiskAnalysis;
  transactions: Transaction[];
}

export interface AiReportResponse {
  summary: string;
  selectedMonthDiagnosis: string;
  riskScoreExplanation: string;
  mostUrgentRisk: {
    title: string;
    reason: string;
    evidence: string;
    priority: "높음" | "중간" | "낮음";
  };
  patternAnalyses: {
    pattern: string;
    count: number;
    totalAmount: number;
    diagnosis: string;
    evidence: string;
    relatedTransactionSummary: string;
    improvementAction: string;
  }[];
  baselineComparison: string;
  categoryRecommendations: {
    category: string;
    currentStatus: string;
    recommendation: string;
    suggestedLimit: string;
  }[];
  nextMonthRules: string[];
  nextMonthChecklist: string[];
  reportText: string;
}
