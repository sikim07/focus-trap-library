import { useId, useMemo, useRef } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import './DataEntryModal.css';

type DataEntryFormData = {
  subjectId: string;
  visitCode: string;
  systolic: string;
};

type DataEntryModalProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  onSubmit?: (data: DataEntryFormData) => void;
};

export const DataEntryModal = ({
  isOpen,
  title = '임상 데이터 입력',
  onClose,
  onSubmit,
}: DataEntryModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const titleId = useId();
  const subjectIdInputId = useId();
  const visitCodeInputId = useId();
  const systolicInputId = useId();

  const initialData = useMemo<DataEntryFormData>(
    () => ({
      subjectId: '',
      visitCode: '',
      systolic: '',
    }),
    [],
  );

  // 모달이 열린 상태에서만 focus trap을 활성화해 키보드 입력이 배경으로 새지 않게 합니다.
  useFocusTrap(dialogRef, isOpen, { initialFocusRef: firstInputRef, restoreFocus: true });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="dem-overlay" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="dem-dialog"
        // dialog role + aria-modal은 스크린리더에게 "배경과 분리된 모달 대화상자"임을 알립니다.
        role="dialog"
        aria-modal="true"
        // 제목 요소 ID와 연결해 모달의 접근성 이름(name)을 명확히 제공합니다.
        aria-labelledby={titleId}
        onMouseDown={(event) => {
          // 콘텐츠 영역 클릭은 닫힘으로 해석하지 않기 위해 이벤트 전파를 막습니다.
          event.stopPropagation();
        }}
      >
        <header className="dem-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="dem-close" onClick={onClose} aria-label="모달 닫기">
            ×
          </button>
        </header>

        <form
          className="dem-form"
          onSubmit={(event) => {
            event.preventDefault();

            const formData = new FormData(event.currentTarget);
            const payload: DataEntryFormData = {
              subjectId: String(formData.get('subjectId') ?? '').trim(),
              visitCode: String(formData.get('visitCode') ?? '').trim(),
              systolic: String(formData.get('systolic') ?? '').trim(),
            };

            onSubmit?.(payload);
            event.currentTarget.reset();
            onClose();
          }}
        >
          <div className="dem-row">
            {/* label htmlFor ↔ input id 매핑은 보조기기와 클릭 타깃 정확도에 직접 영향을 줍니다. */}
            <label htmlFor={subjectIdInputId}>피험자 ID</label>
            <input
              ref={firstInputRef}
              id={subjectIdInputId}
              name="subjectId"
              defaultValue={initialData.subjectId}
              autoComplete="off"
              required
            />
          </div>

          <div className="dem-row">
            <label htmlFor={visitCodeInputId}>방문 코드</label>
            <input
              id={visitCodeInputId}
              name="visitCode"
              defaultValue={initialData.visitCode}
              autoComplete="off"
              required
            />
          </div>

          <div className="dem-row">
            <label htmlFor={systolicInputId}>수축기 혈압(mmHg)</label>
            <input
              id={systolicInputId}
              name="systolic"
              defaultValue={initialData.systolic}
              inputMode="numeric"
              pattern="[0-9]*"
              required
            />
          </div>

          <footer className="dem-actions">
            <button type="button" className="dem-btn dem-btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="dem-btn dem-btn-primary">
              저장
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
