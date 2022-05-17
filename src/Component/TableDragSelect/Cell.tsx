import clsx from "clsx";
import { CSSProperties } from "react";
import { Location } from "../../Modal";
export interface CellProps {
  disabled: boolean;
  beingSelected: boolean;
  selected: boolean;
  column: number;
  row: number;
  onTouchStart: (e: any, location: Location) => void;
  onTouchMove: (e: any, location: Location) => void;
  style?: CSSProperties;
  displayText: string;
}

export const Cell = ({
  disabled,
  beingSelected,
  selected,
  column,
  row,
  onTouchStart,
  onTouchMove,
  style,
  displayText,
}: CellProps) => {
  const handleTouchStart = (e: any) => {
    if (!disabled) {
      onTouchStart(e, { row, column });
    }
  };

  const handleTouchMove = (e: any) => {
    if (!disabled) {
      onTouchMove(e, { row, column });
    }
  };

  return (
    <td
      className={
        disabled
          ? "cell-disabled"
          : clsx(
              "cell-enabled",
              selected ? "cell-selected" : "",
              beingSelected ? "cell-being-selected" : ""
            )
      }
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      style={style}
    >
      {displayText}
    </td>
  );
};

export default Cell;
