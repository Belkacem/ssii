import React, { FunctionComponent, ReactNode, RefObject, useRef, useState, useEffect } from 'react';
import './timesheet.scss';
import { Button } from 'antd';
import { TimesheetCell, ITimesheetCellProps } from './timesheet-cell';
import moment, { Moment } from 'moment';

export interface ITimesheetRowProps {
  editable?: boolean;
  showWeekends?: boolean;
  toggleWeekends?: () => void;
  rowIndex?: number | string;
  title?: String | ReactNode;
  cells?: ITimesheetCellProps[];
  total?: number;
  mode?: boolean | string;
  onSelectionChange?: (cells: any[], selectionInterval: ISelectionInterval, fill?: boolean, forceFill?: boolean) => void;
  updating?: boolean;
}

export interface ISelectionInterval {
  start?: Moment;
  startHalfDay?: boolean;
  end?: Moment;
  endHalfDay?: boolean;
}

export const TimesheetRow: FunctionComponent<ITimesheetRowProps> = props => {
  const [selectionStart, setSelectionStart] = useState(null);
  const [selection, setSelection] = useState(null);
  const [rowCells, setRowCells] = useState(props.cells);
  const [cellLoading, setCellLoading] = useState([]);
  const { updating } = props;

  useEffect(
    () => {
      setLoading(props.cells);
    },
    [props.cells]
  );

  useEffect(
    () => {
      if (!!selectionStart) {
        setSelection({
          fill: selectionStart.fill,
          start: selectionStart.date,
          startHalfDay: !selectionStart.morning,
          end: selectionStart.date,
          endHalfDay: selectionStart.morning
        });
      }
    },
    [selectionStart]
  );

  useEffect(
    () => {
      if (!!selection) {
        const dayStart = moment(selection.start);
        const dayEnd = moment(selection.end);
        const changedRowCells = [...rowCells];
        changedRowCells.map(cell => {
          if (!!cell) {
            const day = moment(cell.day);
            if (day.isBetween(dayStart, dayEnd, 'days', '[]')) {
              let [morning, afternoon] = [false, false];
              if ((day.isSame(selection.start, 'days') && !selection.startHalfDay) || !day.isSame(selection.start, 'days')) {
                morning = true;
              }
              if ((day.isSame(selection.end, 'days') && !selection.endHalfDay) || !day.isSame(selection.end, 'days')) {
                afternoon = true;
              }
              cell.morning.selection = morning;
              cell.afternoon.selection = afternoon;
            } else {
              cell.morning.selection = false;
              cell.afternoon.selection = false;
            }
          }
          return cell;
        });
        setRowCells(changedRowCells);
      } else {
        const changedRowCells = [...rowCells];
        changedRowCells.filter(cellHasSelection).map(cell => {
          cell.morning.selection = false;
          cell.afternoon.selection = false;
          return cell;
        });
        setRowCells(changedRowCells);
        setSelectionStart(null);
      }
    },
    [selection]
  );

  useEffect(
    () => {
      setLoading(rowCells);
      if (!updating) {
        setCellLoading([]);
      }
    },
    [updating]
  );

  const setLoading = (cells: ITimesheetCellProps[]) => {
    const changedRowCells = [...cells];
    changedRowCells.map(cell => {
      if (!!cell) {
        cell.loading = updating && cellLoading.length > 0 && cellLoading.includes(cell.cellIndex);
      }
      return cell;
    });
    setRowCells(changedRowCells);
  };

  const handleSelectionChange = (cells: any[], selectionInterval: ISelectionInterval, fill?: boolean, forceFill?: boolean) => {
    if (props.onSelectionChange) {
      const changedCellLoading = cells
        .map(c1 => {
          if (!!c1.morning || !!c1.afternoon) {
            const cell = !!c1.morning
              ? rowCells.find(c2 => c2 && c2.day.isSame(c1.morning.date, 'days'))
              : rowCells.find(c2 => c2 && c2.day.isSame(c1.afternoon.date, 'days'));
            if (!!cell) {
              return cell.cellIndex;
            }
          }
          return null;
        })
        .filter(c => !!c);
      setCellLoading([...cellLoading, ...changedCellLoading]);
      props.onSelectionChange(cells, selectionInterval, fill, forceFill);
    }
  };

  const getCellEntity = (cell: ITimesheetCellProps) => {
    const { morning, afternoon } = cell;
    return {
      morning: (morning.selection && !morning.disabled) || (morning.disabled && morning.selected) ? morning.entity : undefined,
      afternoon: (afternoon.selection && !afternoon.disabled) || (afternoon.disabled && afternoon.selected) ? afternoon.entity : undefined,
      error: cell.error
    };
  };

  const getCellActiveEntity = (cell: ITimesheetCellProps) => {
    const { morning, afternoon } = cell;
    return {
      morning: !morning.disabled ? morning.entity : undefined,
      afternoon: !afternoon.disabled ? afternoon.entity : undefined,
      error: cell.error
    };
  };

  const cellHasSelection = (cell: ITimesheetCellProps) => !!cell && (cell.morning.selection || cell.afternoon.selection);

  const cellNotDisabled = (cell: ITimesheetCellProps) => !!cell && (!cell.morning.disabled || !cell.afternoon.disabled);

  const cellIsOnWorkDay = (cell: ITimesheetCellProps) => !!cell && !cell.weekend && !cell.holiday;

  const onSelection = (end, fill) => {
    if (end !== null && selectionStart !== null) {
      const [s1, s2] =
        (selectionStart.date === end.date && selectionStart.morning && !end.morning) || moment(selectionStart.date).isBefore(end.date)
          ? [selectionStart, end]
          : [end, selectionStart];
      setSelection({
        fill: selectionStart.fill,
        start: s1.date,
        startHalfDay: !s1.morning,
        end: s2.date,
        endHalfDay: s2.morning
      });
    } else if (end !== null && selectionStart === null) {
      setSelectionStart({ ...end, fill });
    } else {
      setSelection(null);
    }
  };

  const handlePointerUp = () => {
    if (!!selection) {
      const fill = selection.fill;
      const selectionInterval = {
        start: moment(selection.start),
        startHalfDay: selection.startHalfDay,
        end: moment(selection.end),
        endHalfDay: selection.endHalfDay
      };
      const cells = rowCells
        .filter(cellIsOnWorkDay)
        .map(getCellEntity)
        .filter(selected => !!selected.morning || !!selected.afternoon);
      handleSelectionChange(cells, selectionInterval, fill);
    }
    setSelection(null);
  };

  const handlePointerCancel = () => {
    setSelection(null);
  };

  const handleEventChange = (ev, isSelecting: boolean) => {
    if (!isSelecting || !props.mode) {
      return false;
    }
    const classes = ev.target.className.split(' ');
    const date = classes[1];
    const morning = classes.indexOf('am') !== -1;
    const editable = classes.indexOf('timeslot-editable') !== -1;
    const selected = classes.indexOf('timeslot-selected') !== -1;
    if (!editable && !selected) {
      return false;
    }
    onSelection({ date, morning }, !selected);
  };

  const handlePointerDown = ev => {
    if (ev.target.className.indexOf('timeslot') === -1) {
      return;
    }
    handleEventChange(ev, true);
  };

  const handlePointerMove = ev => {
    if (!selectionStart || ev.target.className.indexOf('timeslot') === -1) {
      return;
    }
    handleEventChange(ev, !!selectionStart);
  };

  const selectAll = () => ({
    start: rowCells[1].day,
    startHalfDay: false,
    end: rowCells[rowCells.length - 1].day,
    endHalfDay: false
  });

  const handleOnAdd = () => {
    handleSelectionChange([], {}, true);
  };

  const handleOnFill = () => {
    const cells = rowCells
      .filter(cellIsOnWorkDay)
      .filter(cellNotDisabled)
      .map(getCellActiveEntity);
    handleSelectionChange(cells, selectAll(), true);
  };

  const handleOnClear = () => {
    const cells = rowCells
      .filter(cellIsOnWorkDay)
      .map(cell => ({ morning: cell.morning.entity, afternoon: cell.afternoon.entity, error: cell.error }));
    handleSelectionChange(cells, selectAll(), false);
  };

  const handleOnValidateAll = () => {
    const cells = rowCells
      .filter(cellIsOnWorkDay)
      .filter(cellNotDisabled)
      .map(getCellActiveEntity);
    handleSelectionChange(cells, selectAll(), true, true);
  };

  const handleOnRejectAll = () => {
    const cells = rowCells
      .filter(cellIsOnWorkDay)
      .filter(cellNotDisabled)
      .map(getCellActiveEntity);
    handleSelectionChange(cells, selectAll(), false, true);
  };

  const renderActionsButton = () => {
    const cells = rowCells.filter(cell => !cell.disabled);
    const selectedCells = cells.filter(cell => cell.morning.selected || cell.afternoon.selected);
    const notSelectedCells = cells.filter(
      cell => (!cell.morning.selected && cell.morning.editable) || (!cell.afternoon.selected && cell.afternoon.editable)
    );
    const pendingCells = selectedCells.filter(cell => cell.morning.status === 'PENDING' || cell.afternoon.status === 'PENDING');
    if ((pendingCells.length === 0 && props.mode === 'validate') || (pendingCells.length === 0 && notSelectedCells.length === 0)) {
      return <th className="actions-cell" />;
    }
    switch (props.mode) {
      case 'add':
        return (
          <th className="actions-cell">
            <Button icon="plus" type="primary" size="small" title="Ajouter" onClick={handleOnAdd} loading={updating} />
          </th>
        );
      case 'fill':
        return (
          <th className="actions-cell">
            <Button
              icon="check"
              type="primary"
              size="small"
              title="Remplir"
              onClick={handleOnFill}
              style={{ display: selectedCells.length === 0 ? 'inline-block' : 'none' }}
              loading={updating}
            />
            <Button
              icon="delete"
              type="danger"
              size="small"
              title="Vider"
              onClick={handleOnClear}
              style={{ display: selectedCells.length !== 0 ? 'inline-block' : 'none' }}
              loading={updating}
            />
          </th>
        );
      case 'validate':
        return (
          <th className="actions-cell">
            <Button icon="check" type="primary" size="small" title="Valider tous" onClick={handleOnValidateAll} loading={updating} />
            <Button icon="close" type="danger" size="small" title="Reject tous" onClick={handleOnRejectAll} loading={updating} />
          </th>
        );
      case 'clean':
        return <th className="actions-cell" />;
      default:
        return <th className="actions-cell" />;
    }
  };

  // noinspection HtmlUnknownAttribute
  return (
    <tr
      className={`timesheet-row ${!!props.mode ? 'timesheet-row-' + props.mode : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerCancelCapture={handlePointerCancel}
    >
      <th title={`${props.title}`}>{props.title}</th>
      {renderActionsButton()}
      {rowCells.map(cell => (
        <TimesheetCell key={cell.cellIndex} {...cell} showWeekends={props.showWeekends} toggleWeekends={props.toggleWeekends} />
      ))}
      <th>{props.total !== -1 ? props.total : ''}</th>
    </tr>
  );
};
