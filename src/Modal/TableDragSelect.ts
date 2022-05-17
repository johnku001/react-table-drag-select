import { CSSProperties } from "react";

export interface Location {
  row: number;
  column: number;
}

export interface CellBasic {
  style?: CSSProperties;
  x?: number;
  y?: number;
  selected: boolean;
  disabled: boolean;
}
