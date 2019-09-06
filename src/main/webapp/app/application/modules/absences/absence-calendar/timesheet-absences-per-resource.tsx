import React, { FunctionComponent, useEffect, useState } from 'react';

import { IAbsence } from 'app/shared/model/absence.model';
import { IResourceContract } from 'app/shared/model/resource-contract.model';
import { IHoliday } from 'app/shared/model/holiday.model';
import { IAbsenceType } from 'app/shared/model/absence-type.model';
import { IAbsenceValidator } from 'app/shared/model/absence-validator.model';
import { IResource } from 'app/shared/model/resource.model';

import moment, { Moment } from 'moment';
import { isHoliday, isWeekend } from 'app/application/common/utils/absence-utils';
import { hasContract } from 'app/application/common/utils/contract-utils';
import { Spin } from 'antd';

import { TimesheetRow, ITimesheetRowProps } from 'app/application/components/timesheet/timesheet-row';
import { ITimesheetCellProps } from 'app/application/components/timesheet/timesheet-cell';
import { TimeSheetHead } from 'app/application/components/timesheet/timesheet-head';

interface ITimesheetAbsencePerResourceProps {
  month: Moment;
  resource?: IResource;
  absences?: ReadonlyArray<IAbsence>;
  contracts?: ReadonlyArray<IResourceContract>;
  holidays?: ReadonlyArray<IHoliday>;
  absenceTypes?: ReadonlyArray<IAbsenceType>;
  absenceValidators?: ReadonlyArray<IAbsenceValidator>;

  verticalMode?: boolean;
  loading: boolean;
  showFill: boolean;
  onAddAbsence?: Function;
  onOpenAbsence?: (absenceId: number) => void;
}

