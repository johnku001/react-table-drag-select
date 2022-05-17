import clsx from "clsx";
import React, {
  useState,
  CSSProperties,
  useEffect,
  useRef,
  useCallback,
} from "react";

import "./TableDragSelect.scss";

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
export interface TableDragSelectPropsBasic<T extends CellBasic> {
  values: T[][];
  maxRows?: number;
  maxColumns?: number;
  setNumberOfSelectedCells?: (numberOfSelectedCells: number) => void;
  onSelectionStart?: ({ x, y }: { x: number; y: number }) => void;
  onInput?: () => void;
  onChange: (values: T[][]) => void;
  renderCellText: (value: T) => string;
}

export type TableDragSelectProps<T extends CellBasic> =
  TableDragSelectPropsBasic<T>;

const TableDragSelect = <T extends CellBasic>({
  values,
  maxRows,
  maxColumns,
  renderCellText,
  onSelectionStart,
  onInput,
  onChange,
}: TableDragSelectProps<T>): JSX.Element => {
  console.log("TableDragSelectProps render");
  const [startRow, setStartRow] = useState<number>();
  const [startColumn, seStartColumn] = useState<number>();
  const [endRow, setEndRow] = useState<number>();
  const [endColumn, setEndColumn] = useState<number>();
  const startRowRef = useRef<number>();
  const startColumnRef = useRef<number>();
  const endRowRef = useRef<number>();
  const endColumnRef = useRef<number>();

  const isSelecting = useRef<boolean>(false);
  const isShiftPressing = useRef<boolean>(false);
  const isSelectedStartCellSelected = useRef<boolean>(false);

  const handleTouchStartCell = (e: any, location: Location) => {
    // console.log("======================");
    const isLeftClick = e.button === 0;
    const isTouch = e.type !== "mousedown";
    isShiftPressing.current = e.shiftKey;
    if (!isSelecting.current && (isLeftClick || isTouch)) {
      e.preventDefault();
      const { row, column } = location;
      // console.log("handleTouchStartCell location", location);
      isSelectedStartCellSelected.current = values[row][column].selected;
      startRowRef.current = row;
      startColumnRef.current = column;
      endRowRef.current = row;
      endColumnRef.current = column;
      setStartRow(row);
      seStartColumn(column);
      setEndRow(row);
      setEndColumn(column);
      isSelecting.current = true;
    }

    // console.log("======================");
  };

  const handleTouchMoveCell = (e: any, location: Location) => {
    if (isSelecting.current) {
      // console.log("handleTouchMoveCell e", e);
      e.preventDefault();
      isShiftPressing.current = e.shiftKey;
      const { row, column } = location;
      if (endRow !== row || endColumn !== column) {
        const nextRowCount =
          startRow === undefined && endRow === undefined
            ? 0
            : Math.abs(row - (startRow ? startRow : 0)) + 1;
        const nextColumnCount =
          startColumn === undefined && endColumn === undefined
            ? 0
            : Math.abs(column - (startColumn ? startColumn : 0)) + 1;

        if (!maxRows || nextRowCount <= maxRows) {
          endRowRef.current = row;
          setEndRow(row);
        }

        if (!maxColumns || nextColumnCount <= maxColumns) {
          endColumnRef.current = column;
          setEndColumn(column);
        }
      }
    }
  };

  const handleTouchEndWindow = (e: any) => {
    const isLeftClick = e.button === 0;
    const isTouch = e.type !== "mousedown";
    // console.log("----------------------");
    // console.log("Table handleTouchEndWindow e ", e);

    if (isSelecting.current && (isLeftClick || isTouch)) {
      let tmpValue = [...values];
      const minRow = Math.min(
        startRowRef.current ? startRowRef.current : 0,
        endRowRef.current ? endRowRef.current : 0
      );
      const maxRow = Math.max(
        startRowRef.current ? startRowRef.current : 0,
        endRowRef.current ? endRowRef.current : 0
      );
      const minColumn = Math.min(
        startColumnRef.current ? startColumnRef.current : 0,
        endColumnRef.current ? endColumnRef.current : 0
      );
      const maxColumn = Math.max(
        startColumnRef.current ? startColumnRef.current : 0,
        endColumnRef.current ? endColumnRef.current : 0
      );

      // for (let row = minRow; row <= maxRow; row++) {
      //   for (let column = minColumn; column <= maxColumn; column++) {
      //     tmpValue[row][column].selected = !tmpValue[row][column].disabled
      //       ? true
      //       : false;
      //   }
      // }
      for (let row = 0; row < tmpValue.length; row++) {
        for (let column = 0; column < tmpValue[row].length; column++) {
          tmpValue[row][column].selected =
            !tmpValue[row][column].disabled &&
            row <= maxRow &&
            column <= maxColumn &&
            row >= minRow &&
            column >= minColumn
              ? !isSelectedStartCellSelected.current
              : isShiftPressing.current
              ? values[row][column].selected
              : false;
        }
      }
      // console.log("handleTouchEndWindow tmpValue", tmpValue);
      // console.log("----------------------");
      isSelecting.current = false;
      onChange(tmpValue);
    }
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleTouchEndWindow);
    window.addEventListener("touchend", handleTouchEndWindow);

    return () => {
      window.removeEventListener("mouseup", handleTouchEndWindow);
      window.removeEventListener("touchend", handleTouchEndWindow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCellBeingSelected = useCallback(
    (row: number, column: number) => {
      const minRow = Math.min(startRow ? startRow : 0, endRow ? endRow : 0);
      const maxRow = Math.max(startRow ? startRow : 0, endRow ? endRow : 0);
      const minColumn = Math.min(
        startColumn ? startColumn : 0,
        endColumn ? endColumn : 0
      );
      const maxColumn = Math.max(
        startColumn ? startColumn : 0,
        endColumn ? endColumn : 0
      );

      return (
        isSelecting.current &&
        row >= minRow &&
        row <= maxRow &&
        column >= minColumn &&
        column <= maxColumn
      );
    },
    [startRow, startColumn, endRow, endColumn]
  );
  const renderRows = () => (
    <>
      {values.map((row, index) => (
        <tr key={index}>
          {row.map((cell, subindex) => (
            <Cell
              key={subindex}
              onTouchStart={handleTouchStartCell}
              onTouchMove={handleTouchMoveCell}
              beingSelected={isCellBeingSelected(index, subindex)}
              selected={cell.selected}
              disabled={cell.disabled}
              style={cell.style}
              displayText={`${renderCellText(cell)}`}
              row={index}
              column={subindex}
            />
          ))}
        </tr>
      ))}
    </>
  );

  return (
    <table className="table-drag-select">
      <tbody>{renderRows()}</tbody>
    </table>
  );
};

export default TableDragSelect;

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
