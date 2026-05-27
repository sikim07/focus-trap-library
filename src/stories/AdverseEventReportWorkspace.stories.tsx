import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useFocusTrap } from "../hooks/useFocusTrap";

type ScenarioPreset =
  | "Baseline"
  | "FollowUpSerious"
  | "EmbryoCase"
  | "HeavyTable"
  | "Custom";

type StoryArgs = {
  sidebarWidth: number;
  trapEnabled: boolean;
  strictMasking: boolean;
  scenarioPreset: ScenarioPreset;
  customFollowUp: boolean;
  customSerious: boolean;
  customEmbryoCase: boolean;
  medicalRowCount: number;
  drugRowCount: number;
  examRowCount: number;
  causalityRowCount: number;
};

type RowId = {
  id: string;
};

type MedicalHistoryRow = RowId & {
  disease: string;
  start: string;
  end: string;
  progress: string;
  details: string;
};

type DrugHistoryRow = RowId & {
  name: string;
  start: string;
  end: string;
  progress: string;
  relation: string;
  details: string;
};

type ExaminationRow = RowId & {
  date: string;
  item: string;
  result: string;
  details: string;
};

type CausalityRow = RowId & {
  productName: string;
  activeSubstance: string;
  adverseEventName: string;
  causality:
    | "Certain"
    | "Probable"
    | "Possible"
    | "Unlikely"
    | "Conditional"
    | "Unassessable";
};

