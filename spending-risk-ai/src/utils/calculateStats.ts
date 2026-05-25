import { Transaction, MonthlyStats, Category, MonthStr } from '../types';
import { getDayOfWeek, getTimeZone, isLateNight } from './dateUtils';

const initCategories = (): Record<Category, number> => ({
  "식비": 0, "카페": 0, "배달": 0, "쇼핑": 0, "교통": 0,
  "문화/취미": 0, "구독": 0, "생활용품": 0, "의료/건강": 0, "기타": 0
});

export const calculateStats = (transactions: Transaction[], month: MonthStr): MonthlyStats => {
  const monthData = transactions.filter(t => t.month === month);
  
  const stats: MonthlyStats = {
    month,
    totalAmount: 0,
    transactionCount: monthData.length,
    averageAmount: 0,
    categoryTotals: initCategories(),
    dayOfWeekTotals: { '월': 0, '화': 0, '수': 0, '목': 0, '금': 0, '토': 0, '일': 0 },
    timeZoneTotals: { '새벽': 0, '오전': 0, '오후': 0, '저녁': 0, '야간': 0 },
    lateNightAmount: 0,
    lateNightRatio: 0,
    subscriptionAmount: 0,
    subscriptionRatio: 0,
    highValueCount: 0,
    smallRepeatCount: 0,
    merchantCounts: {},
    categoryCounts: initCategories()
  };

  if (monthData.length === 0) return stats;

  monthData.forEach(t => {
    stats.totalAmount += t.amount;
    stats.categoryTotals[t.category] += t.amount;
    stats.categoryCounts[t.category] += 1;
    
    stats.dayOfWeekTotals[getDayOfWeek(t.date)] += t.amount;
    stats.timeZoneTotals[getTimeZone(t.time)] += t.amount;

    if (isLateNight(t.time)) {
      stats.lateNightAmount += t.amount;
    }

    if (t.isSubscription || t.category === '구독') {
      stats.subscriptionAmount += t.amount;
    }

    if (t.amount >= 50000) {
      stats.highValueCount += 1;
    }

    if (t.amount < 10000) {
      stats.smallRepeatCount += 1;
    }

    stats.merchantCounts[t.merchant] = (stats.merchantCounts[t.merchant] || 0) + 1;
  });

  stats.averageAmount = stats.totalAmount / stats.transactionCount;
  stats.lateNightRatio = stats.totalAmount > 0 ? stats.lateNightAmount / stats.totalAmount : 0;
  stats.subscriptionRatio = stats.totalAmount > 0 ? stats.subscriptionAmount / stats.totalAmount : 0;

  return stats;
};

export const calculateBaselineAverage = (transactions: Transaction[], excludeMonth: MonthStr): MonthlyStats => {
  const allMonths: MonthStr[] = ['2026-02', '2026-03', '2026-04', '2026-05'];
  const baselineMonths = allMonths.filter(m => m !== excludeMonth);

  const m1 = calculateStats(transactions, baselineMonths[0]);
  const m2 = calculateStats(transactions, baselineMonths[1]);
  const m3 = calculateStats(transactions, baselineMonths[2]);

  const avgCategoryTotals = initCategories();
  (Object.keys(avgCategoryTotals) as Category[]).forEach(cat => {
    avgCategoryTotals[cat] = (m1.categoryTotals[cat] + m2.categoryTotals[cat] + m3.categoryTotals[cat]) / 3;
  });

  const avgCategoryCounts = initCategories();
  (Object.keys(avgCategoryCounts) as Category[]).forEach(cat => {
    avgCategoryCounts[cat] = (m1.categoryCounts[cat] + m2.categoryCounts[cat] + m3.categoryCounts[cat]) / 3;
  });

  const avgTotal = (m1.totalAmount + m2.totalAmount + m3.totalAmount) / 3;
  const avgCount = (m1.transactionCount + m2.transactionCount + m3.transactionCount) / 3;

  return {
    month: "2026-02", // placeholder for average
    totalAmount: avgTotal,
    transactionCount: avgCount,
    averageAmount: avgTotal / (avgCount || 1),
    categoryTotals: avgCategoryTotals,
    dayOfWeekTotals: {},
    timeZoneTotals: {},
    lateNightAmount: (m1.lateNightAmount + m2.lateNightAmount + m3.lateNightAmount) / 3,
    lateNightRatio: avgTotal > 0 ? ((m1.lateNightAmount + m2.lateNightAmount + m3.lateNightAmount) / 3) / avgTotal : 0,
    subscriptionAmount: (m1.subscriptionAmount + m2.subscriptionAmount + m3.subscriptionAmount) / 3,
    subscriptionRatio: avgTotal > 0 ? ((m1.subscriptionAmount + m2.subscriptionAmount + m3.subscriptionAmount) / 3) / avgTotal : 0,
    highValueCount: (m1.highValueCount + m2.highValueCount + m3.highValueCount) / 3,
    smallRepeatCount: (m1.smallRepeatCount + m2.smallRepeatCount + m3.smallRepeatCount) / 3,
    merchantCounts: {},
    categoryCounts: avgCategoryCounts
  };
};
