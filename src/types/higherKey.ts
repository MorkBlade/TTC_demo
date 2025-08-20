export interface DksParamsSet {
  row: number;
  col: number;
  dks: number[];
  trps: number[];
  db: number;
  db2: number;
}

export interface MptParamsSet {
  row: number;
  col: number;
  dks: number[];
  dbs: number[];
}

export interface MtParamsSet {
  key: string;
  row: number;
  col: number;
  delay: number;
  dks: number[];
}

export interface TglParamsSet {
  key: string;
  row: number;
  col: number;
  kc: number[];
  delay: number;
}

export interface EndParamsSet {
  key: string;
  row: number;
  col: number;
  dks: number[];
  delay: number;
}

export interface SocdParamsSet {
  row: number;
  col: number;
  row2: number;
  col2: number;
  kcs: number[];
  mode: number;
  delay: number;
}

export interface RsParamsSet {
  row: number;
  col: number;
  row2: number;
  col2: number;
  kcs: number[];
  delay: number;
}

export interface DeleteHighLevelKeyParams {
  row: number;
  col: number;
}
export interface DksParamsGet {
  keyValue: number;
  data: { kcs: number[]; trps: number[]; dbs: number[] };
  row: number;
  col: number;
  mode: number;
}
export interface MptParamsGet {
  keyValue: number;
  data: { kcs: number[]; dbs: number[] };
  row: number;
  col: number;
  mode: number;
}
export interface MtParamsGet {
  keyValue: number;
  data: { time: number; kcs: number[] };
  row: number;
  col: number;
  mode: number;
}
export interface TgltParamsGet {
  keyValue: number;
  data: { kcs: number[]; time: number };
  row: number;
  col: number;
  mode: number;
}
export interface EndtParamsGet {
  keyValue: number;
  data: { kcs: number[]; delay: number };
  row: number;
  col: number;
  mode: number;
}
export interface SocdtParamsGet {
  keyValue: number;
  data: { row2: number; col2: number; socdMode: number; kcs: number[]; delay: number };
  row: number;
  col: number;
  mode: number;
}
export interface RstParamsGet {
  keyValue: number;
  data: { kcs: number[] };
  row: number;
  col: number;
  mode: number;
}
