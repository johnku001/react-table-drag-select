import {
  useState,
  useEffect,
  useRef,
  useCallback,
  MouseEventHandler,
} from "react";
import { CellBasic, Location } from "../../Modal";
import { Cell } from "./Cell";
import "./TableDragSelect.scss";

export interface TableDragSelectPropsBasic<T extends CellBasic> {
  values: T[][];
  maxRows?: number;
  maxColumns?: number;
  setNumberOfSelectedCells?: (numberOfSelectedCells: number) => void;
  onSelectionStart?: MouseEventHandler<any> | undefined;
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
    const isLeftClick = e.button === 0;
    const isTouch = e.type !== "mousedown";
    isShiftPressing.current = e.shiftKey;
    if (!isSelecting.current && (isLeftClick || isTouch)) {
      e.preventDefault();
      const { row, column } = location;
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
    if (onSelectionStart) {
      onSelectionStart(e);
    }
  };

  const handleTouchMoveCell = (e: any, location: Location) => {
    if (isSelecting.current) {
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
