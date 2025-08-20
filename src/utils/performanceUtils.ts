// 性能监控工具
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;

  private measurements: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string) {
    this.measurements.set(name, performance.now());
  }

  endMeasure(name: string): number {
    const startTime = this.measurements.get(name);
    if (startTime === undefined) {
      console.warn(`No start time found for measurement: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(name);

    if (duration > 16) {
      // 超过一帧的时间
      console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    return fn().finally(() => {
      this.endMeasure(name);
    });
  }
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 检查是否支持某个CSS属性
export function supportsCSSProperty(property: string): boolean {
  return property in document.documentElement.style;
}

// 检查是否支持Web Animations API
export function supportsWebAnimations(): boolean {
  return typeof Element !== 'undefined' && 'animate' in Element.prototype;
}
