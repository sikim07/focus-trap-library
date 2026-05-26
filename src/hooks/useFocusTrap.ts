import { type RefObject, useEffect, useRef } from "react";

type FocusTrapOptions = {
  /**
   * 모달이 열리자마자 특정 필드에 커서를 두고 싶을 때 사용합니다.
   * 지정하지 않으면 첫 번째 포커스 가능한 요소로 이동합니다.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /**
   * 모달이 닫힐 때 원래 작업하던 위치로 돌아가도록 보장합니다.
   * 데이터 입력 흐름이 끊기지 않도록 기본값을 true로 둡니다.
   */
  restoreFocus?: boolean;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const isActuallyFocusable = (element: HTMLElement): boolean => {
  if (
    element.hasAttribute("disabled") ||
    element.getAttribute("aria-hidden") === "true"
  ) {
    return false;
  }

  // inert 컨테이너 내부 요소는 브라우저 표준상 비활성 영역이므로 제외합니다.
  if (element.closest("[inert]")) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }

  // Safari/Chrome에서 offset 계산이 다를 수 있어 getClientRects를 함께 확인합니다.
  return (
    element.offsetWidth > 0 ||
    element.offsetHeight > 0 ||
    element.getClientRects().length > 0
  );
};

const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
  return candidates.filter(isActuallyFocusable);
};

export const useFocusTrap = (
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean,
  options: FocusTrapOptions = {},
): void => {
  const { initialFocusRef, restoreFocus = true } = options;
  const previousFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    // 모달 오픈 직전 포커스를 저장해 두면 닫을 때 입력 컨텍스트를 복원할 수 있습니다.
    previousFocusedRef.current = document.activeElement as HTMLElement | null;

    // 내부에 포커스 가능한 요소가 없을 때도 trap이 깨지지 않도록 fallback 포커스를 제공합니다.
    if (!container.hasAttribute("tabindex")) {
      container.setAttribute("tabindex", "-1");
    }

    const focusEntryPoint = (): void => {
      const preferredTarget = initialFocusRef?.current;
      if (
        preferredTarget &&
        container.contains(preferredTarget) &&
        isActuallyFocusable(preferredTarget)
      ) {
        preferredTarget.focus();
        return;
      }

      const focusables = getFocusableElements(container);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        container.focus();
      }
    };

    // 마운트 직후 레이아웃 확정 타이밍을 맞춰 안정적으로 초기 포커스를 이동합니다.
    const rafId = window.requestAnimationFrame(focusEntryPoint);

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Tab") {
        return;
      }

      const currentContainer = containerRef.current;
      if (!currentContainer) {
        return;
      }

      const focusables = getFocusableElements(currentContainer);
      if (focusables.length === 0) {
        event.preventDefault();
        currentContainer.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      // 포커스가 바깥으로 튄 경우에도 trap 경계로 즉시 되돌려 데이터 오입력을 예방합니다.
      if (!activeElement || !currentContainer.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleFocusIn = (event: FocusEvent): void => {
      const currentContainer = containerRef.current;
      if (!currentContainer) {
        return;
      }

      const target = event.target as Node | null;
      if (target && currentContainer.contains(target)) {
        return;
      }

      // 스크립트/마우스 클릭 등으로 바깥 포커스가 발생해도 모달 내부로 강제 복귀시킵니다.
      const focusables = getFocusableElements(currentContainer);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        currentContainer.focus();
      }
    };

    // capture 단계에서 먼저 개입해 브라우저별 전파 타이밍 차이를 줄입니다.
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", handleFocusIn, true);

      if (restoreFocus && previousFocusedRef.current?.isConnected) {
        previousFocusedRef.current.focus();
      }
    };
  }, [containerRef, initialFocusRef, isActive, restoreFocus]);
};
