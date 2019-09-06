import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import moment, { Moment } from 'moment';

import { ISelectionInterval, ITimesheetRowProps, TimesheetRow } from 'app/application/components/timesheet/timesheet-row';
import { ITimesheetCellProps } from 'app/application/components/timesheet/timesheet-cell';
import { TimeSheetHead } from 'app/application/components/timesheet/timesheet-head';

import { IAbsence } from 'app/shared/model/absence.model';
import { IProjectValidator } from 'app/shared/model/project-validator.model';
import { IResourceContract } from 'app/shared/model/resource-contract.model';
import { IHoliday } from 'app/shared/model/holiday.model';
import { IActivityReport } from 'app/shared/model/activity-report.model';
import { IAbsenceType } from 'app/shared/model/absence-type.model';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';
import { IAbsenceValidator } from 'app/shared/model/absence-validator.model';
import { IProjectResource } from 'app/shared/model/project-resource.model';
import { IStandardActivity, ValidationStatus } from 'app/shared/model/standard-activity.model';
import { IProject } from 'app/shared/model/project.model';
import { IActivityReportFile } from 'app/shared/model/activity-report-file.model';

import { FORMAT_DATE, FORMAT_DATE_SERVER, INTERCONTRACT_CODE } from 'app/application/common/config/constants';
import { Button, Select, Spin } from 'antd';
import { Printable } from 'app/application/components/printable/printable.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { TimesheetTotals } from './timesheet-activities-totals';
import { TimesheetValidationTotals } from './timesheet-activities-validation-totals';
import { isHoliday, isWeekend } from 'app/application/common/utils/absence-utils';
import { hasProjectContract } from 'app/application/common/utils/project-resource-info-utils';
import { getActivityReportHtml } from 'app/application/common/utils/activity-utils';
import { hasContract } from 'app/application/common/utils/contract-utils';

export interface ITimesheetTableProps {
  month: Moment;
  reports: ReadonlyArray<IActivityReport>;
  reportsFiles: ReadonlyArray<IActivityReportFile>;
  projects?: ReadonlyArray<IProject>;
  resourceId?: number;
  projectResources?: ReadonlyArray<IProjectResource>;
  standardActivities?: ReadonlyArray<IStandardActivity>;
  exceptionalActivities?: ReadonlyArray<IExceptionalActivity>;
  absences?: ReadonlyArray<IAbsence>;
  contracts?: ReadonlyArray<IResourceContract>;
  holidays?: ReadonlyArray<IHoliday>;
  absenceTypes?: ReadonlyArray<IAbsenceType>;
  projectValidators?: ReadonlyArray<IProjectValidator>;
  absenceValidators?: ReadonlyArray<IAbsenceValidator>;
  loading: boolean;
  updating?: boolean;
  showStatus: boolean;
  showFill: boolean;
  showValidation: boolean;
  onAbsenceValidate?: Function;
  onAddAbsence?: Function;
  onOpenAbsence?: (absenceId: number) => void;
  onActivityChanged?: Function;
  verticalMode?: boolean;
  printMode?: boolean;
  isDownloading?: boolean;
  onDownload?: (report: IActivityReport) => void;
  onErrorsChanged?: (errors: any) => void;
}

const calculateTotals = (
  rows: ITimesheetRowProps[],
  exceptionalActivities: ReadonlyArray<IExceptionalActivity>,
  contracts: ReadonlyArray<IResourceContract> = []
) => {
  const totals = { expectedDays: 0, executedDays: 0, absenceDays: 0, interContractDays: 0, additionalHours: 0 };
  if (rows.length > 0) {
    rows.filter(row => row.rowIndex !== -1).forEach(row => {
      const rowTotal = row.cells.reduce(
        (total, cell) =>
          total + (cell.morning.selected && cell.afternoon.selected ? 1 : !cell.morning.selected && !cell.afternoon.selected ? 0 : 0.5),
        0
      );
      if (row.rowIndex === -2) {
        totals.absenceDays = rowTotal;
      } else if (row.rowIndex === -3) {
        totals.interContractDays = rowTotal;
      } else if (row.rowIndex > 0) {
        totals.executedDays += rowTotal;
      }
    });
    totals.expectedDays = rows[0].cells.reduce(
      (total, cell) => total + (!cell.weekend && !cell.holiday && hasContract(cell.day, contracts) ? 1 : 0),
      0
    );
    totals.additionalHours = exceptionalActivities.reduce((total, act) => total + act.nbHours, 0);
  }
  return totals;
};

