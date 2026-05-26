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

#### Hook API

`useFocusTrap(containerRef, isActive, options)`

- `containerRef`: trap 경계를 나타내는 루트 요소 ref
- `isActive`: trap 활성/비활성 상태
- `options.initialFocusRef`: 열리자마자 우선 포커스를 줄 대상(선택)
- `options.restoreFocus` (default: `true`): 닫힐 때 오픈 직전 포커스 복원 여부

#### Focus Algorithm (설계 의도)

1. 활성화 시 현재 `document.activeElement`를 저장해 종료 시점에 복원합니다.
2. `container`에 `tabindex="-1"` fallback을 보장해 내부 focusable이 없어도 trap이 깨지지 않게 합니다.
3. 초기 포커스 우선순위:
   - `initialFocusRef`가 유효하면 해당 요소
   - 아니면 첫 번째 focusable 요소
   - 없으면 container 자체
4. `keydown(Tab)`을 capture 단계에서 가로채 first/last 경계를 순환시킵니다.
5. `focusin`을 capture 단계에서 감시해 포커스가 외부로 튀면 내부 첫 요소로 즉시 복귀시킵니다.
6. cleanup에서 리스너를 제거하고(`restoreFocus=true`이면) 오픈 전 포커스로 복원합니다.

#### Focusable 판별 규칙

`useFocusTrap`은 단순 selector 매칭 외에 실제 포커스 가능 여부를 필터링합니다.

- 제외: `disabled`, `aria-hidden="true"`, `inert` 내부 요소
- 제외: `display: none`, `visibility: hidden`
- 브라우저 차이(Safari/Chrome)를 줄이기 위해 `offset*`와 `getClientRects()`를 함께 확인

#### Why Capture + `focusin`?

- `keydown` capture: 브라우저별 이벤트 전파 타이밍 차이에서도 Tab 순환 제어를 안정화
- `focusin` capture: 키보드뿐 아니라 스크립트/마우스 클릭으로 생기는 외부 포커스까지 차단

#### Limitations / Trade-offs

- 복잡한 Shadow DOM 경계를 완전하게 다루지는 않습니다.
- `iframe` 간 포커스 이동은 문서 경계 특성상 별도 정책이 필요합니다.
- 중첩 모달 스택 관리는 현재 범위 밖이며, 필요 시 stack manager를 추가해야 합니다.

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

## Accessibility & Storybook Status

- WAI-ARIA 적용:
  - `DataEntryModal`: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, close 버튼 `aria-label`
- Storybook autodocs:
  - `DataEntryModal.stories.tsx`: `tags: ["autodocs"]`
  - `GroupAndVisitWorkspace.stories.tsx`: `tags: ["autodocs"]`
