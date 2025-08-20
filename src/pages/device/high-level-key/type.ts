export type AdvancedKeyType = 'dks' | 'mpt' | 'socd' | 'mt' | 'tgl' | 'end';

export interface KeyConfig {
  title: string;
  description: string;
  features: string[];
  tip: string;
}
