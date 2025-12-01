import { useEffect } from "react";

/**
 * Announces content to screen readers
 */
export function useAnnounce() {
  const announce = (
    message: string,
    priority: "polite" | "assertive" = "polite"
  ) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announce };
}

/**
 * Focus management for modals and dialogs
 */
export function useFocusTrap(
  isOpen: boolean,
  containerRef: React.RefObject<HTMLElement>
) {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        container.dispatchEvent(new Event("close"));
      }
    };

    firstElement?.focus();

    container.addEventListener("keydown", handleTabKey as EventListener);
    container.addEventListener("keydown", handleEscapeKey as EventListener);

    return () => {
      container.removeEventListener("keydown", handleTabKey as EventListener);
      container.removeEventListener(
        "keydown",
        handleEscapeKey as EventListener
      );
    };
  }, [isOpen, containerRef]);
}

/**
 * Keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  }
) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const matchesKey = e.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = modifiers?.ctrl ? e.ctrlKey : !e.ctrlKey;
      const matchesShift = modifiers?.shift ? e.shiftKey : !e.shiftKey;
      const matchesAlt = modifiers?.alt ? e.altKey : !e.altKey;
      const matchesMeta = modifiers?.meta ? e.metaKey : !e.metaKey;

      if (
        matchesKey &&
        matchesCtrl &&
        matchesShift &&
        matchesAlt &&
        matchesMeta
      ) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [key, callback, modifiers]);
}

/**
 * Skip to content link for keyboard navigation
 */
export function useSkipToContent() {
  useEffect(() => {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.textContent = "Skip to main content";
    skipLink.className =
      "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded";

    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
    };
  }, []);
}

/**
 * Check if user prefers reduced motion
 */
export function usePrefersReducedMotion() {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return prefersReducedMotion;
}
