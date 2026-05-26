# Focus Trap Library PoC

CRO B2B 웹 애플리케이션의 데이터 입력 오류(포커스 이탈, 미스 클릭, 모달 외부 키보드 접근)를 줄이기 위한
독립형 UI 컴포넌트 라이브러리 PoC입니다.

프로젝트의 목표는 기존 메인 서비스의 대규모 리팩토링 없이, 안전한 입력 컴포넌트를 부분 이식해
실무 적용 가능성과 기술 완성도를 검증하는 것입니다.

## Problem Statement

- 운영팀이 대량의 임상 데이터를 빠르게 입력하는 과정에서 포커스 이탈로 인한 휴먼 에러가 발생
- 레거시 구조상 전면 개편은 어렵고, 단위 컴포넌트 단위로 위험 구간을 우선 개선 필요
- 따라서 웹 표준(WAI-ARIA)과 키보드 접근성을 기준으로 재사용 가능한 모달 입력 컴포넌트를 검증

## Tech Stack

- Package Manager: `pnpm`
- Runtime / Build: `Vite + React + TypeScript`
- Docs / UI Test: `Storybook` + `@storybook/addon-a11y`

## Implemented Scope

### 1) `useFocusTrap` Hook

- 외부 라이브러리 없이 Web API + React Hook으로 구현
- `Tab` / `Shift + Tab` 순환 제어
- 모달 활성화 시 초기 포커스 이동
- 모달 닫힘 시 이전 포커스 복원
- `focusin` 캡처로 모달 외부 포커스 이탈 방어

### 2) `DataEntryModal` Component

- `role="dialog"` + `aria-modal="true"`
- `aria-labelledby`와 제목 `id` 연결
- `label htmlFor` ↔ `input id` 매핑으로 접근성 네이밍 보장
- 임상 데이터 입력 폼(피험자 ID, 방문 코드, 수축기 혈압) 예시 포함

### 3) Storybook Story

- `autodocs` 활성화
- 인터랙티브 스토리에서 직접 모달 열기/닫기 및 키보드 순환 테스트 가능

## Project Structure

```text
src/
  hooks/
    useFocusTrap.ts
  components/
    DataEntryModal.tsx
    DataEntryModal.css
    DataEntryModal.stories.tsx
```

## Quick Start

```bash
pnpm install
pnpm dev
```

Storybook 실행:

```bash
pnpm storybook
```

## Manual Verification (Current)

1. 모달 열기 버튼 클릭
2. `Tab` 반복 입력 시 마지막 요소에서 첫 요소로 순환되는지 확인
3. `Shift + Tab` 입력 시 첫 요소에서 마지막 요소로 순환되는지 확인
4. 모달 밖 요소로 포커스가 나가지 않는지 확인
5. 모달 닫은 후 오픈 전 포커스 위치로 복귀하는지 확인