const meta = {
  title: "Pages/AdverseEventReportWorkspace",
  tags: ["autodocs"],
  args: {
    sidebarWidth: 250,
    trapEnabled: true,
    strictMasking: true,
    scenarioPreset: "Baseline",
    customFollowUp: false,
    customSerious: false,
    customEmbryoCase: false,
    medicalRowCount: 1,
    drugRowCount: 1,
    examRowCount: 1,
    causalityRowCount: 1,
  },
  argTypes: {
    sidebarWidth: {
      control: { type: "range", min: 220, max: 320, step: 10 },
      description: "좌측 네비게이션 너비(px)",
    },
    trapEnabled: {
      control: "boolean",
      description: "스토리 캔버스 내 포커스 순환 제어",
    },
    strictMasking: {
      control: "boolean",
      description: "이름/이메일/전화 등 민감 데이터 강한 마스킹",
    },
    scenarioPreset: {
      control: "select",
      options: [
        "Baseline",
        "FollowUpSerious",
        "EmbryoCase",
        "HeavyTable",
        "Custom",
      ],
      description: "테스트 시나리오 프리셋 선택",
    },
    customFollowUp: {
      control: "boolean",
      description: "Custom 모드에서 Follow-up 보고 상태",
    },
    customSerious: {
      control: "boolean",
      description: "Custom 모드에서 Serious(사망 관련) 상태",
    },
    customEmbryoCase: {
      control: "boolean",
      description: "Custom 모드에서 Embryo/infant 케이스 상태",
    },
    medicalRowCount: {
      control: { type: "range", min: 1, max: 8, step: 1 },
      description: "Medical History 초기 행 수",
    },
    drugRowCount: {
      control: { type: "range", min: 1, max: 8, step: 1 },
      description: "Drug History 초기 행 수",
    },
    examRowCount: {
      control: { type: "range", min: 1, max: 8, step: 1 },
      description: "Examination 초기 행 수",
    },
    causalityRowCount: {
      control: { type: "range", min: 1, max: 8, step: 1 },
      description: "Causality 초기 행 수",
    },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "실무 사용 화면의 구조를 바탕으로 재현한 대형 이상사례 보고 입력 페이지입니다. 보안 문제를 피하기 위해 개인정보/기관정보/연락처는 마스킹된 샘플 값으로 대체했습니다.",
      },
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

const globalFont = {
  fontFamily:
    '"Pretendard", "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const inputStyle = {
  width: "100%",
  height: 36,
  border: "1px solid #d5dfec",
  borderRadius: 6,
  padding: "0 10px",
  background: "#fff",
  color: "#111827",
};

const textareaStyle = {
  ...inputStyle,
  height: 72,
  paddingTop: 9,
  resize: "vertical" as const,
};

const sectionCardStyle = {
  border: "1px solid #e2e8f3",
  borderRadius: 10,
  background: "#fff",
  padding: 16,
};

const tableHeadCellStyle = {
  padding: "8px 10px",
  borderBottom: "1px solid #d6eadf",
  background: "#eefbf4",
  fontWeight: 700,
  fontSize: 12,
  color: "#344054",
  textAlign: "left" as const,
};

const tableCellStyle = {
  padding: 8,
  borderBottom: "1px solid #edf2f7",
  verticalAlign: "top" as const,
};

const rowActionButtonStyle = {
  height: 32,
  border: "1px solid #d5dfec",
  borderRadius: 6,
  background: "#fff",
  color: "#0f172a",
  fontWeight: 600,
  cursor: "pointer",
  padding: "0 10px",
  whiteSpace: "nowrap" as const,
};

const navItems = [
  "Enrollment",
  "Baseline",
  "Prior/Concomitant Medication",
  "Effectiveness Variables",
  "Adverse Event",
  "End of Observation",
  "Investigator Signature",
  "Doctors Report",
];

const createMedicalRow = (id: number): MedicalHistoryRow => ({
  id: `mh-${id}`,
  disease: id === 1 ? "Hypertension (sample)" : "",
  start: "",
  end: "",
  progress: "",
  details: "",
});

const createDrugRow = (id: number): DrugHistoryRow => ({
  id: `dh-${id}`,
  name: id === 1 ? "SampleDrug-A" : "",
  start: "",
  end: "",
  progress: "",
  relation: "",
  details: "",
});

const createExamRow = (id: number): ExaminationRow => ({
  id: `ex-${id}`,
  date: "",
  item: "",
  result: "",
  details: "",
});

const createCausalityRow = (id: number): CausalityRow => ({
  id: `ca-${id}`,
  productName: id === 1 ? "MaskedProduct" : "",
  activeSubstance: id === 1 ? "masked-substance" : "",
  adverseEventName: "",
  causality: "Possible",
});

const clampRowCount = (count: number): number =>
  Math.min(8, Math.max(1, Math.floor(count)));

const createRows = <T,>(count: number, factory: (id: number) => T): T[] =>
  Array.from({ length: clampRowCount(count) }, (_, index) =>
    factory(index + 1),
  );

const resolveScenarioConfig = (args: StoryArgs) => {
  if (args.scenarioPreset === "FollowUpSerious") {
    return {
      isFollowUp: true,
      isSerious: true,
      isEmbryoCase: false,
      medicalRowCount: 2,
      drugRowCount: 2,
      examRowCount: 1,
      causalityRowCount: 2,
    };
  }

  if (args.scenarioPreset === "EmbryoCase") {
    return {
      isFollowUp: false,
      isSerious: false,
      isEmbryoCase: true,
      medicalRowCount: 2,
      drugRowCount: 1,
      examRowCount: 1,
      causalityRowCount: 1,
    };
  }

  if (args.scenarioPreset === "HeavyTable") {
    return {
      isFollowUp: true,
      isSerious: true,
      isEmbryoCase: true,
      medicalRowCount: 5,
      drugRowCount: 6,
      examRowCount: 4,
      causalityRowCount: 5,
    };
  }

  if (args.scenarioPreset === "Custom") {
    return {
      isFollowUp: args.customFollowUp,
      isSerious: args.customSerious,
      isEmbryoCase: args.customEmbryoCase,
      medicalRowCount: args.medicalRowCount,
      drugRowCount: args.drugRowCount,
      examRowCount: args.examRowCount,
      causalityRowCount: args.causalityRowCount,
    };
  }

  return {
    isFollowUp: false,
    isSerious: false,
    isEmbryoCase: false,
    medicalRowCount: 1,
    drugRowCount: 1,
    examRowCount: 1,
    causalityRowCount: 1,
  };
};

export const Default: Story = {
  render: (args: StoryArgs) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const rowIdRef = useRef(2);
    const scenarioConfig = resolveScenarioConfig(args);
    const [isFollowUp, setIsFollowUp] = useState(scenarioConfig.isFollowUp);
    const [isSerious, setIsSerious] = useState(scenarioConfig.isSerious);
    const [isEmbryoCase, setIsEmbryoCase] = useState(
      scenarioConfig.isEmbryoCase,
    );
    const [medicalRows, setMedicalRows] = useState<MedicalHistoryRow[]>(
      createRows(scenarioConfig.medicalRowCount, createMedicalRow),
    );
    const [drugRows, setDrugRows] = useState<DrugHistoryRow[]>(
      createRows(scenarioConfig.drugRowCount, createDrugRow),
    );
    const [examRows, setExamRows] = useState<ExaminationRow[]>(
      createRows(scenarioConfig.examRowCount, createExamRow),
    );
    const [causalityRows, setCausalityRows] = useState<CausalityRow[]>(
      createRows(scenarioConfig.causalityRowCount, createCausalityRow),
    );

    useFocusTrap(rootRef, args.trapEnabled, { restoreFocus: false });

    useEffect(() => {
      const nextConfig = resolveScenarioConfig(args);
      setIsFollowUp(nextConfig.isFollowUp);
      setIsSerious(nextConfig.isSerious);
      setIsEmbryoCase(nextConfig.isEmbryoCase);
      setMedicalRows(createRows(nextConfig.medicalRowCount, createMedicalRow));
      setDrugRows(createRows(nextConfig.drugRowCount, createDrugRow));
      setExamRows(createRows(nextConfig.examRowCount, createExamRow));
      setCausalityRows(
        createRows(nextConfig.causalityRowCount, createCausalityRow),
      );
      rowIdRef.current =
        Math.max(
          clampRowCount(nextConfig.medicalRowCount),
          clampRowCount(nextConfig.drugRowCount),
          clampRowCount(nextConfig.examRowCount),
          clampRowCount(nextConfig.causalityRowCount),
        ) + 2;
    }, [args]);

    const createNextRowId = (): number => {
      const next = rowIdRef.current;
      rowIdRef.current += 1;
      return next;
    };

    const maskedReporterName = args.strictMasking ? "H** G**-D**" : "홍*동";
    const maskedEmail = args.strictMasking
      ? "pharmacovigilance+sample@masked-domain.example"
      : "reporter***@example.com";
    const maskedTel = args.strictMasking ? "+82-**-****-****" : "010-****-****";

    return (
      <div
        className="aerw-root"
        ref={rootRef}
        style={{
          ...globalFont,
          minHeight: "100vh",
          background: "#eef3f8",
          color: "#0f172a",
        }}
      >
        <header
          style={{
            height: 46,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 18px",
            borderBottom: "1px solid #d5e7de",
            background: "#ffffff",
          }}
        >
          <strong style={{ color: "#0f766e", letterSpacing: 0.2 }}>
            DIVE CDMS (Sanitized Demo)
          </strong>
          <div
            className="aerw-top-meta"
            style={{ display: "flex", gap: 14, fontSize: 12, color: "#475467" }}
          >
            <span>Project: *R*-*****-***</span>
            <span>User: masked.user@demo</span>
            <span>Locale: ko-KR</span>
          </div>
        </header>

        <nav
          className="aerw-global-nav"
          style={{
            height: 34,
            background: "#0f766e",
            color: "#ecfdf5",
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "0 16px",
            fontSize: 12,
          }}
        >
          {[
            "Home",
            "Participant",
            "Query",
            "eSign",
            "Report",
            "SDV",
            "Lock",
            "Data",
          ].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </nav>

        <div
          className="aerw-layout"
          style={{ display: "flex", minHeight: "calc(100vh - 80px)" }}
        >
          <aside
            className="aerw-sidebar"
            style={{
              width: args.sidebarWidth,
              flexShrink: 0,
              borderRight: "1px solid #d5e7de",
              background: "#f7fcf8",
              padding: 14,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                border: "1px solid #b9ddcf",
                borderRadius: 8,
                background: "#ebfff5",
                padding: "10px 12px",
                marginBottom: 12,
                fontWeight: 700,
                color: "#0f766e",
              }}
            >
              *R*-*****-***
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {navItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  style={{
                    textAlign: "left",
                    border: "1px solid #d1e5db",
                    borderRadius: 8,
                    background:
                      item === "Adverse Event"
                        ? "rgb(228 248 243)"
                        : "rgb(255 255 255)",
                    color: item === "Adverse Event" ? "#0f766e" : "#344054",
                    fontWeight: item === "Adverse Event" ? 700 : 500,
                    padding: "9px 10px",
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
            className="aerw-main"
            style={{ flex: 1, padding: 16, overflowY: "auto" }}
          >
            <section
              style={{
                ...sectionCardStyle,
                borderColor: "#b7decf",
                background: "#f0fdf4",
                marginBottom: 14,
              }}
            >
              <h2
                style={{
                  margin: "0 0 8px",
                  color: "#0f766e",
                  fontSize: 30 / 1.5,
                }}
              >
                Adverse Events - Adverse Drug Reactions Report (Initial)
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#334155",
                  lineHeight: 1.6,
                }}
              >
                실화면 구조를 바탕으로 구현한 샘플입니다.
                개인정보/기관정보/연락처는 모두 마스킹 처리된 테스트 데이터이며,
                실제 리포트 원문은 포함하지 않습니다.
              </p>
            </section>

            <section style={{ ...sectionCardStyle, marginBottom: 14 }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 17 }}>
                테스트 시나리오 흐름표
              </h3>
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  border: "1px solid #d1e5db",
                  borderRadius: 8,
                  background: "#f6fef9",
                  whiteSpace: "pre-wrap",
                  fontSize: 12,
                  lineHeight: 1.55,
                  color: "#334155",
                }}
              >
                {`[시작]
  -> Controls에서 scenarioPreset 선택
  -> 화면 상태 초기화
      -> Baseline: Initial / 일반 케이스 / 각 테이블 1행
      -> FollowUpSerious: Follow-up + Serious / 다중 행 검증
      -> EmbryoCase: Embryo/Infant 조건부 필드 검증
      -> HeavyTable: 대량 행 + 스크롤 + 액션 버튼 검증
      -> Custom: 토글/행수 직접 조합
  -> 입력 수행
      -> Action: + 행 추가 (현재 행 아래 삽입)
      -> Action: - 행 삭제 (최소 1행 유지)
      -> Tab 이동으로 다음 셀/액션 이동
  -> 조건부 필드 확인
      -> Follow-up = ON: 이전 보고번호/사유 활성화
      -> Serious = ON: 사망일/사망원인 활성화
      -> Embryo = ON: Parent 정보 활성화
  -> 하단 저장/제출 버튼 클릭 동선 점검
[종료]`}
              </pre>
            </section>

            <section style={{ ...sectionCardStyle, marginBottom: 14 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>
                Report Information
              </h3>
              <div style={{ display: "grid", gap: 10 }}>
                <label>
                  <div
                    style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                  >
                    Reporter Control No./Title
                  </div>
                  <input
                    style={inputStyle}
                    defaultValue="*R*-*****-*** (Sample)"
                  />
                </label>
                <label>
                  <div
                    style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                  >
                    Korea Institute Control No.
                  </div>
                  <input
                    style={inputStyle}
                    defaultValue="KIDS-ADR-SAMPLE-0001"
                  />
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  <label>
                    <div
                      style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                    >
                      Awareness Date of Occurrence
                    </div>
                    <input style={inputStyle} type="date" />
                  </label>
                  <fieldset
                    style={{
                      border: "1px solid #d5dfec",
                      borderRadius: 6,
                      margin: 0,
                      padding: "8px 10px",
                    }}
                  >
                    <legend
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        padding: "0 4px",
                      }}
                    >
                      Expedited Report
                    </legend>
                    <label style={{ marginRight: 14 }}>
                      <input type="radio" name="expedited" defaultChecked /> YES
                    </label>
                    <label>
                      <input type="radio" name="expedited" /> NO
                    </label>
                  </fieldset>
                  <label>
                    <div
                      style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                    >
                      Date of Report
                    </div>
                    <input style={inputStyle} type="date" />
                  </label>
                </div>

                <fieldset
                  style={{
                    border: "1px solid #d5dfec",
                    borderRadius: 8,
                    margin: 0,
                    padding: "10px 12px",
                  }}
                >
                  <legend
                    style={{ fontSize: 13, fontWeight: 700, padding: "0 4px" }}
                  >
                    Initial / Follow-up Report
                  </legend>
                  <label style={{ marginRight: 14 }}>
                    <input
                      type="radio"
                      name="followup"
                      checked={!isFollowUp}
                      onChange={() => setIsFollowUp(false)}
                    />{" "}
                    Initial
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="followup"
                      checked={isFollowUp}
                      onChange={() => setIsFollowUp(true)}
                    />{" "}
                    Follow-up
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: 10,
                      marginTop: 10,
                    }}
                  >
                    <input
                      style={{ ...inputStyle, opacity: isFollowUp ? 1 : 0.6 }}
                      placeholder="Administration No./title of previous report"
                      aria-label="Administration No./title of previous report"
                      disabled={!isFollowUp}
                    />
                    <input
                      style={{ ...inputStyle, opacity: isFollowUp ? 1 : 0.6 }}
                      placeholder="Reason of follow up report"
                      aria-label="Reason of follow up report"
                      disabled={!isFollowUp}
                    />
                  </div>
                </fieldset>
              </div>
            </section>

            <section style={{ ...sectionCardStyle, marginBottom: 14 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>
                Serious Event / Patient Snapshot
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                  gap: 16,
                }}
              >
                <div>
                  <fieldset
                    style={{
                      border: "1px solid #d5dfec",
                      borderRadius: 8,
                      margin: 0,
                      padding: "10px 12px",
                    }}
                  >
                    <legend
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        padding: "0 4px",
                      }}
                    >
                      In case of serious adverse event
                    </legend>
                    {[
                      "Results in death",
                      "Life-threatening",
                      "In-patient or prolonged hospitalization",
                      "Congenital anomaly",
                      "Other medically important situation",
                    ].map((label) => (
                      <label
                        key={label}
                        style={{ display: "block", marginBottom: 6 }}
                      >
                        <input
                          type="checkbox"
                          defaultChecked={label === "Life-threatening"}
                          onChange={(event) => {
                            if (label === "Results in death") {
                              setIsSerious(event.target.checked);
                            }
                          }}
                        />{" "}
                        {label}
                      </label>
                    ))}
                  </fieldset>

                  <div
                    style={{
                      marginTop: 10,
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 8,
                    }}
                  >
                    <input
                      style={{ ...inputStyle, opacity: isSerious ? 1 : 0.65 }}
                      type="date"
                      aria-label="Date of death"
                      disabled={!isSerious}
                    />
                    <input
                      style={{ ...inputStyle, opacity: isSerious ? 1 : 0.65 }}
                      placeholder="Cause of death"
                      aria-label="Cause of death"
                      disabled={!isSerious}
                    />
                  </div>
                </div>

                <div>
                  <fieldset
                    style={{
                      border: "1px solid #d5dfec",
                      borderRadius: 6,
                      margin: 0,
                      padding: "8px 10px",
                    }}
                  >
                    <legend
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        padding: "0 4px",
                      }}
                    >
                      Sex
                    </legend>
                    <label style={{ marginRight: 12 }}>
                      <input type="radio" name="sex" defaultChecked /> Male
                    </label>
                    <label style={{ marginRight: 12 }}>
                      <input type="radio" name="sex" /> Female
                    </label>
                    <label>
                      <input type="radio" name="sex" /> Unknown
                    </label>
                  </fieldset>

                  <div
                    style={{
                      marginTop: 10,
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 8,
                    }}
                  >
                    <label>
                      <div
                        style={{
                          marginBottom: 5,
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Initial
                      </div>
                      <input style={inputStyle} defaultValue="H**" />
                    </label>
                    <label>
                      <div
                        style={{
                          marginBottom: 5,
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Birth Date
                      </div>
                      <input style={inputStyle} type="month" />
                    </label>
                    <label>
                      <div
                        style={{
                          marginBottom: 5,
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Height (cm)
                      </div>
                      <input style={inputStyle} defaultValue="170" />
                    </label>
                    <label>
                      <div
                        style={{
                          marginBottom: 5,
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Weight (kg)
                      </div>
                      <input style={inputStyle} defaultValue="63" />
                    </label>
                  </div>

                  <label style={{ display: "block", marginTop: 10 }}>
                    <input
                      type="checkbox"
                      checked={isEmbryoCase}
                      onChange={(event) =>
                        setIsEmbryoCase(event.target.checked)
                      }
                    />{" "}
                    Embryo / infant case
                  </label>

                  <div
                    style={{
                      marginTop: 8,
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 8,
                      opacity: isEmbryoCase ? 1 : 0.6,
                    }}
                  >
                    <input
                      style={inputStyle}
                      placeholder="Parent name (masked)"
                      aria-label="Parent name"
                      disabled={!isEmbryoCase}
                    />
                    <input
                      style={inputStyle}
                      placeholder="Pregnancy period (weeks)"
                      aria-label="Pregnancy period in weeks"
                      disabled={!isEmbryoCase}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section style={{ ...sectionCardStyle, marginBottom: 14 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>
                Medical History of Patient
              </h3>
              <div
                style={{
                  overflowX: "auto",
                  border: "1px solid #d6eadf",
                  borderRadius: 8,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 980,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={tableHeadCellStyle}>No.</th>
                      <th style={tableHeadCellStyle}>Disease Name</th>
                      <th style={tableHeadCellStyle}>Start Date</th>
                      <th style={tableHeadCellStyle}>End Date</th>
                      <th style={tableHeadCellStyle}>Current Progress</th>
                      <th style={tableHeadCellStyle}>Details</th>
                      <th style={tableHeadCellStyle}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalRows.map((row, index) => (
                      <tr key={row.id}>
                        <td style={tableCellStyle}>{index + 1}</td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            defaultValue={row.disease}
                            aria-label={`Medical history row ${index + 1} disease name`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            type="date"
                            defaultValue={row.start}
                            aria-label={`Medical history row ${index + 1} start date`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            type="date"
                            defaultValue={row.end}
                            aria-label={`Medical history row ${index + 1} end date`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            defaultValue={row.progress}
                            aria-label={`Medical history row ${index + 1} current progress`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            defaultValue={row.details}
                            aria-label={`Medical history row ${index + 1} details`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              style={rowActionButtonStyle}
                              onClick={() =>
                                setMedicalRows((prev) => {
                                  const nextRows = [...prev];
                                  const indexById = nextRows.findIndex(
                                    (item) => item.id === row.id,
                                  );
                                  const nextRow =
                                    createMedicalRow(createNextRowId());
                                  if (indexById < 0) {
                                    nextRows.push(nextRow);
                                    return nextRows;
                                  }

                                  nextRows.splice(indexById + 1, 0, nextRow);
                                  return nextRows;
                                })
                              }
                            >
                              + 행 추가
                            </button>
                            <button
                              type="button"
                              style={rowActionButtonStyle}
                              onClick={() =>
                                setMedicalRows((prev) =>
                                  prev.length > 1
                                    ? prev.filter((item) => item.id !== row.id)
                                    : prev,
                                )
                              }
                            >
                              - 행 삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section style={{ ...sectionCardStyle, marginBottom: 14 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>
                Drug History & Adverse Event Information
              </h3>
              <div
                style={{
                  overflowX: "auto",
                  border: "1px solid #d6eadf",
                  borderRadius: 8,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 1100,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={tableHeadCellStyle}>No.</th>
                      <th style={tableHeadCellStyle}>Drug Name</th>
                      <th style={tableHeadCellStyle}>Start Date</th>
                      <th style={tableHeadCellStyle}>End Date</th>
                      <th style={tableHeadCellStyle}>Current Progress</th>
                      <th style={tableHeadCellStyle}>
                        Relation of Adverse Event
                      </th>
                      <th style={tableHeadCellStyle}>Details</th>
                      <th style={tableHeadCellStyle}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drugRows.map((row, index) => (
                      <tr key={row.id}>
                        <td style={tableCellStyle}>{index + 1}</td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            defaultValue={row.name}
                            aria-label={`Drug history row ${index + 1} drug name`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            type="date"
                            defaultValue={row.start}
                            aria-label={`Drug history row ${index + 1} start date`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            type="date"
                            defaultValue={row.end}
                            aria-label={`Drug history row ${index + 1} end date`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            defaultValue={row.progress}
                            aria-label={`Drug history row ${index + 1} current progress`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            defaultValue={row.relation}
                            aria-label={`Drug history row ${index + 1} adverse event relation`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            defaultValue={row.details}
                            aria-label={`Drug history row ${index + 1} details`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              style={rowActionButtonStyle}
                              onClick={() =>
                                setDrugRows((prev) => {
                                  const nextRows = [...prev];
                                  const indexById = nextRows.findIndex(
                                    (item) => item.id === row.id,
                                  );
                                  const nextRow =
                                    createDrugRow(createNextRowId());
                                  if (indexById < 0) {
                                    nextRows.push(nextRow);
                                    return nextRows;
                                  }

                                  nextRows.splice(indexById + 1, 0, nextRow);
                                  return nextRows;
                                })
                              }
                            >
                              + 행 추가
                            </button>
                            <button
                              type="button"
                              style={rowActionButtonStyle}
                              onClick={() =>
                                setDrugRows((prev) =>
                                  prev.length > 1
                                    ? prev.filter((item) => item.id !== row.id)
                                    : prev,
                                )
                              }
                            >
                              - 행 삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 10,
                }}
              >
                <label>
                  <div
                    style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                  >
                    Name of Adverse Event
                  </div>
                  <input
                    style={inputStyle}
                    placeholder="예: Elevated AST (sample)"
                  />
                </label>
                <label>
                  <div
                    style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                  >
                    Date of symptom occurrence
                  </div>
                  <input style={inputStyle} type="date" />
                </label>
                <label>
                  <div
                    style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                  >
                    Date of symptom disappearance
                  </div>
                  <input style={inputStyle} type="date" />
                </label>
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                  Progress of Adverse Event
                </div>
                {[
                  "Recovered",
                  "Recovering",
                  "Not recovered",
                  "Recovered with sequela",
                  "Fatal",
                  "Unknown",
                ].map((item) => (
                  <label key={item} style={{ marginRight: 14 }}>
                    <input
                      type="radio"
                      name="progress-event"
                      defaultChecked={item === "Recovering"}
                    />{" "}
                    {item}
                  </label>
                ))}
              </div>

              <label style={{ display: "block", marginTop: 10 }}>
                <div style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}>
                  Adverse Event Details
                </div>
                <textarea style={textareaStyle} />
              </label>
            </section>

            <section style={{ ...sectionCardStyle, marginBottom: 14 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>Examination</h3>
              <div
                style={{
                  overflowX: "auto",
                  border: "1px solid #d6eadf",
                  borderRadius: 8,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 920,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={tableHeadCellStyle}>No.</th>
                      <th style={tableHeadCellStyle}>Date of Examination</th>
                      <th style={tableHeadCellStyle}>Examination Item</th>
                      <th style={tableHeadCellStyle}>Results</th>
                      <th style={tableHeadCellStyle}>Details</th>
                      <th style={tableHeadCellStyle}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examRows.map((row, index) => (
                      <tr key={row.id}>
                        <td style={tableCellStyle}>{index + 1}</td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            type="date"
                            defaultValue={row.date}
                            aria-label={`Examination row ${index + 1} date`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            defaultValue={row.item}
                            aria-label={`Examination row ${index + 1} item`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            defaultValue={row.result}
                            aria-label={`Examination row ${index + 1} result`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            defaultValue={row.details}
                            aria-label={`Examination row ${index + 1} details`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              style={rowActionButtonStyle}
                              onClick={() =>
                                setExamRows((prev) => {
                                  const nextRows = [...prev];
                                  const indexById = nextRows.findIndex(
                                    (item) => item.id === row.id,
                                  );
                                  const nextRow =
                                    createExamRow(createNextRowId());
                                  if (indexById < 0) {
                                    nextRows.push(nextRow);
                                    return nextRows;
                                  }

                                  nextRows.splice(indexById + 1, 0, nextRow);
                                  return nextRows;
                                })
                              }
                            >
                              + 행 추가
                            </button>
                            <button
                              type="button"
                              style={rowActionButtonStyle}
                              onClick={() =>
                                setExamRows((prev) =>
                                  prev.length > 1
                                    ? prev.filter((item) => item.id !== row.id)
                                    : prev,
                                )
                              }
                            >
                              - 행 삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section style={{ ...sectionCardStyle, marginBottom: 14 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>
                Drug Information / Causality
              </h3>
              <div
                style={{
                  border: "1px solid #d6eadf",
                  borderRadius: 8,
                  background: "#f4fcf7",
                  padding: 10,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 10,
                  }}
                >
                  <label>
                    <div
                      style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                    >
                      Product Name
                    </div>
                    <input style={inputStyle} defaultValue="MaskedProduct-A" />
                  </label>
                  <label>
                    <div
                      style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                    >
                      Active Ingredient Name
                    </div>
                    <input
                      style={inputStyle}
                      defaultValue="masked-ingredient"
                    />
                  </label>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  <label>
                    <div
                      style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                    >
                      Suspect / Concomitant / Interacting
                    </div>
                    <select style={inputStyle} defaultValue="Suspect">
                      <option>Suspect</option>
                      <option>Concomitant</option>
                      <option>Interacting</option>
                      <option>Drug not administered</option>
                    </select>
                  </label>
                  <label>
                    <div
                      style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                    >
                      Purpose of Administration
                    </div>
                    <input
                      style={inputStyle}
                      defaultValue="Control of tumor progression"
                    />
                  </label>
                  <label>
                    <div
                      style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                    >
                      Dose / Measurement
                    </div>
                    <input style={inputStyle} defaultValue="5 mg / day" />
                  </label>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  <label>
                    <div
                      style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                    >
                      Started Date of Administration
                    </div>
                    <input style={inputStyle} type="date" />
                  </label>
                  <label>
                    <div
                      style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                    >
                      Ended Date of Administration
                    </div>
                    <input style={inputStyle} type="date" />
                  </label>
                  <label>
                    <div
                      style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                    >
                      Administration Duration (days)
                    </div>
                    <input style={inputStyle} defaultValue="14" />
                  </label>
                </div>
              </div>

              <div
                style={{
                  overflowX: "auto",
                  marginTop: 12,
                  border: "1px solid #d6eadf",
                  borderRadius: 8,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 980,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={tableHeadCellStyle}>No.</th>
                      <th style={tableHeadCellStyle}>Product Name</th>
                      <th style={tableHeadCellStyle}>Active Substance Name</th>
                      <th style={tableHeadCellStyle}>Adverse Event Name</th>
                      <th style={tableHeadCellStyle}>Causality</th>
                      <th style={tableHeadCellStyle}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {causalityRows.map((row, index) => (
                      <tr key={row.id}>
                        <td style={tableCellStyle}>{index + 1}</td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            defaultValue={row.productName}
                            aria-label={`Causality row ${index + 1} product name`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            defaultValue={row.activeSubstance}
                            aria-label={`Causality row ${index + 1} active substance name`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <input
                            style={inputStyle}
                            defaultValue={row.adverseEventName}
                            aria-label={`Causality row ${index + 1} adverse event name`}
                          />
                        </td>
                        <td style={tableCellStyle}>
                          <div
                            style={{ display: "grid", gap: 4, fontSize: 12 }}
                          >
                            {[
                              "Certain",
                              "Probable",
                              "Possible",
                              "Unlikely",
                              "Conditional",
                              "Unassessable",
                            ].map((level) => (
                              <label key={level}>
                                <input
                                  type="radio"
                                  name={`causality-${row.id}`}
                                  defaultChecked={level === row.causality}
                                />{" "}
                                {level}
                              </label>
                            ))}
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              style={rowActionButtonStyle}
                              onClick={() =>
                                setCausalityRows((prev) => {
                                  const nextRows = [...prev];
                                  const indexById = nextRows.findIndex(
                                    (item) => item.id === row.id,
                                  );
                                  const nextRow =
                                    createCausalityRow(createNextRowId());
                                  if (indexById < 0) {
                                    nextRows.push(nextRow);
                                    return nextRows;
                                  }

                                  nextRows.splice(indexById + 1, 0, nextRow);
                                  return nextRows;
                                })
                              }
                            >
                              + 행 추가
                            </button>
                            <button
                              type="button"
                              style={rowActionButtonStyle}
                              onClick={() =>
                                setCausalityRows((prev) =>
                                  prev.length > 1
                                    ? prev.filter((item) => item.id !== row.id)
                                    : prev,
                                )
                              }
                            >
                              - 행 삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section style={{ ...sectionCardStyle, marginBottom: 14 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>
                Reporter Information
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 10,
                }}
              >
                <label>
                  <div
                    style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                  >
                    Qualification
                  </div>
                  <select style={inputStyle} defaultValue="Physician">
                    <option>Physician</option>
                    <option>Pharmacist</option>
                    <option>Other health professional</option>
                    <option>Consumer / non health professional</option>
                  </select>
                </label>
                <label>
                  <div
                    style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                  >
                    Institution Name
                  </div>
                  <input
                    style={inputStyle}
                    defaultValue="Masked Medical Center"
                  />
                </label>
                <label>
                  <div
                    style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                  >
                    Country
                  </div>
                  <input style={inputStyle} defaultValue="Korea" />
                </label>
                <label>
                  <div
                    style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                  >
                    Name
                  </div>
                  <input style={inputStyle} defaultValue={maskedReporterName} />
                </label>
                <label>
                  <div
                    style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                  >
                    Tel.
                  </div>
                  <input style={inputStyle} defaultValue={maskedTel} />
                </label>
                <label>
                  <div
                    style={{ marginBottom: 5, fontSize: 13, fontWeight: 600 }}
                  >
                    E-mail
                  </div>
                  <input style={inputStyle} defaultValue={maskedEmail} />
                </label>
              </div>
            </section>

            <section style={{ ...sectionCardStyle, marginBottom: 14 }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 17 }}>
                Reference to Fill In
              </h3>
              <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.65 }}>
                <p style={{ margin: "0 0 6px" }}>
                  1) Mandatory information fields marked with * must contain at
                  least one entry from patient/reporter/report information.
                </p>
                <p style={{ margin: "0 0 6px" }}>
                  2) This page is a sanitized sample UI for prototyping. Real
                  case narratives, personal identifiers, and
                  institution-specific numbers are intentionally removed.
                </p>
                <p style={{ margin: 0 }}>
                  3) For production adoption, apply role-based field masking,
                  audit trails, and secure data transport policy.
                </p>
              </div>
            </section>

            <footer
              className="aerw-sticky-footer"
              style={{
                position: "sticky",
                bottom: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                border: "1px solid #d3ddea",
                borderRadius: 10,
                background: "rgb(255 255 255 / 95%)",
                backdropFilter: "blur(3px)",
              }}
            >
              <span style={{ fontSize: 12, color: "#475467" }}>
                보안 샘플 데이터 모드:{" "}
                {args.strictMasking ? "Strict Masking" : "Light Masking"}
              </span>
              <div
                className="aerw-footer-actions"
                style={{ display: "flex", gap: 8 }}
              >
                <button
                  type="button"
                  style={{
                    height: 36,
                    border: "1px solid #c8d4e3",
                    borderRadius: 8,
                    background: "#fff",
                    padding: "0 14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Temporary Save
                </button>
                <button
                  type="button"
                  style={{
                    height: 36,
                    border: "1px solid #0f766e",
                    borderRadius: 8,
                    background: "#0f766e",
                    color: "#fff",
                    padding: "0 14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Submit Report
                </button>
              </div>
            </footer>
          </main>
        </div>
        <style>{`
          .aerw-root * {
            box-sizing: border-box;
          }

          @media (max-width: 1080px) {
            .aerw-top-meta {
              gap: 8px;
              flex-wrap: wrap;
              justify-content: flex-end;
            }

            .aerw-global-nav {
              overflow-x: auto;
              white-space: nowrap;
            }

            .aerw-layout {
              flex-direction: column;
            }

            .aerw-sidebar {
              width: 100% !important;
              border-right: 0 !important;
              border-bottom: 1px solid #d5e7de;
              max-height: 260px;
            }

            .aerw-main {
              padding: 12px !important;
            }
          }

          @media (max-width: 720px) {
            .aerw-sticky-footer {
              position: static !important;
              flex-direction: column;
              align-items: stretch !important;
            }

            .aerw-footer-actions {
              width: 100%;
            }

            .aerw-footer-actions > button {
              flex: 1;
            }
          }
        `}</style>
      </div>
    );
  },
};
