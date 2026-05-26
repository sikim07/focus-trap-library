import { useState } from 'react';
import { DataEntryModal } from './components/DataEntryModal';
import './App.css';

export const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submittedLog, setSubmittedLog] = useState('');

  return (
    <main className="app-shell">
      <h1>Focus Trap Library PoC</h1>
      <p className="app-description">
        운영 환경에서 발생하는 포커스 이탈 문제를 재현/검증하기 위한 데모 화면입니다.
      </p>

      <section className="app-controls">
        {/* 모달이 닫힌 상태에서만 접근 가능한 배경 요소를 두어 trap 동작을 눈으로 확인합니다. */}
        <button type="button" onClick={() => setIsOpen(true)}>
          데이터 입력 모달 열기
        </button>
        <button type="button">배경 액션 버튼 A</button>
        <button type="button">배경 액션 버튼 B</button>
      </section>

      <section className="app-log" aria-live="polite">
        <h2>최근 저장 데이터</h2>
        <pre>{submittedLog || '아직 저장된 데이터가 없습니다.'}</pre>
      </section>

      <DataEntryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(data) => {
          // 제출 결과를 화면에 남겨 두면 수동 QA 시 입력 정합성을 빠르게 점검할 수 있습니다.
          setSubmittedLog(JSON.stringify(data, null, 2));
          setIsOpen(false);
        }}
      />
    </main>
  );
};

export default App;
