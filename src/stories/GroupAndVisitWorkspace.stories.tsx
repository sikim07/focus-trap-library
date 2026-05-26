import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useFocusTrap } from "../hooks/useFocusTrap";

type VisitRow = {
  id: string;
  visitId: string;
  visitCode: string;
  visitLabel: string;
};

type VisitGroupCard = {
  id: string;
  visitGroupId: string;
  visitGroupCode: string;
  visitGroupLabel: string;
  type: "All Visit" | "Normal Visit" | "Unscheduled";
  repeat: boolean;
  visits: VisitRow[];
};

const meta = {
  title: "Pages/GroupAndVisitWorkspace",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "실무형 Group & Visit 입력 페이지를 모사한 스토리입니다. Visit는 특정 Visit Group에 소속되며, 행 삽입/삭제와 키보드 입력 흐름을 검증합니다.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const workspaceRef = useRef<HTMLDivElement>(null);
    const visitLabelInputRefs = useRef<Record<string, HTMLInputElement | null>>(
      {},
    );
    const [saveMessage, setSaveMessage] = useState("");
    const [pendingFocusVisitId, setPendingFocusVisitId] = useState<
      string | null
    >(null);
    const idRef = useRef(10);

    const createId = (prefix: string): string => {
      const next = idRef.current;
      idRef.current += 1;
      return `${prefix}-${next}`;
    };

    const createEmptyVisit = (): VisitRow => ({
      id: createId("visit"),
      visitId: "",
      visitCode: "",
      visitLabel: "",
    });

    const createEmptyGroup = (): VisitGroupCard => ({
      id: createId("group"),
      visitGroupId: "",
      visitGroupCode: "",
      visitGroupLabel: "",
      type: "Normal Visit",
      repeat: false,
      visits: [createEmptyVisit()],
    });

    const [groups, setGroups] = useState<VisitGroupCard[]>([
      {
        id: "group-1",
        visitGroupId: "V1",
        visitGroupCode: "Visit Group[1]",
        visitGroupLabel: "Primary Group",
        type: "All Visit",
        repeat: false,
        visits: [
          { id: "visit-1", visitId: "T1", visitCode: "11", visitLabel: "T1" },
          { id: "visit-2", visitId: "T2", visitCode: "22", visitLabel: "T2" },
        ],
      },
    ]);

    const updateGroupField = <
      K extends keyof Omit<VisitGroupCard, "id" | "visits">,
    >(
      groupId: string,
      field: K,
      value: VisitGroupCard[K],
    ): void => {
      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? {
                ...group,
                [field]: value,
              }
            : group,
        ),
      );
    };

    const updateVisitField = (
      groupId: string,
      visitId: string,
      field: keyof Omit<VisitRow, "id">,
      value: string,
    ): void => {
      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? {
                ...group,
                visits: group.visits.map((visit) =>
                  visit.id === visitId
                    ? {
                        ...visit,
                        [field]: value,
                      }
                    : visit,
                ),
              }
            : group,
        ),
      );
    };

    const insertVisitRowAfter = (
      groupId: string,
      afterVisitId: string,
      shouldFocusLabel = false,
    ): void => {
      const newVisit = createEmptyVisit();
      setGroups((prev) =>
        prev.map((group) => {
          if (group.id !== groupId) {
            return group;
          }

          const insertIndex = group.visits.findIndex(
            (visit) => visit.id === afterVisitId,
          );
          if (insertIndex < 0) {
            return {
              ...group,
              visits: [...group.visits, newVisit],
            };
          }

          const nextVisits = [...group.visits];
          nextVisits.splice(insertIndex + 1, 0, newVisit);
          return {
            ...group,
            visits: nextVisits,
          };
        }),
      );

      if (shouldFocusLabel) {
        setPendingFocusVisitId(newVisit.id);
      }
    };

    const removeVisitRow = (groupId: string, visitId: string): void => {
      setGroups((prev) =>
        prev.map((group) => {
          if (group.id !== groupId) {
            return group;
          }

          const nextVisits = group.visits.filter(
            (visit) => visit.id !== visitId,
          );
          return {
            ...group,
            visits: nextVisits.length > 0 ? nextVisits : [createEmptyVisit()],
          };
        }),
      );
    };

    const addVisitGroup = (): void => {
      setGroups((prev) => [...prev, createEmptyGroup()]);
    };

    const saveVisitGroup = (groupId: string): void => {
      const targetGroup = groups.find((group) => group.id === groupId);
      if (!targetGroup) {
        return;
      }

      setSaveMessage(
        `Saved ${targetGroup.visitGroupCode || targetGroup.id} / visits: ${targetGroup.visits.length}`,
      );
    };

    const primaryButtonStyle = {
      height: 36,
      border: "1px solid #1d4ed8",
      borderRadius: 8,
      background: "#2563eb",
      color: "#fff",
      fontWeight: 600,
      padding: "0 12px",
      cursor: "pointer",
    };

    const saveButtonStyle = {
      ...primaryButtonStyle,
      border: "1px solid var(--save-btn-border, #115e59)",
      background: "var(--save-btn-bg, #0f766e)",
    };

    const neutralButtonStyle = {
      height: 34,
      border: "1px solid #cbd5e1",
      borderRadius: 8,
      background: "#fff",
      color: "#0f172a",
      fontWeight: 500,
      padding: "0 10px",
      cursor: "pointer",
    };

    const subtleActionButtonStyle = {
      ...neutralButtonStyle,
      height: 32,
      fontSize: 13,
      padding: "0 8px",
    };

    const fieldStyle = {
      height: 36,
      border: "1px solid #cbd5e1",
      borderRadius: 8,
      background: "#fff",
      padding: "0 10px",
      color: "#0f172a",
    };

    // Storybook 캔버스에서 Tab 순환이 바깥 UI로 빠지지 않도록 페이지 자체에 trap을 적용합니다.
    useFocusTrap(workspaceRef, true, { restoreFocus: false });

    useEffect(() => {
      if (!pendingFocusVisitId) {
        return;
      }

      const rafId = window.requestAnimationFrame(() => {
        visitLabelInputRefs.current[pendingFocusVisitId]?.focus();
        setPendingFocusVisitId(null);
      });

      return () => {
        window.cancelAnimationFrame(rafId);
      };
    }, [pendingFocusVisitId, groups]);

    return (
      <div
        ref={workspaceRef}
        style={{ minHeight: "100vh", background: "#f1f5f9", color: "#0f172a" }}
      >
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <aside
            style={{
              width: 240,
              borderRight: "1px solid #d9e1ee",
              background: "#ffffff",
              padding: 16,
              display: "grid",
              alignContent: "start",
              gap: 8,
            }}
          >
            <button
              type="button"
              aria-current="page"
              style={{
                textAlign: "left",
                border: "1px solid #1d4ed8",
                borderRadius: 8,
                background: "#dbeafe",
                color: "#1e3a8a",
                fontWeight: 700,
                padding: "8px 10px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Group & Visit
            </button>
            {[
              "CRF Form",
              "Schedule",
              "Item Code",
              "Event",
              "Report",
              "Visit Window",
            ].map((item) => (
              <button
                key={item}
                type="button"
                style={{
                  textAlign: "left",
                  border: "1px solid #d7deea",
                  borderRadius: 8,
                  background: "#f8fafc",
                  color: "#334155",
                  fontWeight: 500,
                  padding: "8px 10px",
                  cursor: "pointer",
                }}
              >
                {item}
              </button>
            ))}
          </aside>

          <main style={{ flex: 1, padding: 20 }}>
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 24 }}>Group & Visit</h3>
                <p style={{ margin: "8px 0 0", color: "#475569" }}>
                  Visit Group/Visit 입력 시나리오에서 행 삽입/삭제와 키보드 이동
                  흐름을 검증합니다.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  style={saveButtonStyle}
                  onClick={addVisitGroup}
                >
                  + Visit Group 추가
                </button>
              </div>
            </header>

            <section
              aria-label="입력 가이드"
              style={{
                marginBottom: 14,
                border: "1px solid #d9e1ee",
                borderRadius: 10,
                background: "#ffffff",
                padding: "10px 12px",
                color: "#334155",
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              <strong
                style={{ display: "block", marginBottom: 4, color: "#0f172a" }}
              >
                입력 가이드
              </strong>
              <div>
                목적: Visit 입력 중 행 삽입/삭제를 빠르게 수행하고 저장 단위를
                Group으로 유지합니다.
              </div>
              <div>
                흐름: 각 행의 Visit Label 입력 후 Action의 + 행 추가로 해당 행
                아래에 즉시 삽입합니다.
              </div>
              <div>{`검증: Tab 이동(Visit Label -> + 행 추가 -> - 행 삭제), 삽입 위치, Save Group 결과 메시지를 확인합니다.`}</div>
            </section>

            <div style={{ display: "grid", gap: 14 }}>
              {groups.map((group, groupIndex) => (
                <section
                  key={group.id}
                  style={{
                    border: "1px solid #d9e1ee",
                    borderRadius: 12,
                    background: "#fff",
                    padding: 16,
                    boxShadow: "0 8px 20px rgb(15 23 42 / 6%)",
                  }}
                >
                  <header
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <strong style={{ fontSize: 16 }}>
                      Visit Group Card {groupIndex + 1}
                    </strong>
                  </header>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 180px 90px",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <input
                      style={fieldStyle}
                      placeholder="Visit Group ID"
                      value={group.visitGroupId}
                      onChange={(event) =>
                        updateGroupField(
                          group.id,
                          "visitGroupId",
                          event.target.value,
                        )
                      }
                    />
                    <input
                      style={fieldStyle}
                      placeholder="Visit Group Code"
                      value={group.visitGroupCode}
                      onChange={(event) =>
                        updateGroupField(
                          group.id,
                          "visitGroupCode",
                          event.target.value,
                        )
                      }
                    />
                    <input
                      style={fieldStyle}
                      placeholder="Visit Group Label"
                      value={group.visitGroupLabel}
                      onChange={(event) =>
                        updateGroupField(
                          group.id,
                          "visitGroupLabel",
                          event.target.value,
                        )
                      }
                    />
                    <select
                      style={fieldStyle}
                      value={group.type}
                      onChange={(event) =>
                        updateGroupField(
                          group.id,
                          "type",
                          event.target.value as VisitGroupCard["type"],
                        )
                      }
                    >
                      <option value="All Visit">All Visit</option>
                      <option value="Normal Visit">Normal Visit</option>
                      <option value="Unscheduled">Unscheduled</option>
                    </select>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        justifyContent: "center",
                        border: "1px solid #cbd5e1",
                        borderRadius: 8,
                        background: "#fff",
                        fontSize: 13,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={group.repeat}
                        onChange={(event) =>
                          updateGroupField(
                            group.id,
                            "repeat",
                            event.target.checked,
                          )
                        }
                      />
                      Repeat
                    </label>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 200px",
                      gap: 8,
                      paddingBottom: 8,
                      borderBottom: "1px solid #e2e8f0",
                      fontWeight: 700,
                      color: "#475569",
                    }}
                  >
                    <span>Visit ID</span>
                    <span>Visit Code</span>
                    <span>Visit Label</span>
                    <span>Action</span>
                  </div>

                  <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                    {group.visits.map((visit) => (
                      <div
                        key={visit.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr 200px",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <input
                          style={fieldStyle}
                          placeholder="Visit ID"
                          value={visit.visitId}
                          onChange={(event) =>
                            updateVisitField(
                              group.id,
                              visit.id,
                              "visitId",
                              event.target.value,
                            )
                          }
                        />
                        <input
                          style={fieldStyle}
                          placeholder="Visit Code"
                          value={visit.visitCode}
                          onChange={(event) =>
                            updateVisitField(
                              group.id,
                              visit.id,
                              "visitCode",
                              event.target.value,
                            )
                          }
                        />
                        <input
                          ref={(node) => {
                            visitLabelInputRefs.current[visit.id] = node;
                          }}
                          style={fieldStyle}
                          placeholder="Visit Label"
                          value={visit.visitLabel}
                          onChange={(event) =>
                            updateVisitField(
                              group.id,
                              visit.id,
                              "visitLabel",
                              event.target.value,
                            )
                          }
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            style={subtleActionButtonStyle}
                            onClick={() =>
                              insertVisitRowAfter(group.id, visit.id, true)
                            }
                          >
                            + 행 추가
                          </button>
                          <button
                            type="button"
                            style={subtleActionButtonStyle}
                            onClick={() => removeVisitRow(group.id, visit.id)}
                          >
                            - 행 삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <footer
                    style={{
                      marginTop: 12,
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
                    <button
                      type="button"
                      style={saveButtonStyle}
                      onClick={() => saveVisitGroup(group.id)}
                    >
                      Save Group
                    </button>
                  </footer>
                </section>
              ))}
            </div>

            <footer style={{ marginTop: 12, padding: "8px 2px" }}>
              <small style={{ color: "#475569", fontSize: 13 }}>
                {saveMessage ||
                  "저장 이력을 보려면 각 그룹 하단 Save Group을 눌러주세요."}
              </small>
            </footer>
          </main>
        </div>
      </div>
    );
  },
};
