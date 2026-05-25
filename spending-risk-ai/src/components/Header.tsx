import React from 'react';
import { BrainCircuit } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <BrainCircuit className="header-icon" size={28} />
        <h1>Spending Risk AI</h1>
        <p>AI 기반 과소비 위험 패턴 분석 및 소비 개선 리포트 시스템</p>
      </div>
    </header>
  );
};