export const TimesheetTable: FunctionComponent<ITimesheetTableProps> = props => {
  const printableRef: RefObject<Printable> = useRef<Printable>(null);
  const month = !!props.month ? props.month : moment();
  const startOfMonth = month.clone().startOf('months');
  const endOfMonth = month.clone().endOf('months');
  const [rows, setRows] = useState<ITimesheetRowProps[]>([]);
  const [toggleWeekends, setToggleWeekends] = useState(false);
  const [selectedToPrint, setSelectedToPrint] = useState('ALL_PROJECTS');
  const [validationErrors, setValidationErrors] = useState([]);

  const {
    reports,
    reportsFiles,
    absences,
    absenceTypes,
    contracts,
    standardActivities,
    exceptionalActivities,
    projects,
    projectResources,
    holidays
  } = props;
  const { showValidation, showFill, verticalMode = false, printMode = false, loading, isDownloading, updating } = props;
  const totals = calculateTotals(rows, exceptionalActivities, contracts);

  useEffect(
    () => {
      if (reports.length > 0) {
        setReports();
      }
    },
    [reports, holidays, projectResources, projects]
  );

  useEffect(
    () => {
      const dataRows: ITimesheetRowProps[] = setAbsences([...rows]);
      setRows(dataRows);
    },
    [absences]
  );

  useEffect(
    () => {
      const dataRows: ITimesheetRowProps[] = setActivities([...rows]);
      setRows(dataRows);
    },
    [props.standardActivities]
  );

  useEffect(
    () => {
      setReports();
    },
    [showFill, showValidation]
  );

  useEffect(
    () => {
      if ((!!selectedToPrint && printableRef.current) || printMode) {
        printableRef.current.scaleWrapper();
      }
    },
    [selectedToPrint, printMode]
  );

  useEffect(
    () => {
      resetValidationErrors();
    },
    [totals.expectedDays, totals.executedDays, totals.absenceDays, totals.interContractDays, totals.additionalHours]
  );

  useEffect(
    () => {
      if (props.onErrorsChanged) {
        props.onErrorsChanged(validationErrors);
      }
    },
    [validationErrors]
  );

  const createCells = (activity = undefined, report, rowIndex) => {
    const cells: ITimesheetCellProps[] = [];
    const day = startOfMonth.clone();
    while (day.isSameOrBefore(endOfMonth)) {
      const isWeekendDay = isWeekend(day);
      const hasHoliday = holidays.find(h => day.isSame(h.date, 'days'));
      const isDisabled = !!report && isCellDisabled(report.projectResourceId, day);
      const isEditable = activity !== 'total' && !isWeekendDay && hasHoliday === undefined && (showFill || showValidation);
      let standardActivity: IStandardActivity = null;
      if (!!report) {
        standardActivity = {
          activityReportId: report.id,
          date: day.clone(),
          morning: false,
          afternoon: false,
          validationDate: null,
          validationStatus: ValidationStatus.PENDING,
          validatorId: null
        };
      }
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
          editable: isEditable,
          error: false,
          status: 'PENDING',
          entity: standardActivity
        },
        afternoon: {
          selection: false,
          selected: false,
          disabled: isDisabled,
          editable: isEditable,
          error: false,
          status: 'PENDING',
          entity: standardActivity
        },
        total: 0
      };
      day.add(1, 'day');
    }
    return cells;
  };

  const setReports = () => {
    let datarows: ITimesheetRowProps[] = reports.map(report => {
      return {
        rowIndex: report.id,
        title: getProjectName(report.projectResourceId),
        projectResourceId: report.projectResourceId,
        cells: createCells(undefined, report, report.id),
        total: 0,
        mode: showFill || showValidation ? (showFill ? 'fill' : 'validate') : false,
        onSelectionChange: (cells: any[], selectionInterval: ISelectionInterval, fill?: boolean, forceFill?: boolean) => {
          onAvtivitiesChange(report.id, cells, selectionInterval, fill, forceFill);
        }
      };
    });
    if (absences) {
      datarows.push({
        rowIndex: -2,
        title: 'Les absences',
        cells: createCells('Absence', undefined, -2),
        total: 0,
        mode: showFill && !!props.onAddAbsence ? 'add' : showValidation ? 'validate' : false,
        onSelectionChange: (cells: any[], selectionInterval: ISelectionInterval, fill?: boolean, forceFill?: boolean) => {
          onAbsencesChange(false, cells, selectionInterval, fill, forceFill);
        }
      });
      datarows.push({
        rowIndex: -3,
        title: 'Intercontrat',
        cells: createCells('Intercontract', undefined, -3),
        total: 0,
        mode: showFill && !!props.onAddAbsence ? 'add' : showValidation ? 'validate' : false,
        onSelectionChange: (cells: any[], selectionInterval: ISelectionInterval, fill?: boolean, forceFill?: boolean) => {
          onAbsencesChange(true, cells, selectionInterval, fill, forceFill);
        }
      });
    }
    datarows.push({
      rowIndex: -1,
      title: 'Total',
      cells: createCells('total', undefined, -1),
      total: -1,
      mode: showFill || showValidation ? 'clean' : false
    });

    if (!!absences && absences.length > 0) {
      datarows = setAbsences(datarows);
    }
    if (!!standardActivities && standardActivities.length > 0) {
      datarows = setActivities(datarows);
    }
    setRows(datarows);
  };

  const setAbsences = (dataRows: ITimesheetRowProps[]) => {
    if (dataRows.length === 0) {
      return;
    }
    const intercontractType = absenceTypes.find(absenceType => absenceType.code === INTERCONTRACT_CODE);
    const rowAbsences = dataRows.find(r => r.rowIndex === -2);
    const rowIntercontract = dataRows.find(r => r.rowIndex === -3);
    rowAbsences.total = 0;
    rowIntercontract.total = 0;
    absences.map(absence => {
      absence.start = moment(absence.start);
      absence.end = moment(absence.end);
      const date = moment.max(startOfMonth, absence.start).clone();
      const endDate = moment.min(endOfMonth, absence.end);
      while (date.isSameOrBefore(endDate)) {
        if (!isWeekend(date) && !isHoliday(date, holidays)) {
          const index = date.date();
          const isMorning = !(absence.start.isSame(date) && absence.startHalfDay);
          const isAfternoon = !(absence.end.isSame(date) && absence.endHalfDay);
          const isIntercontract = intercontractType && absence.typeId === intercontractType.id;
          const cell = isIntercontract ? rowIntercontract['cells'][index] : rowAbsences['cells'][index];
          if (isMorning) {
            cell.morning.disabled = false;
            cell.morning.selected = isMorning;
            cell.morning.status = isMorning && absence.validationStatus === 'PENDING' ? 'PENDING' : 'APPROVED';
          }
          if (isAfternoon) {
            cell.afternoon.disabled = false;
            cell.afternoon.selected = isAfternoon;
            cell.afternoon.status = isAfternoon && absence.validationStatus === 'PENDING' ? 'PENDING' : 'APPROVED';
          }
          const cellTotal = isMorning && isAfternoon ? 1 : !isMorning && !isAfternoon ? 0 : 0.5;
          cell.total = cellTotal;
          if (isIntercontract) {
            rowIntercontract.total += cellTotal;
          } else {
            rowAbsences.total += cellTotal;
          }
          dataRows.filter(r => r.rowIndex !== (isIntercontract ? -3 : -2) && r.rowIndex !== -1).map(r => {
            const c = r.cells[index];
            if (isMorning) {
              c.morning.disabled = isMorning;
              c.morning.editable = false;
            }
            if (isAfternoon) {
              c.afternoon.disabled = isAfternoon;
              c.afternoon.editable = false;
            }
            return r;
          });
        }
        date.add(1, 'day');
      }
    });
    if (showValidation) {
      const abs = absences.filter(ab => month.isSame(ab.start, 'months') || month.isSame(ab.end, 'months'));
      const absNrm = abs.filter(ab => intercontractType && ab.typeId !== intercontractType.id);
      const absInt = abs.filter(ab => intercontractType && ab.typeId === intercontractType.id);
      if (!absNrm.some(ab => ab.validationStatus === 'PENDING')) {
        rowAbsences.mode = false;
      }
      if (!absInt.some(ab => ab.validationStatus === 'PENDING')) {
        rowIntercontract.mode = false;
      }
    }
    return calculateColumnTotals(dataRows);
  };

  const setActivities = (dataRows: ITimesheetRowProps[]) => {
    if (dataRows.length === 0) {
      return;
    }
    const filteredRows = dataRows.filter(r => r.rowIndex > 0);
    if (filteredRows && filteredRows.length > 0) {
      filteredRows.map(row => {
        const activities = standardActivities.filter(act => row.rowIndex === act.activityReportId);
        const totalSelected = activities.filter(act => act.morning || act.afternoon).length;
        const totalApproved = activities.filter(act => act.validationStatus === 'APPROVED').length;
        const canNotEdit = totalApproved === totalSelected && totalSelected !== 0;
        let rowTotal = 0;
        if (activities && activities.length > 0) {
          activities.map(activity => {
            const day = moment(activity.date);
            const index = day.date();
            if (row) {
              const cell = row['cells'][index];
              if (cell) {
                cell.morning.selected = activity.morning;
                cell.morning.status = activity.validationStatus;
                cell.afternoon.selected = activity.afternoon;
                cell.afternoon.status = activity.validationStatus;
                if (canNotEdit) {
                  cell.morning.editable = false;
                  cell.afternoon.editable = false;
                }
                const cellTotal = activity.morning && activity.afternoon ? 1 : !activity.morning && !activity.afternoon ? 0 : 0.5;
                cell.total = cellTotal;
                cell.afternoon.entity = JSON.parse(JSON.stringify(activity));
                cell.morning.entity = JSON.parse(JSON.stringify(activity));
                rowTotal += cellTotal;
              }
              // disable other activity rows
              dataRows.filter(r => r.rowIndex > 0 && r.rowIndex !== activity.activityReportId).map(r => {
                r.cells.filter(c => c.day.isSame(day, 'days')).map(c => {
                  c.morning.disabled = c.morning.editable && !c.disabled ? activity.morning : c.morning.disabled;
                  c.afternoon.disabled = c.afternoon.editable && !c.disabled ? activity.afternoon : c.afternoon.disabled;
                  return c;
                });
                return r;
              });
            }
          });
        }
        row.total = rowTotal;
        return row;
      });
    }
    return calculateColumnTotals(dataRows);
  };

  const isCellDisabled = (projectResourceId, day) => {
    if (projectResources) {
      const projectResource = projectResources.find(pr => pr.id === projectResourceId);
      return !hasProjectContract(day, projectResource);
    }
    return true;
  };

  const getProjectName = projectResourceId => {
    const projectResource = projectResources.find(pr => pr.id === projectResourceId);
    if (projectResource) {
      const project = projects.find(p => p.id === projectResource.projectId);
      if (project) {
        return project.nom;
      }
    }
    return projectResourceId;
  };

  const hasCollisions = (index: number) => {
    const dayData = rows.map(row => row.cells[index]);
    if (dayData && !dayData.some(d => d === undefined)) {
      const morning = dayData.map(data => data.morning.selected).filter(a => a).length;
      const afternoon = dayData.map(data => data.afternoon.selected).filter(a => a).length;
      return morning > 1 || afternoon > 1;
    }
    return false;
  };

  const calculateColumnTotals = (dataRows: ITimesheetRowProps[]) => {
    const totalRow = dataRows.find(r => r.rowIndex === -1);
    if (totalRow) {
      totalRow.cells.forEach((cell, index) => {
        const cellHasCollisions = hasCollisions(index);
        dataRows.map(r => r.cells[index]).map(c => {
          c.error = cellHasCollisions;
        });
        cell.total = dataRows
          .filter(r => r.rowIndex !== -1)
          .map(r => r.cells[index])
          .map(c => c.total)
          .reduce((t, a) => t + a, 0);
      });
      return dataRows;
    }
  };

  const anyCollisions = () => {
    const firstRow = rows[0];
    if (firstRow) {
      const cell = firstRow.cells.find(c => c && c.error);
      if (cell) {
        return cell.day;
      }
    }
    return null;
  };

  const resetValidationErrors = () => {
    const { expectedDays, executedDays, absenceDays, interContractDays } = totals;
    const hasAnyCollision = anyCollisions();
    const validateCount = (showValidation || showFill) && !!absences;
    const errorMessages = [];
    const hasError = validateCount && (executedDays + absenceDays + interContractDays !== expectedDays || hasAnyCollision);
    if (hasError) {
      if (executedDays + absenceDays + interContractDays !== expectedDays) {
        errorMessages.push(
          <>
            Le nombre de jours ouvrés{' '}
            <b>
              {expectedDays - absenceDays - interContractDays} <sup>jours</sup>
            </b>{' '}
            n'est pas égale aux jours déclarés{' '}
            <b>
              {executedDays} <sup>jours</sup>
            </b>
          </>
        );
      }
      if (hasAnyCollision) {
        errorMessages.push(
          <>
            Il y a une collision à la date <b>{hasAnyCollision.format(FORMAT_DATE)}</b>, vous devez la réparer avant de soumettre à nouveau!
          </>
        );
      }
    }
    setValidationErrors(errorMessages);
  };

  const onAvtivitiesChange = (reportId, cells: any[], selection: ISelectionInterval, fill: boolean, forcefill = false) => {
    let activities = [];
    if (showFill) {
      activities = cells
        .map(c => {
          const activity: IStandardActivity = c.morning ? c.morning : c.afternoon;
          if (c.morning && (c.morning.validationStatus === 'PENDING' || c.error)) {
            activity.morning = fill;
          }
          if (c.afternoon && (c.afternoon.validationStatus === 'PENDING' || c.error)) {
            activity.afternoon = fill;
          }
          return activity;
        })
        .filter(activity => !!activity);
    } else if (showValidation) {
      let status;
      const validationDate = moment().toISOString();
      activities = cells
        .map(c => {
          const activity = c.morning ? c.morning : c.afternoon;
          if (!status && !forcefill) {
            status = activity.validationStatus === 'PENDING' || activity.validationStatus === 'REJECTED' ? 'APPROVED' : 'REJECTED';
          } else if (!status && forcefill) {
            status = fill ? 'APPROVED' : 'REJECTED';
          }
          if (activity) {
            activity.validationStatus = status;
            activity.validationDate = validationDate;
          }
          return activity;
        })
        .filter(activity => !!activity)
        .filter(activity => activity.morning || activity.afternoon);
    }
    if (activities.length > 0) {
      props.onActivityChanged(activities);
    }
  };

  const onAbsencesChange = (isIntercontract, cells: any[], selection: ISelectionInterval, fill: boolean, forcefill = false) => {
    if (showValidation && forcefill) {
      const approve = fill;
      const intercontractType = absenceTypes.find(absenceType => absenceType.code === INTERCONTRACT_CODE);
      const changedAbsences = absences
        .filter(
          ab =>
            intercontractType &&
            ((isIntercontract && ab.typeId === intercontractType.id) || (!isIntercontract && ab.typeId !== intercontractType.id))
        )
        .filter(absence => absence.validationStatus === 'PENDING')
        .filter(
          absence =>
            selection.start.isBetween(absence.start, absence.end, 'days', '[]') ||
            absence.start.isBetween(selection.start, selection.end, 'days', '[]')
        )
        .map(absence => ({
          ...absence,
          start: absence.start.format(FORMAT_DATE_SERVER),
          end: absence.end.format(FORMAT_DATE_SERVER)
        }));
      props.onAbsenceValidate(changedAbsences, approve, isIntercontract);
    } else {
      const abs =
        !!selection.start &&
        absences
          .filter(absence => selection.start.isBetween(absence.start, absence.end, 'days', '[]'))
          .find(
            absence =>
              (!selection.start.isSame(absence.start, 'days') && !selection.start.isSame(absence.end, 'days')) ||
              (selection.start.isSame(absence.end, 'days') && (!absence.endHalfDay || selection.startHalfDay === !absence.endHalfDay)) ||
              (selection.start.isSame(absence.start, 'days') && (!absence.startHalfDay || selection.startHalfDay === absence.startHalfDay))
          );
      if (abs) {
        props.onOpenAbsence(abs.id);
      } else {
        if (showFill) {
          if (!isIntercontract) {
            props.onAddAbsence(null, [INTERCONTRACT_CODE], selection);
          } else {
            props.onAddAbsence(INTERCONTRACT_CODE, [], selection);
          }
        }
      }
    }
  };

  const handlePrint = () => {
    if (printableRef.current) {
      printableRef.current.print();
    }
  };

  const handleDownload = () => {
    if (projects && projects.length > 1) {
      if (selectedToPrint === 'ALL_PROJECTS') {
        reports.map(report => props.onDownload(report));
      } else {
        reports
          .filter(report => {
            const projectResource = projectResources.find(pr => pr.id === report.projectResourceId);
            return projectResource && projects.find(p => `${p.id}` === selectedToPrint && projectResource.projectId === p.id);
          })
          .map(report => props.onDownload(report));
      }
    } else {
      props.onDownload(reports[0]);
    }
  };

  const handleToggleWeekends = () => setToggleWeekends(!toggleWeekends);

  const handleToggleSelectedToPrint = value => setSelectedToPrint(value);

  const renderTable = () => {
    return (
      <>
        <div>
          <TimesheetTotals
            {...totals}
            showValidation={showFill}
            showAbsences={!!absences}
            hasCollision={anyCollisions()}
            hasErrors={validationErrors}
          />
        </div>
        {showValidation && (
          <div>
            <TimesheetValidationTotals standardActivities={standardActivities} exceptionalActivities={exceptionalActivities} />
          </div>
        )}
        <div className={`timesheet-table-wrap ${showFill || showValidation ? 'has-actions' : ''} ${verticalMode ? 'vertical-mode' : ''}`}>
          <Spin spinning={loading}>
            <table className="timesheet-table timesheet-table-bordered" cellSpacing={0} cellPadding={0}>
              <TimeSheetHead
                title="Projet"
                month={month}
                holidays={holidays}
                contracts={contracts}
                showWeekends={toggleWeekends}
                toggleWeekend={handleToggleWeekends}
              />
              <tbody>
                {rows.map(row => (
                  <TimesheetRow
                    key={`timesheet_row_${row.rowIndex}`}
                    updating={updating}
                    showWeekends={toggleWeekends}
                    toggleWeekends={handleToggleWeekends}
                    {...row}
                  />
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
            <span className="rejected" /> Non valide
          </div>
          <div className="legend-item">
            <span className="disabled" /> Désactivé
          </div>
        </div>
      </>
    );
  };

  const renderPrintable = () => {
    return (
      <>
        <PageHead
          title="Aperçu du rapport"
          margin={false}
          bordered
          actions={
            <>
              {projects &&
                projects.length > 1 && (
                  <Select defaultValue={selectedToPrint} onChange={handleToggleSelectedToPrint} style={{ minWidth: 150, marginTop: 1 }}>
                    <Select.Option key="ALL_PROJECTS" value="ALL_PROJECTS">
                      <small>Tous les projets</small>
                    </Select.Option>
                    <Select.OptGroup label="Par projet">
                      {projects.map(project => (
                        <Select.Option key={`PROJECT_${project.id}`} value={project.id}>
                          <small>
                            Projet: <b>{project.nom}</b>
                          </small>
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
                  </Select>
                )}{' '}
              <Button title="Imprimer" onClick={handlePrint} icon="printer" className="ant-btn-textual">
                <span>Imprimer</span>
              </Button>
              {props.onDownload !== undefined && (
                <Button icon="download" loading={isDownloading} onClick={handleDownload} className="ant-btn-textual">
                  <span>Télécharger</span>
                </Button>
              )}
            </>
          }
        />
        <Printable ref={printableRef} loading={loading} margin="0cm" orientation="landscape" size="A4" loadStyle={false}>
          {projects && projects.length > 1
            ? selectedToPrint === 'ALL_PROJECTS'
              ? reportsFiles.map(reportFile => (
                  <div
                    key={`all_projects_${reportFile.activityReportId}`}
                    dangerouslySetInnerHTML={{ __html: getActivityReportHtml(reportFile) }}
                    style={{ height: '100%' }}
                  />
                ))
              : reports
                  .filter(report => {
                    const projectResource = projectResources.find(pr => pr.id === report.projectResourceId);
                    return (
                      projectResource &&
                      projects.find(p => `${p.id}` === `${selectedToPrint}` && `${p.id}` === `${projectResource.projectId}`)
                    );
                  })
                  .map(report => reportsFiles.find(rf => rf.activityReportId === report.id))
                  .map(reportFile => (
                    <div
                      key={`selected_project_${reportFile.activityReportId}`}
                      dangerouslySetInnerHTML={{ __html: getActivityReportHtml(reportFile) }}
                      style={{ height: '100%' }}
                    />
                  ))
            : reportsFiles.map(reportFile => (
                <div
                  key={`one_project_${reportFile.activityReportId}`}
                  dangerouslySetInnerHTML={{ __html: getActivityReportHtml(reportFile) }}
                  style={{ height: '100%' }}
                />
              ))}
        </Printable>
      </>
    );
  };

  return <div>{(showFill || showValidation) && !printMode ? renderTable() : renderPrintable()}</div>;
};