export const TimesheetAbsencePerResource: FunctionComponent<ITimesheetAbsencePerResourceProps> = props => {
  const [toggleWeekends, setToggleWeekends] = useState(false);
  const [rows, setRows] = useState([]);
  const { contracts, holidays, resource, absenceTypes, absences, verticalMode = false, showFill = false, loading } = props;
  const month = !!props.month ? props.month : moment();
  const startOfMonth = month.clone().startOf('months');
  const endOfMonth = month.clone().endOf('months');

  useEffect(
    () => {
      if (absenceTypes.length > 0) {
        initCells();
      }
    },
    [absenceTypes]
  );

  useEffect(
    () => {
      setResourceContracts();
    },
    [contracts]
  );

  useEffect(
    () => {
      initCells();
    },
    [absences]
  );

  useEffect(
    () => {
      setHolidays(rows);
    },
    [holidays]
  );

  useEffect(
    () => {
      setRows([]);
      initCells();
    },
    [showFill]
  );

  const initCells = () => {
    const datarows: ITimesheetRowProps[] = [];
    datarows.push({
      rowIndex: -1,
      title: 'Total',
      cells: createCells(undefined, -1),
      total: -1,
      mode: props.showFill && !!props.onAddAbsence ? 'add' : false,
      onSelectionChange: (cells: any[], selection) => {
        handleAbsencesChange(null, selection);
      }
    });
    absenceTypes.map(absenceType => {
      datarows.push({
        rowIndex: absenceType.id,
        title: absenceType.type,
        cells: createCells(absenceType, absenceType.id),
        total: 0,
        mode: props.showFill && !!props.onAddAbsence ? 'add' : false,
        onSelectionChange: (cells: any[], selection) => {
          handleAbsencesChange(absenceType, selection);
        }
      });
    });
    if (absences && absences.length > 0) {
      setAbsences(datarows);
    } else {
      setRows(datarows);
    }
  };

  const createCells = (absenceType, rowIndex) => {
    const cells: ITimesheetCellProps[] = [];
    const day = startOfMonth.clone();
    while (day.isSameOrBefore(endOfMonth)) {
      const isWeekendDay = isWeekend(day);
      const hasHoliday = holidays.find(h => day.isSame(h.date, 'days'));
      const isDisabled = !!resource && isCellDisabled(day);
      const isEditable = !isWeekendDay && hasHoliday === undefined && props.showFill;
      cells[day.date()] = {
        cellIndex: `${rowIndex}_${day.date()}`,
        day: day.clone(),
        weekend: isWeekendDay,
        holiday: hasHoliday,
        disabled: isDisabled,
        error: false,
        morning: {
          selection: false,
          selected: false,
          disabled: isDisabled,
          editable: isDisabled ? false : isEditable,
          error: false,
          status: 'PENDING',
          entity: null
        },
        afternoon: {
          selection: false,
          selected: false,
          disabled: isDisabled,
          editable: isDisabled ? false : isEditable,
          error: false,
          status: 'PENDING',
          entity: null
        },
        total: 0
      };
      day.add(1, 'day');
    }
    return cells;
  };

  const setAbsences = (datarows: ITimesheetRowProps[]) => {
    if (datarows.length === 0) {
      return;
    }
    const newRows: ITimesheetRowProps[] = datarows.map(row => {
      if (row) {
        absences.filter(absence => row.rowIndex === -1 || absence.typeId === row.rowIndex).map(absence => {
          absence.start = moment(absence.start);
          absence.end = moment(absence.end);
          const date = moment.max(startOfMonth, absence.start).clone();
          const endDate = moment.min(endOfMonth, absence.end);
          while (date.isSameOrBefore(endDate)) {
            if (!isWeekend(date) && !isHoliday(date, holidays)) {
              const index = date.date();
              const isMorning = !(absence.start.isSame(date) && absence.startHalfDay);
              const isAfternoon = !(absence.end.isSame(date) && absence.endHalfDay);
              const cell = row['cells'][index];
              if (isMorning) {
                cell.morning.editable = isMorning;
                cell.morning.disabled = false;
                cell.morning.selected = isMorning;
                cell.morning.status = isMorning && absence.validationStatus === 'PENDING' ? 'PENDING' : 'APPROVED';
              }
              if (isAfternoon) {
                cell.afternoon.editable = isAfternoon;
                cell.afternoon.disabled = false;
                cell.afternoon.selected = isAfternoon;
                cell.afternoon.status = isAfternoon && absence.validationStatus === 'PENDING' ? 'PENDING' : 'APPROVED';
              }
              cell.total = isMorning && isAfternoon ? 1 : !isMorning && !isAfternoon ? 0 : 0.5;

              datarows.filter(r => r.rowIndex !== row.rowIndex && r.rowIndex !== -1).map(r => {
                const c = r.cells[index];
                if (isMorning) {
                  c.morning.disabled = true;
                  c.morning.editable = false;
                }
                if (isAfternoon) {
                  c.afternoon.disabled = true;
                  c.afternoon.editable = false;
                }
                return r;
              });
            }
            date.add(1, 'day');
          }
        });
        row.total = row.cells.reduce((acc, cur) => acc + (cur.morning.selected ? 0.5 : 0) + (cur.afternoon.selected ? 0.5 : 0), 0);
      }
      return row;
    });
    setRows(newRows);
  };

  const setHolidays = (datarows: ITimesheetRowProps[]) => {
    if (datarows && datarows.length > 0) {
      datarows.map(row => {
        row.cells.map(cell => {
          const holiday = holidays.find(h => moment(h.date).isSame(cell.day, 'days'));
          if (holiday) {
            cell.holiday = holiday;
            cell.morning.editable = false;
            cell.afternoon.editable = false;
          }
        });
        return row;
      });
      setRows(datarows);
    }
  };

  const isCellDisabled = (day: Moment) => contracts.length === 0 || !hasContract(day, contracts);

  const setResourceContracts = () => {
    const datarows: ITimesheetRowProps[] = rows.map(row => {
      if (row) {
        row.cells.map((cell, i) => {
          const isDisabled = isCellDisabled(cell.day);
          row['cells'][i].disabled = isDisabled;
          row['cells'][i].morning.disabled = isDisabled;
          row['cells'][i].afternoon.disabled = isDisabled;
          if (isDisabled) {
            row['cells'][i].morning.editable = false;
            row['cells'][i].afternoon.editable = false;
          }
        });
      }
      return row;
    });
    if (absences && absences.length > 0) {
      setAbsences(datarows);
    } else {
      setRows(datarows);
    }
  };

  const handleToggleWeekends = () => {
    setToggleWeekends(!toggleWeekends);
  };

  const handleAbsencesChange = (absenceType: IAbsenceType, selection) => {
    const abs =
      !!selection.start &&
      absences.filter(absence => selection.start.isBetween(absence.start, absence.end, 'days', '[]')).find(absence => {
        return (
          (!selection.start.isSame(absence.start, 'days') && !selection.start.isSame(absence.end, 'days')) ||
          (selection.start.isSame(absence.end, 'days') && (!absence.endHalfDay || selection.startHalfDay === !absence.endHalfDay)) ||
          (selection.start.isSame(absence.start, 'days') && (!absence.startHalfDay || selection.startHalfDay === absence.startHalfDay))
        );
      });
    if (abs) {
      props.onOpenAbsence(abs.id);
    } else {
      props.onAddAbsence(selection, resource, absenceType);
    }
  };

  return (
    <>
      <div
        className={`timesheet-absences-per-resource timesheet-table-wrap ${showFill ? 'has-actions' : ''} ${
          verticalMode ? 'vertical-mode' : ''
        }`}
      >
        <Spin spinning={loading}>
          <table className="timesheet-table timesheet-table-bordered" cellSpacing={0} cellPadding={0}>
            <TimeSheetHead
              title="Types de congé"
              month={month}
              holidays={holidays}
              contracts={contracts}
              showWeekends={toggleWeekends}
              toggleWeekend={handleToggleWeekends}
            />
            <tbody>
              {rows.map(row => (
                <TimesheetRow key={row.rowIndex} showWeekends={toggleWeekends} toggleWeekends={handleToggleWeekends} {...row} />
              ))}
            </tbody>
          </table>
        </Spin>
      </div>
      <div className="timesheet-legend">
        <span className="legend-title">Légendes</span>
        <div className="legend-item">
          <span className="freeday" /> Libre
        </div>
        <div className="legend-item">
          <span className="weekend" /> Week-end
        </div>
        <div className="legend-item">
          <span className="holiday" /> Férié
        </div>
        <div className="legend-item">
          <span className="pending" /> En attent
        </div>
        <div className="legend-item">
          <span className="approved" /> Valide
        </div>
        <div className="legend-item">
          <span className="disabled" /> Désactivé
        </div>
      </div>
    </>
  );
};
