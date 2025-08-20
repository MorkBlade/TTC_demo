export interface MacroAction {
  status: number; // 1按下 0松开
  delay: number; // 延时（最大 32767）
  keyCode: number; // 键码（最大 0xFFFF）
}

export interface MacroItem {
  name?: string;
  macroId: number;
  mode: number;
  valid: number | boolean;
  actNum: number;
  repNum: number;
  data?: MacroAction[];
}

export interface MacroDataParams {
  macroId: number;
  offset: number;
}
export interface MacroDataSetParams {
  macroId: number;
  actions: MacroAction[];
  offset?: number;
}

export interface MacroDataGetParams {
  macroId: number;
  macros: MacroAction[];
  offset?: number;
}

export interface MacroState {
  macroData: MacroItem[];
  currentMacroNum: number;
}

export interface MacroRecord {
  keyCode: number;
  status: 0 | 1; // 0: up, 1: down
  delay: number;
}

export interface MacroData {
  data: MacroRecord[];
}

export interface EditState {
  isEditing: boolean;
  editingIndex: number | null;
  editingKey: string | number;
  editingDirection: 0 | 1;
  editingTime: number;
}

export interface DragState {
  isDragging: boolean;
  draggedIndex: number | null;
  dragElement: HTMLElement | null;
}

export interface HoverState {
  enterItem: number;
  enterState: number;
}

export interface EditingRecord {
  keyCode: string | number;
  status: 0 | 1;
  delay: number;
}
