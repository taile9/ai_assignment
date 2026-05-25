import { MonthlyStats, ComparisonResult, RiskAnalysis, RiskLevel, Transaction, Category, MonthStr, SpendingTypeSummary } from '../types';
import { isLateNight } from './dateUtils';

export const classifySpendingType = (
  may: MonthlyStats,
  avg: MonthlyStats,
  comparison: ComparisonResult | undefined,
  transactions: Transaction[],
  targetMonth: MonthStr = '2026-05'
): RiskAnalysis => {
  const mayTransactions = transactions.filter(t => t.month === targetMonth);
  let score = 0;
  const scoreBreakdown: { rule: string; score: number }[] = [];

  const addScore = (rule: string, points: number) => {
    score += points;
    scoreBreakdown.push({ rule, score: points });
  };

  // 1. Non-essential ratio (배달, 카페, 쇼핑, 문화/취미) - 구독 제외
  const nonEssentialCategories = ['배달', '카페', '쇼핑', '문화/취미'];
  let nonEssentialAmount = 0;
  nonEssentialCategories.forEach(c => {
    nonEssentialAmount += may.categoryTotals[c as Category] || 0;
  });
  const nonEssentialRatio = may.totalAmount > 0 ? nonEssentialAmount / may.totalAmount : 0;

  if (nonEssentialRatio >= 0.6) addScore('비필수 소비 60% 이상', 25);
  else if (nonEssentialRatio >= 0.45) addScore('비필수 소비 45% 이상', 18);
  else if (nonEssentialRatio >= 0.3) addScore('비필수 소비 30% 이상', 10);

  // 2. Late-night ratio
  if (may.lateNightRatio >= 0.25) addScore('야간 소비 25% 이상', 20);
  else if (may.lateNightRatio >= 0.15) addScore('야간 소비 15% 이상', 12);
  else if (may.lateNightRatio >= 0.1) addScore('야간 소비 10% 이상', 6);

  // 3. Repeated spending
  let hasCategory30 = false;
  Object.keys(may.categoryTotals).forEach(cat => {
    if (may.totalAmount > 0 && (may.categoryTotals[cat as Category] / may.totalAmount) >= 0.3) {
      hasCategory30 = true;
    }
  });
  if (hasCategory30) addScore('단일 카테고리 30% 이상 집중', 15);

  let hasMerchant4 = false;
  Object.values(may.merchantCounts).forEach(count => {
    if (count >= 4) hasMerchant4 = true;
  });
  if (hasMerchant4) addScore('동일 가맹점 4회 이상 결제', 10);

  // 4. Subscription
  if (may.subscriptionRatio >= 0.15) addScore('구독 소비 15% 이상', 15);
  else if (may.subscriptionRatio >= 0.1) addScore('구독 소비 10% 이상', 8);

  // 5. High-value
  if (may.highValueCount >= 3) addScore('5만원 이상 결제 3회 이상', 15);
  else if (may.highValueCount >= 1) addScore('5만원 이상 결제 1~2회', 8);

  // 6. Small repeated
  if (may.smallRepeatCount >= 10) addScore('1만원 미만 결제 10회 이상', 10);
  else if (may.smallRepeatCount >= 5) addScore('1만원 미만 결제 5회 이상', 5);

  // 7. Increase (Comparison rules - only apply for May with comparison object)
  if (targetMonth === '2026-05' && comparison) {
    if (comparison.totalIncreaseRatio >= 0.2) addScore('전월 대비 총지출 20% 이상 증가', 10);
    
    if (avg.lateNightAmount > 0 && may.lateNightAmount >= avg.lateNightAmount * 1.3) {
      addScore('전월 대비 야간 소비 30% 이상 증가', 10);
    } else if (avg.lateNightAmount === 0 && may.lateNightAmount > 0) {
      addScore('전월 대비 야간 소비 30% 이상 증가', 10);
    }

    const mayDelShop = (may.categoryTotals['배달'] || 0) + (may.categoryTotals['쇼핑'] || 0);
    const avgDelShop = (avg.categoryTotals['배달'] || 0) + (avg.categoryTotals['쇼핑'] || 0);
    if (avgDelShop > 0 && mayDelShop >= avgDelShop * 1.3) {
      addScore('전월 대비 배달/쇼핑 30% 이상 증가', 10);
    } else if (avgDelShop === 0 && mayDelShop > 0) {
      addScore('전월 대비 배달/쇼핑 30% 이상 증가', 10);
    }
  }

  // Clamp score
  score = Math.min(Math.max(score, 0), 100);

  // Risk Level
  let level: RiskLevel = '안정형';
  if (score >= 81) level = '고위험형';
  else if (score >= 61) level = '위험형';
  else if (score >= 31) level = '주의형';

  // Classification Types and Summaries
  const types: string[] = [];
  const summaries: SpendingTypeSummary[] = [];

  const addSummary = (type: string, txs: Transaction[], desc: string) => {
    types.push(type);
    const count = txs.length;
    const totalAmount = txs.reduce((sum, t) => sum + t.amount, 0);
    summaries.push({
      type,
      label: type,
      count,
      totalAmount,
      averageAmount: count > 0 ? Math.round(totalAmount / count) : 0,
      description: desc,
      relatedTransactions: txs
    });
  };

  const lateNightDeliveryTxs = mayTransactions.filter(t => t.category === '배달' && isLateNight(t.time));
  if (lateNightDeliveryTxs.length >= 3) {
    addSummary('야간 배달형', lateNightDeliveryTxs, "22시 이후 배달 소비가 반복되어 충동성 소비 위험이 있습니다.");
  }

  const cafeTxs = mayTransactions.filter(t => t.category === '카페');
  if (cafeTxs.length >= 7) {
    addSummary('카페 누적형', cafeTxs, "카페 소비가 반복되어 소액 누적 소비로 이어질 가능성이 있습니다.");
  }

  const highValueShoppingTxs = mayTransactions.filter(t => t.category === '쇼핑' && t.amount >= 50000);
  if (highValueShoppingTxs.length >= 2) {
    addSummary('할인 충동구매형', highValueShoppingTxs, "5만 원 이상 쇼핑 결제가 반복되어 충동구매 가능성이 있습니다.");
  }

  const subTxs = mayTransactions.filter(t => t.isSubscription || t.category === '구독');
  if (subTxs.length >= 2) {
    addSummary('구독 방치형', subTxs, "정기 결제성 소비가 반복되고 있어 사용 여부 점검이 필요합니다.");
  }

  const getDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getDay(); // 0 is Sun, 5 is Fri, 6 is Sat
  };
  const weekendTxs = mayTransactions.filter(t => [0, 5, 6].includes(getDay(t.date)));
  const weekendAmountSum = weekendTxs.reduce((acc, cur) => acc + cur.amount, 0);
  if (may.totalAmount > 0 && weekendAmountSum / may.totalAmount >= 0.45) {
    addSummary('주말 소비 집중형', weekendTxs, "주말에 소비가 집중되어 계획 외 지출이 늘어날 가능성이 있습니다.");
  }

  if (targetMonth === '2026-05' && comparison && comparison.totalIncreaseRatio >= 0.2) {
    const increasedCats = Object.entries(comparison.categoryChanges)
      .filter(([_, val]) => val.increaseAmount > 0)
      .map(([cat]) => cat);
    const increaseTxs = mayTransactions.filter(t => increasedCats.includes(t.category));
    addSummary('전월 대비 과소비 증가형', increaseTxs, "최근 기준선 대비 특정 카테고리 소비가 증가했습니다.");
  }

  const smallTxs = mayTransactions.filter(t => t.amount < 10000);
  if (smallTxs.length >= 10) {
    addSummary('소액 누적형', smallTxs, "건당 금액은 작지만 반복되면서 누적 지출이 커질 수 있습니다.");
  }

  if (types.length === 0) {
    types.push('균형 소비형');
    summaries.push({
      type: '균형 소비형',
      label: '균형 소비형',
      count: 0,
      totalAmount: 0,
      averageAmount: 0,
      description: "뚜렷한 위험 패턴이 없어 관련 경고 소비 내역이 없습니다.",
      relatedTransactions: []
    });
  }

  return {
    score,
    level,
    scoreBreakdown,
    spendingTypes: types,
    spendingTypeSummaries: summaries
  };
};
