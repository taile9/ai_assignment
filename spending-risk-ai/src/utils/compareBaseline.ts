import { MonthlyStats, ComparisonResult, Category } from '../types';

export const compareBaseline = (may: MonthlyStats, avg: MonthlyStats): ComparisonResult => {
  const increaseAmount = may.totalAmount - avg.totalAmount;
  const increaseRatio = avg.totalAmount > 0 ? increaseAmount / avg.totalAmount : 0;

  const categoryChanges = {} as Record<Category, { increaseAmount: number, increaseRatio: number }>;
  
  (Object.keys(may.categoryTotals) as Category[]).forEach(cat => {
    const mayAmt = may.categoryTotals[cat];
    const avgAmt = avg.categoryTotals[cat];
    const diff = mayAmt - avgAmt;
    categoryChanges[cat] = {
      increaseAmount: diff,
      increaseRatio: avgAmt > 0 ? diff / avgAmt : (mayAmt > 0 ? 1 : 0)
    };
  });

  return {
    totalIncreaseAmount: increaseAmount,
    totalIncreaseRatio: increaseRatio,
    categoryChanges,
    lateNightRatioChange: may.lateNightRatio - avg.lateNightRatio,
    subscriptionRatioChange: may.subscriptionRatio - avg.subscriptionRatio,
    cafeCountChange: may.categoryCounts['카페'] - avg.categoryCounts['카페'],
    deliveryCountChange: may.categoryCounts['배달'] - avg.categoryCounts['배달'],
    shoppingAmountChange: may.categoryTotals['쇼핑'] - avg.categoryTotals['쇼핑'],
    highValueCountChange: may.highValueCount - avg.highValueCount,
    smallRepeatCountChange: may.smallRepeatCount - avg.smallRepeatCount
  };
};
