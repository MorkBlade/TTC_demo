export class FlipAnimation {
  private children: HTMLElement[];

  private delay: number;

  private isPlaying = false;

  constructor(children: HTMLElement[] | HTMLCollection, delay = 0.4) {
    this.children = Array.from(children) as HTMLElement[];
    this.delay = delay;
    this.calculatePositions();
  }

  private calculatePositions(property = 'first') {
    this.children.forEach((child) => {
      (child as any)[property] = child.getBoundingClientRect();
    });
  }

  play(): Promise<void> {
    if (this.isPlaying) {
      return Promise.resolve();
    }

    this.isPlaying = true;
    this.calculatePositions('last');

    return new Promise((resolve) => {
      let animationsCompleted = 0;
      const totalAnimations = this.children.length;

      const completeAnimation = () => {
        animationsCompleted++;
        if (animationsCompleted === totalAnimations) {
          this.isPlaying = false;
          this.calculatePositions();
          resolve();
        }
      };

      this.children.forEach((element) => {
        const { first } = element as any;
        const { last } = element as any;

        if (!first || !last) {
          completeAnimation();
          return;
        }

        const deltaX = first.x - last.x;
        const deltaY = first.y - last.y;

        // 只对真正移动的元素应用动画
        if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
          this.animateElement(element, deltaX, deltaY, completeAnimation);
        } else {
          completeAnimation();
        }
      });

      // 如果没有需要动画的元素，直接完成
      if (totalAnimations === 0) {
        this.isPlaying = false;
        resolve();
      }
    });
  }

  private animateElement(element: HTMLElement, deltaX: number, deltaY: number, onComplete: () => void) {
    // 使用 Web Animations API 替代 CSS transitions
    const animation = element.animate(
      [
        {
          transform: `translate(${deltaX}px, ${deltaY}px)`,
          offset: 0,
        },
        {
          transform: 'translate(0, 0)',
          offset: 1,
        },
      ],
      {
        duration: this.delay * 1000,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // ease-out
        fill: 'both',
      },
    );

    animation.addEventListener('finish', () => {
      // 清理动画
      animation.cancel();
      onComplete();
    });

    animation.addEventListener('cancel', () => {
      onComplete();
    });
  }

  // 取消所有正在进行的动画
  cancel() {
    this.children.forEach((child) => {
      const animations = child.getAnimations();
      animations.forEach((animation) => animation.cancel());
    });
    this.isPlaying = false;
  }

  // 检查是否支持 Web Animations API
  static isSupported(): boolean {
    return typeof Element !== 'undefined' && 'animate' in Element.prototype;
  }
}

// 如果不支持 Web Animations API 的降级版本
export class FlipAnimationFallback {
  private children: HTMLElement[];

  private delay: number;

  private isPlaying = false;

  constructor(children: HTMLElement[] | HTMLCollection, delay = 0.4) {
    this.children = Array.from(children) as HTMLElement[];
    this.delay = delay;
    this.calculatePositions();
  }

  private calculatePositions(property = 'first') {
    this.children.forEach((child) => {
      (child as any)[property] = child.getBoundingClientRect();
    });
  }

  play(): Promise<void> {
    if (this.isPlaying) {
      return Promise.resolve();
    }

    this.isPlaying = true;
    this.calculatePositions('last');

    return new Promise((resolve) => {
      let animationsCompleted = 0;
      const totalAnimations = this.children.length;

      const completeAnimation = () => {
        animationsCompleted++;
        if (animationsCompleted === totalAnimations) {
          this.isPlaying = false;
          this.calculatePositions();
          resolve();
        }
      };

      this.children.forEach((element) => {
        const { first } = element as any;
        const { last } = element as any;

        if (!first || !last) {
          completeAnimation();
          return;
        }

        const deltaX = first.x - last.x;
        const deltaY = first.y - last.y;

        if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
          this.animateElementFallback(element, deltaX, deltaY, completeAnimation);
        } else {
          completeAnimation();
        }
      });

      if (totalAnimations === 0) {
        this.isPlaying = false;
        resolve();
      }
    });
  }

  private animateElementFallback(element: HTMLElement, deltaX: number, deltaY: number, onComplete: () => void) {
    // Invert: 立即设置初始位置
    element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    element.style.transition = 'none';

    // 使用 requestAnimationFrame 替代 offsetHeight
    requestAnimationFrame(() => {
      // Play: 设置过渡并移动到最终位置
      element.style.transition = `transform ${this.delay}s cubic-bezier(0.4, 0.0, 0.2, 1)`;
      element.style.transform = 'translate(0, 0)';

      // 监听过渡结束
      const handleTransitionEnd = (e: TransitionEvent) => {
        if (e.target === element && e.propertyName === 'transform') {
          element.removeEventListener('transitionend', handleTransitionEnd);
          element.style.removeProperty('transition');
          element.style.removeProperty('transform');
          onComplete();
        }
      };

      element.addEventListener('transitionend', handleTransitionEnd);

      // 备用超时机制
      setTimeout(
        () => {
          element.removeEventListener('transitionend', handleTransitionEnd);
          element.style.removeProperty('transition');
          element.style.removeProperty('transform');
          onComplete();
        },
        this.delay * 1000 + 100,
      );
    });
  }

  cancel() {
    this.children.forEach((child) => {
      child.style.removeProperty('transition');
      child.style.removeProperty('transform');
    });
    this.isPlaying = false;
  }
}

// 工厂函数，自动选择最佳实现
export function createFlipAnimation(
  children: HTMLElement[] | HTMLCollection,
  delay = 0.4,
): FlipAnimation | FlipAnimationFallback {
  if (FlipAnimation.isSupported()) {
    return new FlipAnimation(children, delay);
  }
  return new FlipAnimationFallback(children, delay);
}
