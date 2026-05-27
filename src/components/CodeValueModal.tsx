import { useEffect, useId, useRef, useState } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import './CodeValueModal.css';

type CodeValueRow = {
  id: string;
  value: string;
  label: string;
  showLabel: boolean;
};

export type CodeValuePayload = {
  itemCodeId: string;
  itemCodeName: string;
  codeValues: Array<{
    value: string;
    label: string;
    showLabel: boolean;
  }>;
};

type CodeValueModalProps = {
  isOpen: boolean;
  title?: string;
  initialFocusTarget?: 'itemCodeId' | 'addButton';
  onClose: () => void;
  onSubmit?: (payload: CodeValuePayload) => void;
};

type ValidationErrors = {
  itemCodeId?: string;
  itemCodeName?: string;
  codeValues?: string;
  rowErrors: Record<string, { value?: string; label?: string }>;
};

const EMPTY_ERRORS: ValidationErrors = {
  rowErrors: {},
};

const createDefaultRows = (): CodeValueRow[] => [
  {
    id: 'code-row-1',
    value: '',
    label: '',
    showLabel: true,
  },
];

export const CodeValueModal = ({
  isOpen,
  title = 'Add Code',
  initialFocusTarget = 'itemCodeId',
  onClose,
  onSubmit,
}: CodeValueModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const valueInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const nextIdRef = useRef(2);
  const [pendingFocusRowId, setPendingFocusRowId] = useState<string | null>(null);
  const [itemCodeId, setItemCodeId] = useState('');
  const [itemCodeName, setItemCodeName] = useState('');
  const [rows, setRows] = useState<CodeValueRow[]>(() => createDefaultRows());
  const [errors, setErrors] = useState<ValidationErrors>(EMPTY_ERRORS);

  const titleId = useId();
  const itemCodeIdInputId = useId();
  const itemCodeNameInputId = useId();

  const initialFocusRef = initialFocusTarget === 'addButton' ? addButtonRef : firstInputRef;
  useFocusTrap(dialogRef, isOpen, { initialFocusRef, restoreFocus: true });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!pendingFocusRowId) {
      return;
    }

    const rafId = window.requestAnimationFrame(() => {
      valueInputRefs.current[pendingFocusRowId]?.focus();
      setPendingFocusRowId(null);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [pendingFocusRowId, rows]);

  if (!isOpen) {
    return null;
  }

  const createRow = (): CodeValueRow => {
    const next = nextIdRef.current;
    nextIdRef.current += 1;
    return {
      id: `code-row-${next}`,
      value: '',
      label: '',
      showLabel: true,
    };
  };

  const updateRow = (
    rowId: string,
    field: keyof Omit<CodeValueRow, 'id'>,
    value: string | boolean,
  ): void => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
    setErrors((prev) => ({
      ...prev,
      codeValues: undefined,
      rowErrors: {
        ...prev.rowErrors,
        [rowId]: {
          ...prev.rowErrors[rowId],
          ...(field === 'value' ? { value: undefined } : {}),
          ...(field === 'label' ? { label: undefined } : {}),
        },
      },
    }));
  };

  const insertRowAfter = (rowId: string): void => {
    const nextRow = createRow();
    setRows((prev) => {
      const nextRows = [...prev];
      const index = nextRows.findIndex((row) => row.id === rowId);
      if (index < 0) {
        return [...nextRows, nextRow];
      }
      nextRows.splice(index + 1, 0, nextRow);
      return nextRows;
    });
    setPendingFocusRowId(nextRow.id);
  };

  const removeRow = (rowId: string): void => {
    setRows((prev) => {
      const nextRows = prev.filter((row) => row.id !== rowId);
      return nextRows.length > 0 ? nextRows : [createRow()];
    });
  };

  const handleSubmit = (): void => {
    const payload: CodeValuePayload = {
      itemCodeId: itemCodeId.trim(),
      itemCodeName: itemCodeName.trim(),
      codeValues: rows.map((row) => ({
        value: row.value.trim(),
        label: row.label.trim(),
        showLabel: row.showLabel,
      })),
    };

    const nextErrors: ValidationErrors = { rowErrors: {} };
    if (payload.itemCodeId.length === 0) {
      nextErrors.itemCodeId = 'Item Code ID는 필수 입력 항목입니다.';
    }
    if (payload.itemCodeName.length === 0) {
      nextErrors.itemCodeName = 'Item Code Name은 필수 입력 항목입니다.';
    }
    if (payload.codeValues.length === 0) {
      nextErrors.codeValues = 'Code Values는 최소 1개 행이 필요합니다.';
    }
    payload.codeValues.forEach((row, index) => {
      const rowErrors: { value?: string; label?: string } = {};
      if (row.value.length === 0) {
        rowErrors.value = `Row ${index + 1}: Value는 필수 입력 항목입니다.`;
      }
      if (row.label.length === 0) {
        rowErrors.label = `Row ${index + 1}: Label은 필수 입력 항목입니다.`;
      }
      if (rowErrors.value || rowErrors.label) {
        nextErrors.rowErrors[rows[index].id] = rowErrors;
      }
    });

    const hasErrors =
      Boolean(nextErrors.itemCodeId) ||
      Boolean(nextErrors.itemCodeName) ||
      Boolean(nextErrors.codeValues) ||
      Object.keys(nextErrors.rowErrors).length > 0;

    if (hasErrors) {
      setErrors(nextErrors);
      return;
    }

    setErrors(EMPTY_ERRORS);
    onSubmit?.(payload);
    onClose();
  };

  return (
    <div className="cvm-overlay" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="cvm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="cvm-header">
          <h2 id={titleId}>{title}</h2>
        </header>

        <div className="cvm-form">
          <div className="cvm-fields">
            <label htmlFor={itemCodeIdInputId}>
              <span>*Item Code ID</span>
              <input
                ref={firstInputRef}
                id={itemCodeIdInputId}
                value={itemCodeId}
                onChange={(event) => {
                  setItemCodeId(event.target.value);
                  setErrors((prev) => ({ ...prev, itemCodeId: undefined }));
                }}
                placeholder="Item Code ID"
                autoComplete="off"
                aria-invalid={Boolean(errors.itemCodeId)}
              />
              {errors.itemCodeId ? (
                <p className="cvm-error-text" role="alert">
                  {errors.itemCodeId}
                </p>
              ) : null}
            </label>
            <label htmlFor={itemCodeNameInputId}>
              <span>*Item Code Name</span>
              <input
                id={itemCodeNameInputId}
                value={itemCodeName}
                onChange={(event) => {
                  setItemCodeName(event.target.value);
                  setErrors((prev) => ({ ...prev, itemCodeName: undefined }));
                }}
                placeholder="Item Code Name"
                autoComplete="off"
                aria-invalid={Boolean(errors.itemCodeName)}
              />
              {errors.itemCodeName ? (
                <p className="cvm-error-text" role="alert">
                  {errors.itemCodeName}
                </p>
              ) : null}
            </label>
          </div>

          <section className="cvm-table-wrap" aria-label="Code values">
            <div className="cvm-table-title">Code Values</div>
            {errors.codeValues ? (
              <p className="cvm-error-banner" role="alert">
                {errors.codeValues}
              </p>
            ) : null}
            <table className="cvm-table">
              <thead>
                <tr>
                  <th aria-hidden="true" />
                  <th>*Value</th>
                  <th>*Label</th>
                  <th>Show Label</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td aria-hidden="true">=</td>
                    <td>
                      <input
                        ref={(node) => {
                          valueInputRefs.current[row.id] = node;
                        }}
                        value={row.value}
                        onChange={(event) =>
                          updateRow(row.id, 'value', event.target.value)
                        }
                        aria-label={`Code value row ${index + 1} value`}
                        placeholder="Value"
                        aria-invalid={Boolean(errors.rowErrors[row.id]?.value)}
                      />
                      {errors.rowErrors[row.id]?.value ? (
                        <p className="cvm-error-text" role="alert">
                          {errors.rowErrors[row.id]?.value}
                        </p>
                      ) : null}
                    </td>
                    <td>
                      <input
                        value={row.label}
                        onChange={(event) =>
                          updateRow(row.id, 'label', event.target.value)
                        }
                        aria-label={`Code value row ${index + 1} label`}
                        placeholder="Label"
                        aria-invalid={Boolean(errors.rowErrors[row.id]?.label)}
                      />
                      {errors.rowErrors[row.id]?.label ? (
                        <p className="cvm-error-text" role="alert">
                          {errors.rowErrors[row.id]?.label}
                        </p>
                      ) : null}
                    </td>
                    <td>
                      <div className="cvm-checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={row.showLabel}
                          onChange={(event) =>
                            updateRow(row.id, 'showLabel', event.target.checked)
                          }
                          aria-label={`Code value row ${index + 1} show label`}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="cvm-actions-inline">
                        <button type="button" onClick={() => insertRowAfter(row.id)}>
                          + Add Value
                        </button>
                        <button type="button" onClick={() => removeRow(row.id)}>
                          - Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <footer className="cvm-footer">
          <button type="button" className="cvm-btn cvm-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            ref={addButtonRef}
            type="button"
            className="cvm-btn cvm-btn-primary"
            onClick={handleSubmit}
          >
            Add
          </button>
        </footer>
      </div>
    </div>
  );
};
