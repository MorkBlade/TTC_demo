// px2rem 指令（支持 ref、函数、watchEffect、简写对象），已移除 resize 监听
import { DirectiveBinding, watchEffect, isRef, App, unref } from 'vue';

type Px2RemStyle = Record<string, number | string>;
type StyleInput = Px2RemStyle | (() => Px2RemStyle);
type Px2RemOptions =
  | {
      styles?: StyleInput | any;
      designWidth?: number;
      baseFontSize?: number;
      unitPrecision?: number;
    }
  | Px2RemStyle; // 支持简写对象

const DEFAULT_CONFIG = {
  designWidth: 1920,
  baseFontSize: 16,
  unitPrecision: 5,
};

function toRem(value: number | string, baseFontSize: number, unitPrecision: number): string {
  const px = typeof value === 'string' ? parseFloat(value.replace(/px\s*$/, '').trim()) : value;
  const rem = px / baseFontSize;
  return `${parseFloat(rem.toFixed(unitPrecision))}rem`;
}

function camelToKebab(str: string) {
  return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function shouldConvertToRem(value: number | string): boolean {
  if (typeof value === 'number') return true;
  if (typeof value === 'string') {
    return /^\s*\d+(\.\d+)?(px)?\s*$/.test(value);
  }
  return false;
}

function applyStyles(el: HTMLElement, styles: Px2RemStyle, baseFontSize: number, unitPrecision: number) {
  for (const [prop, value] of Object.entries(styles)) {
    const cssProp = camelToKebab(prop);
    const finalValue = shouldConvertToRem(value) ? toRem(value, baseFontSize, unitPrecision) : value.toString();
    el.style.setProperty(cssProp, finalValue);
  }
}

const createPx2RemDirective = (globalConfig = DEFAULT_CONFIG) => ({
  mounted(el: HTMLElement, binding: DirectiveBinding<Px2RemOptions>) {
    let stopWatch: (() => void) | null = null;

    const isStyleOnly = binding.value && typeof binding.value === 'object' && !('styles' in binding.value);

    const merged = {
      ...globalConfig,
      ...(isStyleOnly ? { styles: binding.value } : binding.value || {}),
    };

    const resolveStyles = () => {
      const raw = (merged as { styles?: StyleInput }).styles ?? {};
      if (typeof raw === 'function') return raw();
      if (isRef(raw)) return unref(raw);
      return raw;
    };

    stopWatch = watchEffect(() => {
      const styleObj = resolveStyles();
      if (styleObj && typeof styleObj === 'object') {
        applyStyles(el, styleObj as Px2RemStyle, merged.baseFontSize, merged.unitPrecision);
      }
    });

    // eslint-disable-next-line no-underscore-dangle
    (el as any)._px2remCleanup = () => {
      stopWatch?.();
    };
  },

  unmounted(el: HTMLElement) {
    // eslint-disable-next-line no-underscore-dangle
    (el as any)._px2remCleanup?.();
  },
});

export default {
  install(app: App) {
    const directive = createPx2RemDirective({
      designWidth: 1920,
      baseFontSize: 16,
      unitPrecision: 5,
    });
    app.directive('px2rem', directive);
  },
};
