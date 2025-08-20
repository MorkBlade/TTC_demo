import type { SlecltOptions } from '@/types/interface';

export * from './color';

export const getValueByName = (options: SlecltOptions[], name: string) => {
  return options.find((item) => item.name === name)?.value;
};
