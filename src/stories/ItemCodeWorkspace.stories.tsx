import { useEffect, useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CodeValueModal,
  type CodeValuePayload,
} from "../components/CodeValueModal";
import { useFocusTrap } from "../hooks/useFocusTrap";

type ItemCodeValueLine = {
  value: string;
  label: string;
  showLabel: boolean;
};

type ItemCodeRow = {
  no: number;
  itemCodeId: string;
  itemCodeName: string;
  codeValues: ItemCodeValueLine[];
};

type ScenarioPreset = "Baseline" | "ModalOpen" | "ValidationError" | "Custom";

type StoryArgs = {
  scenarioPreset: ScenarioPreset;
  showFlowGuide: boolean;
  trapEnabled: boolean;
  modalOpenOnMount: boolean;
  initialRowCount: 0 | 1 | 3 | 5;
  showDeletedOnMount: boolean;
  rowsPerPage: number;
  sidebarWidth: number;
};

const meta = {
  title: "Pages/ItemCodeWorkspace",
  tags: ["autodocs"],
  args: {
    scenarioPreset: "Baseline",
    showFlowGuide: true,
    trapEnabled: false,
    modalOpenOnMount: false,
    initialRowCount: 5,
    showDeletedOnMount: false,
    rowsPerPage: 30,
    sidebarWidth: 155,
  },
  argTypes: {
    scenarioPreset: {
      control: { type: "select" },
      options: ["Baseline", "ModalOpen", "ValidationError", "Custom"],
      description: "테스트 시나리오 프리셋",
    },
    showFlowGuide: {
      control: { type: "boolean" },
      description: "시나리오 흐름도 노출 여부",
    },
    trapEnabled: {
      control: { type: "boolean" },
      description: "페이지 레벨 Focus Trap 적용 여부",
    },
    modalOpenOnMount: {
      control: { type: "boolean" },
      description: "초기 렌더에서 Add Code 모달 자동 오픈",
      if: { arg: "scenarioPreset", eq: "Custom" },
    },
    initialRowCount: {
      control: { type: "select" },
      options: [0, 1, 3, 5],
      description: "초기 Item Code 테이블 행 개수",
      if: { arg: "scenarioPreset", eq: "Custom" },
    },
    showDeletedOnMount: {
      control: { type: "boolean" },
      description: "초기 Show Deleted 체크 상태",
      if: { arg: "scenarioPreset", eq: "Custom" },
    },
    rowsPerPage: {
      control: { type: "select" },
      options: [10, 20, 30, 50],
      description: "하단 rows 선택값",
    },
    sidebarWidth: {
      control: { type: "range", min: 130, max: 220, step: 5 },
      description: "왼쪽 메뉴 영역 너비(px)",
    },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Item Code 관리 화면입니다. controls의 scenarioPreset/trapEnabled로 모달 검증 및 포커스 이동 시나리오를 재현할 수 있습니다.",
      },
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

const seedRows: ItemCodeRow[] = [
  {
    no: 26,
    itemCodeId: "CODE_TYPE_A",
    itemCodeName: "CODE_TYPE_A",
    codeValues: [
      { value: "1", label: "Use-result surveillance", showLabel: true },
      { value: "2", label: "Post-marketing Clinical Study", showLabel: true },
      { value: "3", label: "Special Surveillance", showLabel: true },
    ],
  },
  {
    no: 27,
    itemCodeId: "CODE_TYPE_B",
    itemCodeName: "CODE_TYPE_B",
    codeValues: [
      { value: "1", label: "Re-examination report", showLabel: true },
      { value: "2", label: "Clinical Study", showLabel: true },
      { value: "3", label: "Individual case study", showLabel: true },
      { value: "4", label: "Others", showLabel: true },
    ],
  },
  {
    no: 28,
    itemCodeId: "CODE_TYPE_C",
    itemCodeName: "CODE_TYPE_C",
    codeValues: [
      { value: "1", label: "Spontaneous report", showLabel: true },
      { value: "2", label: "Report from Study", showLabel: true },
      { value: "3", label: "Other", showLabel: true },
      {
        value: "4",
        label: "Not available to sender (Unknown)",
        showLabel: true,
      },
    ],
  },
  {
    no: 29,
    itemCodeId: "CODE_FLAG_D",
    itemCodeName: "CODE_FLAG_D",
    codeValues: [
      { value: "1", label: "YES", showLabel: true },
      { value: "2", label: "NO", showLabel: true },
    ],
  },
  {
    no: 30,
    itemCodeId: "CODE_FLOW_E",
    itemCodeName: "CODE_FLOW_E",
    codeValues: [
      { value: "1", label: "Initial Report", showLabel: true },
      { value: "2", label: "Follow up Report", showLabel: true },
    ],
  },
];

const toCodeValueLines = (payload: CodeValuePayload): ItemCodeValueLine[] => {
  const meaningfulRows = payload.codeValues.filter(
    (row) => row.value.length > 0 || row.label.length > 0,
  );
  if (meaningfulRows.length === 0) {
    return [{ value: "[NULL]", label: "[Not Selected]", showLabel: false }];
  }
  return meaningfulRows;
};

const getSeedRowsByCount = (count: StoryArgs["initialRowCount"]): ItemCodeRow[] =>
  seedRows.slice(0, count);

const resolveScenarioConfig = (
  scenarioPreset: ScenarioPreset,
  initialRowCount: StoryArgs["initialRowCount"],
  modalOpenOnMount: boolean,
  showDeletedOnMount: boolean,
) => {
  if (scenarioPreset === "Baseline") {
    return { initialRowCount: 5 as const, modalOpenOnMount: false, showDeletedOnMount: false };
  }
  if (scenarioPreset === "ModalOpen") {
    return { initialRowCount: 5 as const, modalOpenOnMount: true, showDeletedOnMount: false };
  }
  if (scenarioPreset === "ValidationError") {
    return { initialRowCount: 1 as const, modalOpenOnMount: true, showDeletedOnMount: false };
  }
  return {
    initialRowCount,
    modalOpenOnMount,
    showDeletedOnMount,
  };
};

export const Default: Story = {
  render: (args: StoryArgs) => {
    const { scenarioPreset, initialRowCount, modalOpenOnMount, showDeletedOnMount } = args;
    const scenarioConfig = useMemo(
      () =>
        resolveScenarioConfig(
          scenarioPreset,
          initialRowCount,
          modalOpenOnMount,
          showDeletedOnMount,
        ),
      [scenarioPreset, initialRowCount, modalOpenOnMount, showDeletedOnMount],
    );
    const workspaceRef = useRef<HTMLDivElement>(null);
    const [rows, setRows] = useState<ItemCodeRow[]>(() =>
      getSeedRowsByCount(scenarioConfig.initialRowCount),
    );
    const [isModalOpen, setIsModalOpen] = useState(scenarioConfig.modalOpenOnMount);
    const [modalKey, setModalKey] = useState(1);
    const [showDeleted, setShowDeleted] = useState(scenarioConfig.showDeletedOnMount);
    const menuItems = useMemo(
      () => [
        "Group&Visit",
        "CRF Form",
        "Schedule",
        "Item Code",
        "Event",
        "Report",
        "Alert",
        "Visit Window",
      ],
      [],
    );

    useFocusTrap(workspaceRef, args.trapEnabled && !isModalOpen, { restoreFocus: true });

    useEffect(() => {
      setRows(getSeedRowsByCount(scenarioConfig.initialRowCount));
      setShowDeleted(scenarioConfig.showDeletedOnMount);
      setIsModalOpen(scenarioConfig.modalOpenOnMount);
      setModalKey((prev) => prev + 1);
    }, [scenarioConfig]);

    const openModal = (): void => {
      setModalKey((prev) => prev + 1);
      setIsModalOpen(true);
    };

    const closeModal = (): void => {
      setIsModalOpen(false);
    };

    const handleAddCode = (payload: CodeValuePayload): void => {
      const nextNo =
        rows.length > 0 ? Math.max(...rows.map((row) => row.no)) + 1 : 1;

      const normalizedId = payload.itemCodeId.trim() || `CODE_${nextNo}`;
      const normalizedName = payload.itemCodeName.trim() || normalizedId;

      const newRow: ItemCodeRow = {
        no: nextNo,
        itemCodeId: normalizedId,
        itemCodeName: normalizedName,
        codeValues: toCodeValueLines(payload),
      };

      setRows((prev) => [...prev, newRow]);
    };

    return (
      <div
        ref={workspaceRef}
        className="icw-root"
        style={{
          minHeight: "100vh",
          background: "#f2f5f9",
          color: "#111827",
          overflowX: "hidden",
        }}
      >
        <header
          style={{
            height: 46,
            background: "#ffffff",
            borderBottom: "1px solid #dce4ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            fontSize: 12,
          }}
        >
          <strong style={{ color: "#0f766e" }}>DIVE</strong>
          <div
            className="icw-top-meta"
            style={{ display: "flex", gap: 14, color: "#475467" }}
          >
            <span>Workspace: ****CIS</span>
            <span>Study: ***** PMS</span>
            <span>User: s****.k**@t**********.com</span>
          </div>
        </header>

        <div
          className="icw-layout"
          style={{ display: "flex", minHeight: "calc(100vh - 46px)" }}
        >
          <aside
            className="icw-sidebar"
            style={{
              width: args.sidebarWidth,
              flexShrink: 0,
              borderRight: "1px solid #d9e3ef",
              background: "#f8fbff",
              padding: 12,
              overflowY: "auto",
            }}
          >
            <div className="icw-menu" style={{ display: "grid", gap: 8 }}>
              {menuItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="icw-menu-button"
                  style={{
                    textAlign: "left",
                    border: "1px solid #d9e3ef",
                    borderRadius: 8,
                    background: item === "Item Code" ? "#e7f8ef" : "#ffffff",
                    color: item === "Item Code" ? "#0f766e" : "#344054",
                    fontWeight: item === "Item Code" ? 700 : 500,
                    padding: "8px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </aside>

          <main
            className="icw-main"
            style={{ flex: 1, padding: 18, minWidth: 0, overflowX: "hidden" }}
          >
            {args.showFlowGuide ? (
              <section
                style={{
                  border: "1px solid #d8e3ef",
                  borderRadius: 10,
                  background: "#ffffff",
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <strong style={{ color: "#0f766e", fontSize: 13 }}>
                  테스트 시나리오 흐름도
                </strong>
                <pre
                  style={{
                    margin: "8px 0 0",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#334155",
                    fontSize: 12,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
{`[시작]
  -> scenarioPreset 선택 (${args.scenarioPreset})
  -> Add Code 클릭 (또는 ModalOpen/ValidationError에서 자동 오픈)
  -> 필수값 검증 (Item Code ID/Name, 모든 Value/Label)
  -> 실패: 오류 메시지 노출 + 모달 유지
  -> 입력 보완 후 Add
  -> 성공: 테이블에 새 Item Code 추가 + 모달 닫힘
  -> 포커스 복귀 (모달 종료 시 restore focus)
  -> trapEnabled=true면 워크스페이스 탭 순환 유지
[종료]`}
                </pre>
              </section>
            ) : null}

            <section
              className="icw-card"
              style={{
                border: "1px solid #d8e3ef",
                borderRadius: 10,
                background: "#ffffff",
                padding: 16,
                width: "100%",
                maxWidth: "100%",
                overflowX: "hidden",
              }}
            >
              <div
                className="icw-title-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <h2 style={{ margin: 0, color: "#0f766e", fontSize: 34 / 1.5 }}>
                  Item Code
                </h2>
                <label style={{ fontSize: 12, color: "#475467" }}>
                  Show Deleted{" "}
                  <input
                    type="checkbox"
                    checked={showDeleted}
                    onChange={(event) => setShowDeleted(event.target.checked)}
                  />
                </label>
              </div>

              <div
                className="icw-table-wrap"
                style={{
                  overflowX: "auto",
                  border: "1px solid #dce8e2",
                  borderRadius: 8,
                }}
              >
                <table
                  className="icw-table"
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 840,
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "No.",
                        "Item Code ID",
                        "Item Code Name",
                        "Value",
                        "Label",
                        "Show Label",
                        "Action",
                      ].map((head) => (
                        <th
                          key={head}
                          style={{
                            borderBottom: "1px solid #dce8e2",
                            background: "#eefbf4",
                            color: "#475467",
                            textAlign: "left",
                            fontSize: 12,
                            padding: "8px 10px",
                          }}
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={`${row.no}-${row.itemCodeId}`}>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #edf2f7",
                            verticalAlign: "top",
                          }}
                        >
                          {row.no}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #edf2f7",
                            verticalAlign: "top",
                          }}
                        >
                          <button
                            type="button"
                            style={{
                              border: 0,
                              background: "transparent",
                              color: "#0f766e",
                              textDecoration: "underline",
                              padding: 0,
                              cursor: "pointer",
                            }}
                          >
                            {row.itemCodeId}
                          </button>
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #edf2f7",
                            verticalAlign: "top",
                          }}
                        >
                          {row.itemCodeName}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #edf2f7",
                            verticalAlign: "top",
                          }}
                        >
                          {row.codeValues.map((line) => (
                            <div
                              key={`value-${row.no}-${line.value}-${line.label}`}
                            >
                              {line.value}
                            </div>
                          ))}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #edf2f7",
                            verticalAlign: "top",
                          }}
                        >
                          {row.codeValues.map((line) => (
                            <div
                              key={`label-${row.no}-${line.value}-${line.label}`}
                            >
                              {line.label}
                            </div>
                          ))}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #edf2f7",
                            verticalAlign: "top",
                          }}
                        >
                          {row.codeValues.map((line) => (
                            <div
                              key={`show-${row.no}-${line.value}-${line.label}`}
                            >
                              {line.showLabel ? "YES" : "NO"}
                            </div>
                          ))}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #edf2f7",
                            verticalAlign: "top",
                          }}
                        >
                          <button
                            type="button"
                            aria-label={`Item code ${row.itemCodeId} view details`}
                            style={{
                              height: 24,
                              border: "1px solid #d2dde8",
                              borderRadius: 6,
                              background: "#fff",
                              color: "#475467",
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            ⧉
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                className="icw-bottom-bar"
                style={{
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    minWidth: 88,
                    height: 30,
                    border: "1px solid #d4deea",
                    borderRadius: 6,
                    background: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    color: "#334155",
                  }}
                >
                  {args.rowsPerPage} Rows
                </div>

                <div
                  className="icw-pagination"
                  style={{ display: "flex", gap: 6, alignItems: "center" }}
                >
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      type="button"
                      style={{
                        width: 24,
                        height: 24,
                        border: "1px solid #d4deea",
                        borderRadius: 4,
                        background: page === 1 ? "#0f766e" : "#fff",
                        color: page === 1 ? "#fff" : "#475467",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <div
                  className="icw-actions"
                  style={{ display: "flex", gap: 8 }}
                >
                  {["Excel Export", "Upload Excel"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      style={{
                        height: 34,
                        border: "1px solid #0f766e",
                        borderRadius: 8,
                        background: "#fff",
                        color: "#0f766e",
                        fontWeight: 600,
                        padding: "0 14px",
                        cursor: "pointer",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={openModal}
                    style={{
                      height: 34,
                      border: "1px solid #0f766e",
                      borderRadius: 8,
                      background: "#0f766e",
                      color: "#fff",
                      fontWeight: 700,
                      padding: "0 16px",
                      cursor: "pointer",
                    }}
                  >
                    Add Code
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>

        <CodeValueModal
          key={modalKey}
          isOpen={isModalOpen}
          initialFocusTarget={scenarioPreset === "ValidationError" ? "addButton" : "itemCodeId"}
          onClose={closeModal}
          onSubmit={handleAddCode}
        />
        <style>{`
          .icw-root * {
            box-sizing: border-box;
          }

          @media (max-width: 1080px) {
            .icw-top-meta {
              flex-wrap: wrap;
              justify-content: flex-end;
              gap: 8px;
            }

            .icw-layout {
              flex-direction: column;
            }

            .icw-sidebar {
              width: 100% !important;
              border-right: 0 !important;
              border-bottom: 1px solid #d9e3ef;
              overflow: hidden;
            }

            .icw-menu {
              display: flex !important;
              gap: 8px;
              overflow-x: auto;
              padding-bottom: 2px;
            }

            .icw-menu-button {
              min-width: 126px;
              white-space: nowrap;
              flex: 0 0 auto;
            }

            .icw-main {
              padding: 12px !important;
            }

            .icw-table {
              min-width: 760px !important;
            }
          }

          @media (max-width: 720px) {
            .icw-title-row {
              flex-direction: column;
              align-items: flex-start !important;
              gap: 8px;
            }

            .icw-bottom-bar {
              flex-direction: column;
              align-items: stretch !important;
            }

            .icw-pagination {
              justify-content: center;
            }

            .icw-actions {
              width: 100%;
              flex-direction: column;
            }

            .icw-actions > button {
              width: 100%;
            }

            .icw-table {
              min-width: 620px !important;
            }
          }
        `}</style>
      </div>
    );
  },
};
