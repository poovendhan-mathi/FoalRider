import { useEffect, useRef, useState } from "react";

/**
 * Monitor component render performance
 */
export function useRenderPerformance(
  componentName: string,
  enabled = process.env.NODE_ENV === "development"
) {
  const renderCount = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (renderTime > 16) {
      // Slower than 60fps
      console.warn(
        `[Performance] ${componentName} took ${renderTime.toFixed(
          2
        )}ms to render (render #${renderCount.current})`
      );
    }
  });

  startTime.current = performance.now();

  return {
    renderCount: renderCount.current,
  };
}

/**
 * Debounce function calls for performance
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle function calls for performance
 */
export function useThrottle<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRan = useRef<number>(0);

  useEffect(() => {
    lastRan.current = Date.now();
  }, []);

  const throttledCallback = (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const elapsed = Date.now() - lastRan.current;

    if (elapsed >= delay) {
      callback(...args);
      lastRan.current = Date.now();
    } else {
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRan.current = Date.now();
      }, delay - elapsed);
    }
  };

  return throttledCallback;
}

/**
 * Measure Web Vitals
 */
export function useWebVitals() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Measure First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (
          entry.entryType === "paint" &&
          entry.name === "first-contentful-paint"
        ) {
          console.log(`[Web Vitals] FCP: ${entry.startTime.toFixed(2)}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ["paint"] });

    // Measure Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`[Web Vitals] LCP: ${lastEntry.startTime.toFixed(2)}ms`);
    });

    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
    };
  }, []);
}

/**
 * Lazy load images with Intersection Observer
 */
export function useLazyLoad(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          }
          observer.unobserve(img);
        }
      });
    }, options);

    const images = ref.current.querySelectorAll("img[data-src]");
    images.forEach((img) => observer.observe(img));

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);
}
