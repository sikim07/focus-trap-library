import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeValueModal } from './CodeValueModal';

const meta = {
  title: 'Components/CodeValueModal',
  component: CodeValueModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '코드값 입력 모달 예시입니다. Add Value는 각 행 Action 셀에서 삭제 버튼 왼쪽에 배치되어, 탭 이동 후 빠르게 행을 추가할 수 있습니다.',
      },
    },
  },
  argTypes: {
    isOpen: {
      control: false,
      description: '스토리 내부 상태로 열림/닫힘을 제어합니다.',
    },
    onClose: {
      action: 'onClose',
      description: '오버레이 클릭, ESC, Close 버튼에서 호출됩니다.',
    },
    onSubmit: {
      action: 'onSubmit',
      description: 'Add 버튼 클릭 시 모달 payload와 함께 호출됩니다.',
    },
  },
} satisfies Meta<typeof CodeValueModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  args: {
    title: 'Add Code',
    isOpen: false,
    onClose: () => {},
    onSubmit: () => {},
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#e8f0f4',
          padding: 24,
        }}
      >
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Code Value Modal Demo</h3>
        <p style={{ color: '#334155', lineHeight: 1.6 }}>
          버튼을 눌러 모달을 열고, 각 행의 Action에서{' '}
          <strong>+ Add Value -&gt; - Delete</strong> 흐름을 확인하세요.
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            height: 38,
            border: '1px solid #0f766e',
            borderRadius: 8,
            background: '#0f766e',
            color: '#fff',
            fontWeight: 700,
            padding: '0 14px',
            cursor: 'pointer',
          }}
        >
          Add Code 모달 열기
        </button>

        <CodeValueModal
          {...args}
          isOpen={isOpen}
          onClose={() => {
            args.onClose?.();
            setIsOpen(false);
          }}
          onSubmit={(payload) => {
            args.onSubmit?.(payload);
            setIsOpen(false);
          }}
        />
      </div>
    );
  },
};
