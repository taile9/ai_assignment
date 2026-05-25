import React, { useState, useEffect } from 'react';
import { Category, PaymentType, Transaction, MonthStr } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  selectedMonth: MonthStr;
  onAdd: (t: Transaction) => void;
}

export const TransactionForm: React.FC<Props> = ({ selectedMonth, onAdd }) => {
  const [date, setDate] = useState(`${selectedMonth}-01`);
  const [time, setTime] = useState('12:00');
  const [category, setCategory] = useState<Category>('식비');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentType, setPaymentType] = useState<PaymentType>('카드');
  const [memo, setMemo] = useState('');
  const [isSubscription, setIsSubscription] = useState(false);

  useEffect(() => {
    setDate(`${selectedMonth}-01`);
  }, [selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || amount === '') return;

    const newTx: Transaction = {
      id: uuidv4(),
      month: selectedMonth,
      date,
      time,
      category,
      merchant,
      amount: Number(amount),
      paymentType,
      memo,
      isSubscription
    };

    onAdd(newTx);
    setMerchant('');
    setAmount('');
    setMemo('');
    setIsSubscription(false);
  };

  const getDaysInMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const lastDay = getDaysInMonth(selectedMonth);

  return (
    <div className="card">
      <h3 className="card-title">{selectedMonth.split('-')[1]}월 소비 내역 추가</h3>
      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>날짜</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            required 
            min={`${selectedMonth}-01`} 
            max={`${selectedMonth}-${lastDay}`} 
          />
        </div>
        <div className="form-group">
          <label>시간</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>카테고리</label>
          <select value={category} onChange={e => setCategory(e.target.value as Category)}>
            {['식비', '카페', '배달', '쇼핑', '교통', '문화/취미', '구독', '생활용품', '의료/건강', '기타'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>가맹점</label>
          <input type="text" value={merchant} onChange={e => setMerchant(e.target.value)} required placeholder="예: 스타벅스" />
        </div>
        <div className="form-group">
          <label>금액</label>
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} required placeholder="금액 입력" min="0" />
        </div>
        <div className="form-group">
          <label>결제수단</label>
          <select value={paymentType} onChange={e => setPaymentType(e.target.value as PaymentType)}>
            {['카드', '현금', '계좌이체', '간편결제'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>메모</label>
          <input type="text" value={memo} onChange={e => setMemo(e.target.value)} placeholder="선택사항" />
        </div>
        <div className="form-group-checkbox">
          <label>
            <input type="checkbox" checked={isSubscription} onChange={e => setIsSubscription(e.target.checked)} />
            정기결제(구독) 여부
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">추가하기</button>
        </div>
      </form>
    </div>
  );
};

