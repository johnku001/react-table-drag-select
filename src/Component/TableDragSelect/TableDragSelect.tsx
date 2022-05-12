import clone from "clone";
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
  multiSelect: boolean;
  onSelectionStart?: ({ x, y }: { x: number; y: number }) => void;
  onInput?: () => void;
  onChange: (values: T[][]) => void;
  renderCellText: (value: T) => string;
}

export type TableDragSelectProps<T extends CellBasic> =
  TableDragSelectPropsBasic<T>;

const TableDragSelect = <T extends CellBasic>({
  values,
  maxRows = Infinity,
  maxColumns = Infinity,
  multiSelect,
  renderCellText,
  onSelectionStart,
  onInput,
  onChange,
}: TableDragSelectProps<T>): JSX.Element => {
  const startRow = useRef<number>();
  const startColumn = useRef<number>();
  const endRow = useRef<number>();
  const endColumn = useRef<number>();
  const lastRow = useRef<number>();
  const lastColumn = useRef<number>();

  const isCurrentSelectMode = useRef<boolean>();
  const selectionStarted = useRef<boolean>(false);

  const handleTouchStartCell = (e: any, location: Location) => {
    const isLeftClick = e.button === 0;
    const isTouch = e.type !== "mousedown";

    console.log("Table handleTouchStartCell e.type", e.type);
    console.log("Table handleTouchStartCell e.button", e.button);
    console.log(
      "Table handleTouchStartCell selectionStarted ",
      selectionStarted.current
    );

    console.log(
      "Table handleTouchStartCell !selectionStarted && (isLeftClick || isTouch",
      !selectionStarted.current && (isLeftClick || isTouch)
    );

    if (!selectionStarted.current && (isLeftClick || isTouch)) {
      e.preventDefault();
      const { row, column } = location;
      // onSelectionStart({ row, column });

      startRow.current = row;
      startColumn.current = column;
      endRow.current = row;
      endColumn.current = column;
      isCurrentSelectMode.current = !values[row][column].selected;
      selectionStarted.current = true;
      console.log(
        "Table handleTouchStartCell after calling selectionStarted ",
        selectionStarted.current
      );
    }

    console.log("======================");
  };

  const handleTouchMoveCell = (e: any, location: Location) => {
    // console.log("Table handleTouchMoveCell", e);
    if (selectionStarted.current) {
      e.preventDefault();
      const { row, column } = location;

      if (endRow.current !== row || endColumn.current !== column) {
        const nextRowCount =
          startRow.current === undefined && endRow.current === undefined
            ? 0
            : Math.abs(row - (startRow.current ? startRow.current : 0)) + 1;
        const nextColumnCount =
          startColumn.current === undefined && endColumn === undefined
            ? 0
            : Math.abs(
                column - (startColumn.current ? startColumn.current : 0)
              ) + 1;

        if (nextRowCount <= maxRows) {
          endRow.current = row;
        }

        if (nextColumnCount <= maxColumns) {
          endColumn.current = column;
        }
      }
    }
  };

  const handleTouchEndWindow = (e: any) => {
    const isLeftClick = e.button === 0;
    console.log("Table handleTouchEndWindow e.type", e.type);
    console.log("Table handleTouchEndWindow e.button", e.button);
    console.log(
      "Table handleTouchEndWindow selectionStarted ",
      selectionStarted.current
    );
    const isTouch = e.type !== "mousedown";

    console.log("Table handleTouchEndWindow isTouch ", isTouch);
    console.log("Table handleTouchEndWindow isLeftClick ", isLeftClick);
    if (selectionStarted.current && (isLeftClick || isTouch)) {
      console.log("Table handleTouchEndWindow", e);
      let tmpValue = clone(values);
      const minRow = Math.min(
        startRow.current ? startRow.current : 0,
        endRow.current ? endRow.current : 0
      );
      const maxRow = Math.max(
        startRow.current ? startRow.current : 0,
        endRow.current ? endRow.current : 0
      );
      for (let row = minRow; row <= maxRow; row++) {
        const minColumn = Math.min(
          startColumn.current ? startColumn.current : 0,
          endColumn.current ? endColumn.current : 0
        );
        const maxColumn = Math.max(
          startColumn.current ? startColumn.current : 0,
          endColumn.current ? endColumn.current : 0
        );
        console.log("isCurrentSelectMode", isCurrentSelectMode.current);
        for (let column = minColumn; column <= maxColumn; column++) {
          tmpValue[row][column].selected =
            !tmpValue[row][column].disabled && isCurrentSelectMode.current
              ? isCurrentSelectMode.current
              : false;
        }
      }
      selectionStarted.current = false;
      onChange(tmpValue);
    }
    console.log("----------------------");
  };

  const handleOnClick = (e: any, location: Location) => {
    const isLeftClick = e.button === 0;
    if (isLeftClick) {
      const { row, column } = location;
      if (!(row === lastRow.current && column === lastColumn.current)) {
        let tmpValue = clone(values);
        values.map((row: T[], index: number) => {
          return row.map(
            (cell, subindex) => (values[index][subindex].selected = false)
          );
        });

        if (!tmpValue[row][column].disabled) {
          tmpValue[row][column].selected = true;
        }
        onChange(values);
        lastColumn.current = column;
        lastRow.current = row;

        // console.log('isLeftClick ', isLeftClick);
        // console.log('row ', row);
        // console.log('column ', column);
        // console.log('============ ');
      }
    }
  };

  useEffect(() => {
    if (multiSelect) {
      window.addEventListener("mouseup", handleTouchEndWindow);
      window.addEventListener("touchend", handleTouchEndWindow);
    }
    return () => {
      if (multiSelect) {
        window.removeEventListener("mouseup", handleTouchEndWindow);
        window.removeEventListener("touchend", handleTouchEndWindow);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCellBeingSelected = useCallback(
    (row: number, column: number) => {
      const minRow = Math.min(
        startRow.current ? startRow.current : 0,
        endRow.current ? endRow.current : 0
      );
      const maxRow = Math.max(
        startRow.current ? startRow.current : 0,
        endRow.current ? endRow.current : 0
      );
      const minColumn = Math.min(
        startColumn.current ? startColumn.current : 0,
        endColumn.current ? endColumn.current : 0
      );
      const maxColumn = Math.max(
        startColumn.current ? startColumn.current : 0,
        endColumn.current ? endColumn.current : 0
      );
      console.log(
        "isCellBeingSelected ",
        "row = ",
        row,
        " column = ",
        column,
        selectionStarted.current &&
          row >= minRow &&
          row <= maxRow &&
          column >= minColumn &&
          column <= maxColumn &&
          multiSelect
      );
      return (
        selectionStarted.current &&
        row >= minRow &&
        row <= maxRow &&
        column >= minColumn &&
        column <= maxColumn &&
        multiSelect
      );
    },
    [startRow, startColumn, endRow, endColumn, multiSelect, selectionStarted]
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
              onClick={handleOnClick}
              beingSelected={isCellBeingSelected(index, subindex)}
              multiSelect={multiSelect}
              selected={cell.selected}
              disabled={cell.disabled}
              style={cell.style}
              displayText={`${renderCellText(cell)} (${index}, ${subindex})`}
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
// Takes a mouse or touch event and returns the corresponding row and cell.
// Example:
//
// eventToCellLocation(event);
// {row: 2, column: 3}
export interface CellProps {
  disabled: boolean;
  beingSelected: boolean;
  selected: boolean;
  column: number;
  row: number;
  onTouchStart: (e: any, location: Location) => void;
  onTouchMove: (e: any, location: Location) => void;
  onClick: (e: any, location: Location) => void;
  multiSelect: boolean;
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
  onClick,
  multiSelect,
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
              multiSelect ? "cell-enabled" : "cell-enabled-single",
              selected ? "cell-selected" : "",
              beingSelected ? "cell-being-selected" : ""
            )
      }
      onMouseDown={multiSelect ? handleTouchStart : undefined}
      onMouseMove={multiSelect ? handleTouchMove : undefined}
      onClick={multiSelect ? undefined : (e) => onClick(e, { row, column })}
      style={style}
    >
      {displayText}
    </td>
  );
};
