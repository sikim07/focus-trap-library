import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataEntryModal } from "./DataEntryModal";

const meta = {
  title: "Components/DataEntryModal",
  component: DataEntryModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    a11y: {
      test: "todo",
    },
  },
  argTypes: {
    isOpen: {
      control: false,
      description: "스토리 내부 상태로 열림/닫힘을 제어합니다.",
    },
    onClose: {
      action: "onClose",
      description: "닫기 버튼, 오버레이 클릭 시 호출됩니다.",
    },
    onSubmit: {
      action: "onSubmit",
      description: "저장 버튼 클릭(폼 제출) 시 입력 데이터와 함께 호출됩니다.",
    },
  },
} satisfies Meta<typeof DataEntryModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  args: {
    title: "임상 데이터 입력",
    isOpen: false,
    onClose: () => {},
    onSubmit: () => {},
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div style={{ minHeight: "100vh", padding: "24px" }}>
        <h3 style={{ marginTop: 0 }}>Focus Trap PoC</h3>
        <p>
          아래 버튼으로 모달을 열고 <kbd>Tab</kbd> / <kbd>Shift + Tab</kbd>으로
          포커스가 모달 내부에서만 순환하는지 확인해 보세요.
        </p>

        <button type="button" onClick={() => setIsOpen(true)}>
          데이터 입력 모달 열기
        </button>

        <DataEntryModal
          {...args}
          isOpen={isOpen}
          onClose={() => {
            args.onClose?.();
            setIsOpen(false);
          }}
          onSubmit={(data) => {
            args.onSubmit?.(data);
            setIsOpen(false);
          }}
        />
      </div>
    );
  },
};
