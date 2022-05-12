import clone from "clone";
import clsx from "clsx";
import React, { useState, CSSProperties, useEffect } from "react";
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
  console.log("Table Render");

  const [startRow, setStartRow] = useState<number>();
  const [startColumn, setStartColumn] = useState<number>();
  const [endRow, setEndRow] = useState<number>();
  const [endColumn, setEndColumn] = useState<number>();
  const [lastRow, setLastRow] = useState<number>();
  const [lastColumn, setLastColumn] = useState<number>();
  const [isCurrentSelectMode, setIsCurrentSelectMode] = useState<boolean>();
  const [selectionStarted, setSelectionStarted] = useState<boolean>(false);

  const handleTouchStartCell = (e: any, location: Location) => {
    const isLeftClick = e.button === 0;
    const isTouch = e.type !== "mousedown";

    console.log("Table handleTouchStartCell e.type", e.type);
    console.log("Table handleTouchStartCell e.button", e.button);
    console.log(
      "Table handleTouchStartCell selectionStarted ",
      selectionStarted
    );

    console.log(
      "Table handleTouchStartCell !selectionStarted && (isLeftClick || isTouch",
      !selectionStarted && (isLeftClick || isTouch)
    );

    if (!selectionStarted && (isLeftClick || isTouch)) {
      e.preventDefault();
      const { row, column } = location;
      // onSelectionStart({ row, column });

      setStartRow(row);
      setStartColumn(column);
      setEndRow(row);
      setEndColumn(column);
      setIsCurrentSelectMode(!values[row][column].selected);
      setSelectionStarted(true);
      console.log(
        "Table handleTouchStartCell after calling selectionStarted ",
        selectionStarted
      );
    }

    console.log("======================");
  };

  const handleTouchMoveCell = (e: any, location: Location) => {
    // console.log("Table handleTouchMoveCell", e);
    if (selectionStarted) {
      e.preventDefault();
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

        if (nextRowCount <= maxRows) {
          setEndRow(row);
        }

        if (nextColumnCount <= maxColumns) {
          setEndColumn(column);
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
      selectionStarted
    );
    const isTouch = e.type !== "mousedown";

    console.log("Table handleTouchEndWindow isTouch ", isTouch);
    console.log("Table handleTouchEndWindow isLeftClick ", isLeftClick);
    if (selectionStarted && (isLeftClick || isTouch)) {
      console.log("Table handleTouchEndWindow", e);
      let tmpValue = clone(values);
      const minRow = Math.min(startRow ? startRow : 0, endRow ? endRow : 0);
      const maxRow = Math.max(startRow ? startRow : 0, endRow ? endRow : 0);
      for (let row = minRow; row <= maxRow; row++) {
        const minColumn = Math.min(
          startColumn ? startColumn : 0,
          endColumn ? endColumn : 0
        );
        const maxColumn = Math.max(
          startColumn ? startColumn : 0,
          endColumn ? endColumn : 0
        );
        for (let column = minColumn; column <= maxColumn; column++) {
          tmpValue[row][column].selected =
            !tmpValue[row][column].disabled && isCurrentSelectMode
              ? isCurrentSelectMode
              : false;
        }
      }
      setSelectionStarted(false);
      onChange(tmpValue);
    }
    console.log("----------------------");
  };

  const handleOnClick = (e: any, location: Location) => {
    const isLeftClick = e.button === 0;
    if (isLeftClick) {
      const { row, column } = location;
      if (!(row === lastRow && column === lastColumn)) {
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
        setLastColumn(column);
        setLastRow(row);

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
  const isCellBeingSelected = (row: number, column: number) => {
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
      selectionStarted &&
      row >= minRow &&
      row <= maxRow &&
      column >= minColumn &&
      column <= maxColumn &&
      multiSelect
    );
  };
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
              style={cell.style}
              displayText={`${renderCellText(cell)} (${index}, ${subindex})`}
              row={index}
              column={subindex}
              {...cell}
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
