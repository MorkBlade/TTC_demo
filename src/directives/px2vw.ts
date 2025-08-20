import { DirectiveBinding, watchEffect, isRef, App } from 'vue';

type Px2VWOptions = {
  styles: Record<string, number | string> | any; // 允许是 ref
  designWidth?: number;
  unitPrecision?: number;
  watchResize?: boolean;
};

const DEFAULT_CONFIG = {
  designWidth: 1920,
  unitPrecision: 5,
  watchResize: true,
};

function toVW(value: number | string, designWidth: number, unitPrecision: number): string {
  const px = typeof value === 'string' ? parseFloat(value.replace(/px\s*$/, '').trim()) : value;

  const vw = (px / designWidth) * 100;
  return `${parseFloat(vw.toFixed(unitPrecision))}vw`;
}

function camelToKebab(str: string) {
  return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function shouldConvertToVW(value: number | string): boolean {
  if (typeof value === 'number') return true;
  if (typeof value === 'string') {
    return /^\s*\d+(\.\d+)?(px)?\s*$/.test(value);
  }
  return false;
}

function applyStyles(
  el: HTMLElement,
  styles: Record<string, number | string>,
  designWidth: number,
  unitPrecision: number,
) {
  for (const [prop, value] of Object.entries(styles)) {
    const cssProp = camelToKebab(prop);
    const finalValue = shouldConvertToVW(value) ? toVW(value, designWidth, unitPrecision) : value.toString();

    el.style.setProperty(cssProp, finalValue);
  }
}

const createPx2VWDirective = (globalConfig = DEFAULT_CONFIG) => ({
  mounted(el: HTMLElement, binding: DirectiveBinding<Px2VWOptions>) {
    let stopWatch: (() => void) | null = null;
    let resizeHandler: (() => void) | null = null;

    const merged = {
      ...globalConfig,
      ...(binding.value || {}),
    };

    const update = () => {
      const styleObj = isRef(merged.styles) ? merged.styles.value : merged.styles;
      if (styleObj && typeof styleObj === 'object') {
        applyStyles(el, styleObj, merged.designWidth, merged.unitPrecision);
      }
    };

    if (typeof merged.styles === 'function') {
      stopWatch = watchEffect(() => {
        const resolved = merged.styles();
        if (resolved && typeof resolved === 'object') {
          applyStyles(el, resolved, merged.designWidth, merged.unitPrecision);
        }
      });
    }

    if (merged.watchResize) {
      resizeHandler = () => update();
      window.addEventListener('resize', resizeHandler);
    }

    // eslint-disable-next-line no-underscore-dangle
    (el as any)._px2vwCleanup = () => {
      stopWatch?.();
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
    };
  },

  unmounted(el: HTMLElement) {
    // eslint-disable-next-line no-underscore-dangle
    (el as any)._px2vwCleanup?.();
  },
});

export default {
  install(app: App) {
    const directive = createPx2VWDirective({
      designWidth: 1920,
      unitPrecision: 5,
      watchResize: true,
    });
    app.directive('px2vw', directive);
  },
};
