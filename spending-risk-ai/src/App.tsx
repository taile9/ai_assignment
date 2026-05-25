import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { TransactionForm } from './components/TransactionForm';
import { TransactionTable } from './components/TransactionTable';
import { SummaryCards } from './components/SummaryCards';
import { MonthlyTrendChart } from './components/MonthlyTrendChart';
import { CategoryChart } from './components/CategoryChart';
import { TimeZoneChart } from './components/TimeZoneChart';
import { DayChart } from './components/DayChart';
import { RiskPatternList } from './components/RiskPatternList';
import { AiReport } from './components/AiReport';
import { WarningTransactionTable } from './components/WarningTransactionTable';
import { CategorySummaryList } from './components/CategorySummaryList';
import { isLateNight, getDayOfWeek } from './utils/dateUtils';

import { baselineTransactions } from './data/sampleBaselineTransactions';
import { calculateStats, calculateBaselineAverage } from './utils/calculateStats';
import { compareBaseline } from './utils/compareBaseline';
import { classifySpendingType } from './utils/classifySpendingType';
import { generateAiReport } from './services/gemini';
import { Transaction, MonthStr, AiReportResponse } from './types';
import './styles.css';

export type ActiveTab = '2026-02' | '2026-03' | '2026-04' | '2026-05' | 'all-compare';

export const App: React.FC = () => {
  // 1. Month and Mode Selection States
  const [activeTab, setActiveTab] = useState<ActiveTab>('2026-05');
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);

  // Derive selectedMonth
  const selectedMonth: MonthStr = (activeTab === 'all-compare') 
    ? '2026-05' 
    : activeTab;

  // 2. All Transactions CRUD State (Supporting all months)
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('spending-risk-ai-transactions-v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [...baselineTransactions];
      }
    }
    
    // Migration: If the old may data exists, merge it with baseline
    const oldMayData = localStorage.getItem('spending-risk-ai-may-data');
    if (oldMayData) {
      try {
        const parsedOldMay = JSON.parse(oldMayData);
        return [...baselineTransactions, ...parsedOldMay];
      } catch (e) {}
    }
    
    return [...baselineTransactions];
  });

  useEffect(() => {
    localStorage.setItem('spending-risk-ai-transactions-v2', JSON.stringify(allTransactions));
  }, [allTransactions]);

  // 3. Reports Cache in LocalStorage
  const [reportsCache, setReportsCache] = useState<Record<string, { report: AiReportResponse; logData: any }>>(() => {
    const saved = localStorage.getItem('spending-risk-ai-reports-cache');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('spending-risk-ai-reports-cache', JSON.stringify(reportsCache));
  }, [reportsCache]);

  // 4. Calculate Stats & Risk Classification Dynamically
  const { 
    febStats, 
    marStats, 
    aprStats, 
    mayStats,
    currentStats, 
    baselineAvg, 
    comparison, 
    risk 
  } = useMemo(() => {
    const feb = calculateStats(baselineTransactions, '2026-02');
    const mar = calculateStats(baselineTransactions, '2026-03');
    const apr = calculateStats(baselineTransactions, '2026-04');
    const may = calculateStats(allTransactions, '2026-05');
    
    // Stats for the active month selection
    const current = calculateStats(allTransactions, selectedMonth);
    const avg = calculateBaselineAverage(allTransactions, selectedMonth);
    
    // Comparison (now relevant for all months)
    const comp = compareBaseline(current, avg);
    
    // Risk Classification
    const rsk = classifySpendingType(current, avg, comp, allTransactions, selectedMonth);

    return { 
      febStats: feb, 
      marStats: mar, 
      aprStats: apr, 
      mayStats: may,
      currentStats: current, 
      baselineAvg: avg, 
      comparison: comp, 
      risk: rsk 
    };
  }, [selectedMonth, allTransactions]);

  // Cache key is generated based on selected month and comparison mode
  const currentCacheKey = useMemo(() => {
    if (selectedMonth === '2026-05') {
      return isComparisonMode ? '2026-05-compare' : '2026-05-single';
    }
    return `${selectedMonth}-single`;
  }, [selectedMonth, isComparisonMode]);

  // Load report and logData from cache if exists
  const activeReportState = useMemo(() => {
    return reportsCache[currentCacheKey] || { report: null, logData: null };
  }, [reportsCache, currentCacheKey]);

  const [loading, setLoading] = useState<boolean>(false);

  // 5. Clickable Warning Active Filter State
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Clear filter when changing active tab or comparison mode
  useEffect(() => {
    setActiveFilter(null);
  }, [activeTab, isComparisonMode]);

  // 6. Handle Warning Badge Click (Interactive Warning Filter)
  const handleWarningClick = (warningType: string) => {
    if (warningType === '없음' || warningType === '균형 소비형') {
      setActiveFilter(null);
      return;
    }
    // Toggle active filter
    if (activeFilter === warningType) {
      setActiveFilter(null);
    } else {
      setActiveFilter(warningType);
    }

    // Scroll smoothly to filtered transactions list
    setTimeout(() => {
      const element = document.getElementById('warning-transactions-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // 7. Filter transactions matching the warning factor
  const selectedSummary = useMemo(() => {
    if (!activeFilter) return null;
    
    // First try to find it in spendingTypeSummaries
    const found = risk.spendingTypeSummaries.find(s => s.type === activeFilter);
    if (found) return found;

    // Fallback for Score Breakdown (가장 위험한 감점 요인) clicks
    const txList = allTransactions.filter(t => t.month === selectedMonth);
    let related: Transaction[] = [];
    
    if (activeFilter.includes('야간 소비')) {
      related = txList.filter(t => isLateNight(t.time));
    } else if (activeFilter.includes('비필수 소비')) {
      related = txList.filter(t => ['배달', '카페', '쇼핑', '문화/취미'].includes(t.category));
    } else if (activeFilter.includes('단일 카테고리')) {
      const topCat = Object.entries(currentStats.categoryTotals).sort((a, b) => b[1] - a[1])[0][0];
      related = txList.filter(t => t.category === topCat);
    } else if (activeFilter.includes('동일 가맹점')) {
      const counts: Record<string, number> = {};
      txList.forEach(t => counts[t.merchant] = (counts[t.merchant] || 0) + 1);
      const repeatMerchants = Object.entries(counts).filter(([_, c]) => c >= 4).map(([m]) => m);
      related = txList.filter(t => repeatMerchants.includes(t.merchant));
    } else if (activeFilter.includes('구독 소비')) {
      related = txList.filter(t => t.isSubscription || t.category === '구독');
    } else if (activeFilter.includes('5만원 이상')) {
      related = txList.filter(t => t.amount >= 50000);
    } else if (activeFilter.includes('1만원 미만')) {
      related = txList.filter(t => t.amount < 10000);
    } else if (activeFilter.includes('전월 대비')) {
      if (comparison) {
        const increasedCats = Object.entries(comparison.categoryChanges)
          .filter(([_, val]) => val.increaseAmount > 0)
          .map(([cat]) => cat);
        related = txList.filter(t => increasedCats.includes(t.category));
      }
    } else {
      related = txList; // Fallback
    }

    const count = related.length;
    const totalAmount = related.reduce((sum, t) => sum + t.amount, 0);

    return {
      type: activeFilter,
      label: activeFilter,
      count,
      totalAmount,
      averageAmount: count > 0 ? Math.round(totalAmount / count) : 0,
      description: "해당 감점 요인에 부합하는 소비 내역입니다.",
      relatedTransactions: related
    };
  }, [activeFilter, risk, allTransactions, selectedMonth, comparison, currentStats]);

  // 8. CRUD Handlers for all months
  const handleAddTransaction = (t: Transaction) => {
    setAllTransactions(prev => [...prev, t]);
  };

  const handleDeleteTransaction = (id: string) => {
    setAllTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleClear = () => {
    if (window.confirm(`${selectedMonth.split('-')[1]}월 데이터를 모두 초기화하시겠습니까? (이 작업은 복구할 수 없습니다)`)) {
      setAllTransactions(prev => prev.filter(t => t.month !== selectedMonth));
      // Clear reports cache for the selected month
      setReportsCache(prev => {
        const copy = { ...prev };
        delete copy[`${selectedMonth}-single`];
        delete copy[`${selectedMonth}-compare`];
        return copy;
      });
    }
  };

  const handleLoadSample = () => {
    const maySample: Transaction[] = [
      { id: 'may-s-1', month: '2026-05', date: '2026-05-02', time: '13:00', category: '카페', merchant: '스타벅스', amount: 5500, paymentType: '카드', memo: '커피', isSubscription: false },
      { id: 'may-s-2', month: '2026-05', date: '2026-05-03', time: '23:30', category: '배달', merchant: '배달의민족', amount: 25000, paymentType: '간편결제', memo: '야식 치킨', isSubscription: false },
      { id: 'may-s-3', month: '2026-05', date: '2026-05-05', time: '10:00', category: '구독', merchant: '넷플릭스', amount: 13500, paymentType: '카드', memo: '넷플 정기권', isSubscription: true },
      { id: 'may-s-4', month: '2026-05', date: '2026-05-07', time: '12:30', category: '식비', merchant: '구내식당', amount: 7000, paymentType: '카드', memo: '점심', isSubscription: false },
      { id: 'may-s-5', month: '2026-05', date: '2026-05-08', time: '22:15', category: '배달', merchant: '요기요', amount: 18000, paymentType: '간편결제', memo: '야식 떡볶이', isSubscription: false },
      { id: 'may-s-6', month: '2026-05', date: '2026-05-10', time: '19:00', category: '쇼핑', merchant: '올리브영', amount: 55000, paymentType: '카드', memo: '선크림 화장품', isSubscription: false },
      { id: 'may-s-7', month: '2026-05', date: '2026-05-12', time: '08:30', category: '교통', merchant: '지하철', amount: 1400, paymentType: '카드', memo: '출근', isSubscription: false },
      { id: 'may-s-8', month: '2026-05', date: '2026-05-14', time: '21:00', category: '쇼핑', merchant: '쿠팡', amount: 62000, paymentType: '간편결제', memo: '충동구매 무드등', isSubscription: false },
      { id: 'may-s-9', month: '2026-05', date: '2026-05-15', time: '10:00', category: '구독', merchant: '유튜브 프리미엄', amount: 10450, paymentType: '카드', memo: '구독 결제', isSubscription: true },
      { id: 'may-s-10', month: '2026-05', date: '2026-05-18', time: '13:00', category: '카페', merchant: '스타벅스', amount: 6000, paymentType: '간편결제', memo: '라떼', isSubscription: false },
      { id: 'may-s-11', month: '2026-05', date: '2026-05-20', time: '01:30', category: '배달', merchant: '배달의민족', amount: 21000, paymentType: '간편결제', memo: '새벽 야식', isSubscription: false },
      { id: 'may-s-12', month: '2026-05', date: '2026-05-22', time: '15:00', category: '생활용품', merchant: '다이소', amount: 3000, paymentType: '카드', memo: '수납통', isSubscription: false },
      { id: 'may-s-13', month: '2026-05', date: '2026-05-24', time: '18:30', category: '식비', merchant: '고깃집', amount: 45000, paymentType: '카드', memo: '삼겹살 저녁', isSubscription: false },
      { id: 'may-s-14', month: '2026-05', date: '2026-05-25', time: '13:30', category: '카페', merchant: '메가커피', amount: 3000, paymentType: '간편결제', memo: '아메리카노', isSubscription: false },
      { id: 'may-s-15', month: '2026-05', date: '2026-05-28', time: '19:00', category: '문화/취미', merchant: 'CGV', amount: 15000, paymentType: '간편결제', memo: '영화 티켓', isSubscription: false },
    ];
    // If the user wants to load sample for May, do it, but what about other months?
    // We only have samples for May. We'll append May samples.
    if (['2026-02', '2026-03', '2026-04', '2026-05'].includes(activeTab)) {
       setAllTransactions(prev => [...prev.filter(t => t.month !== activeTab), ...maySample.map(s => ({...s, id: `${activeTab}-s-${s.id}`, month: activeTab as MonthStr, date: s.date.replace('2026-05', activeTab)}))]);
    } else {
       alert('월 탭을 선택한 후 샘플을 불러오세요.');
    }
  };

  // 9. AI Report Generation Trigger
  const handleGenerateReport = async (modeOverride?: 'single' | 'compare') => {
    setLoading(true);
    const reportMode = modeOverride || ((selectedMonth === '2026-05' && isComparisonMode) ? 'compare' : 'single');
    const cacheKey = reportMode === 'compare' ? '2026-05-compare' : `${selectedMonth}-single`;

    const aiInput = {
      selectedMonth,
      mode: reportMode,
      monthlyStats: currentStats,
      baselineAvg,
      comparison,
      risk,
      transactions: allTransactions.filter(t => t.month === selectedMonth)
    };

    try {
      const res = await generateAiReport(aiInput);
      
      // Update Cache
      setReportsCache(prev => ({
        ...prev,
        [cacheKey]: {
          report: res.report,
          logData: {
            prompt: res.promptUsed,
            response: res.rawResponse,
            isFallback: res.isFallback,
            modelName: res.modelName,
            errorMessage: res.errorMessage,
            parsedJsonString: res.parsedJsonString
          }
        }
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Build input structure for AiReport component
  const aiReportInput = {
    selectedMonth,
    mode: (selectedMonth === '2026-05' && isComparisonMode) ? 'compare' as const : 'single' as const,
    monthlyStats: currentStats,
    baselineAvg,
    comparison,
    risk,
    transactions: allTransactions.filter(t => t.month === selectedMonth)
  };

  // Find all transactions of the selected month
  const activeMonthTransactions = useMemo(() => {
    return allTransactions.filter(t => t.month === selectedMonth);
  }, [allTransactions, selectedMonth]);

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        
        {/* Month & View Mode Selector Container */}
        <div className="card navigation-card">
          <div className="nav-container-flex">
            <div className="nav-title-group">
              <h3 className="card-sub-title">조회 월 선택</h3>
              <p className="text-xs text-gray-500">기준 월을 클릭하면 각 월의 고정 데이터 또는 직접 입력한 데이터가 실시간으로 분석됩니다.</p>
            </div>
            <div className="tabs-row">
              <button className={`tab-btn ${activeTab === '2026-02' ? 'active-tab' : ''}`} onClick={() => { setActiveTab('2026-02'); setIsComparisonMode(false); }}>
                2월
              </button>
              <button className={`tab-btn ${activeTab === '2026-03' ? 'active-tab' : ''}`} onClick={() => { setActiveTab('2026-03'); setIsComparisonMode(false); }}>
                3월
              </button>
              <button className={`tab-btn ${activeTab === '2026-04' ? 'active-tab' : ''}`} onClick={() => { setActiveTab('2026-04'); setIsComparisonMode(false); }}>
                4월
              </button>
              <button className={`tab-btn ${activeTab === '2026-05' ? 'active-tab' : ''}`} onClick={() => { setActiveTab('2026-05'); }}>
                5월
              </button>
              <button className={`tab-btn comparison-tab-btn ${activeTab === 'all-compare' ? 'active-tab-compare' : ''}`} onClick={() => { setActiveTab('all-compare'); setIsComparisonMode(false); }}>
                전체 비교
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          
          {/* Left Column: Data Input or Transactions View (hidden in all-compare and ai-report) */}
          {['2026-02', '2026-03', '2026-04', '2026-05'].includes(activeTab) && (
            <div className="input-section">
              <TransactionForm selectedMonth={selectedMonth} onAdd={handleAddTransaction} />
              <TransactionTable 
                selectedMonth={selectedMonth}
                transactions={activeMonthTransactions} 
                onDelete={handleDeleteTransaction}
                onClear={handleClear}
                onLoadSample={handleLoadSample}
              />
            </div>
          )}
          
          {/* Right Column: Analysis Dashboard */}
          <div className={`analysis-section ${['all-compare'].includes(activeTab) ? 'w-full max-w-none' : ''}`} id="report-snapshot-area">
            {['2026-02', '2026-03', '2026-04', '2026-05'].includes(activeTab) && (
              <>
                <h2 className="section-title">
                  {activeTab.split('-')[1]}월 소비 통계 대시보드
                </h2>
                
                <SummaryCards 
                  selectedMonth={selectedMonth}
                  may={currentStats} 
                  avg={baselineAvg} 
                  comparison={undefined} 
                  risk={risk} 
                  onWarningClick={handleWarningClick}
                  activeFilter={activeFilter}
                />
                
                <WarningTransactionTable 
                  summary={selectedSummary}
                  onClear={() => setActiveFilter(null)}
                />
                
                <CategorySummaryList may={currentStats} selectedMonth={selectedMonth} />

                <div className="charts-grid">
                  <CategoryChart may={currentStats} avg={baselineAvg} selectedMonth={selectedMonth} />
                  <TimeZoneChart may={currentStats} selectedMonth={selectedMonth} />
                  <DayChart may={currentStats} selectedMonth={selectedMonth} />
                </div>

                <RiskPatternList 
                  transactions={allTransactions} 
                  risk={risk} 
                  selectedMonth={selectedMonth}
                  onWarningClick={handleWarningClick}
                  activeFilter={activeFilter}
                />

                <div className="card mt-6 border-purple border-2 bg-purple-50">
                  <div className="p-2">
                    <h3 className="text-xl font-bold text-purple">{selectedMonth.split('-')[1]}월 AI 리포트</h3>
                  </div>
                  <AiReport 
                    input={{...aiReportInput, mode: 'single'}} 
                    loading={loading}
                    onGenerate={() => handleGenerateReport('single')}
                    report={reportsCache[`${selectedMonth}-single`]?.report || null}
                    logData={reportsCache[`${selectedMonth}-single`]?.logData || null}
                  />
                </div>

                {activeTab === '2026-05' && (
                  <div className="card mt-6 border-navy border-2 bg-navy-50">
                    <div className="flex flex-col md:flex-row items-center justify-between p-2 gap-4">
                      <h3 className="text-lg font-bold text-navy">5월 vs 최근 3개월 평균 비교 분석</h3>
                      <div className="flex gap-2 flex-wrap">
                        <button 
                          className="btn btn-primary font-bold"
                          onClick={() => setIsComparisonMode(!isComparisonMode)}
                        >
                          {isComparisonMode ? '비교 분석 닫기' : '5월 소비 지난 3달과 비교 분석하기'}
                        </button>
                        <button 
                          className="btn btn-secondary flex items-center gap-2 border-purple text-purple font-bold bg-white"
                          onClick={() => handleGenerateReport('compare')}
                          disabled={loading}
                        >
                          AI로 5월 비교 리포트 생성
                        </button>
                      </div>
                    </div>
                    {isComparisonMode && (
                      <div className="mt-4 pt-4 border-t border-navy-100">
                        <SummaryCards 
                          selectedMonth={'2026-05'}
                          may={currentStats} 
                          avg={baselineAvg} 
                          comparison={comparison} 
                          risk={risk} 
                          onWarningClick={handleWarningClick}
                          activeFilter={activeFilter}
                          isCompareOnly={true}
                        />
                      </div>
                    )}
                    {(reportsCache['2026-05-compare']?.report || reportsCache['2026-05-compare']?.logData) && (
                      <div className="mt-4 pt-4 border-t border-navy-100">
                        <AiReport 
                          input={{...aiReportInput, mode: 'compare'}} 
                          loading={loading}
                          onGenerate={() => handleGenerateReport('compare')}
                          report={reportsCache['2026-05-compare']?.report || null}
                          logData={reportsCache['2026-05-compare']?.logData || null}
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'all-compare' && (
              <>
                <h2 className="section-title">전체 비교 (월별 트렌드)</h2>
                <div className="card">
                  <MonthlyTrendChart feb={febStats} mar={marStats} apr={aprStats} may={mayStats} />
                </div>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
