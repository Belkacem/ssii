import React, { FunctionComponent } from 'react';
import moment, { Moment } from 'moment';
import { IHoliday } from 'app/shared/model/holiday.model';
import { IAbsence, ValidationStatus } from 'app/shared/model/absence.model';
import { Row, Col, Icon } from 'antd';
import { IAbsenceValidator } from 'app/shared/model/absence-validator.model';
import { IResource } from 'app/shared/model/resource.model';
import { FORMAT_DATETIME } from 'app/application/common/config/constants';

export function hasAbsence(date: Moment, absences: ReadonlyArray<IAbsence> = []) {
  return absences.some(absence => {
    const inclusivity = !absence.startHalfDay ? (!absence.endHalfDay ? '[]' : '[)') : !absence.endHalfDay ? '(]' : '()';
    return date.isBetween(absence.start, absence.end, 'days', inclusivity);
  });
}

export function hasAbsenceInside(
  startDate: Moment,
  endDate: Moment,
  startHalfDay: boolean,
  endHalfDay: boolean,
  absences: ReadonlyArray<IAbsence> = []
) {
  if (!(startDate instanceof moment)) {
    startDate = moment(startDate);
  }
  if (!(endDate instanceof moment)) {
    endDate = moment(endDate);
  }
  return absences.some(absence => {
    const abStart = absence.start instanceof moment ? absence.start : moment(absence.start);
    const abEnd = absence.end instanceof moment ? absence.end : moment(absence.end);
    if (abStart.isSame(startDate, 'days') && startHalfDay === absence.startHalfDay) {
      return true;
    }
    if (abEnd.isSame(endDate, 'days') && endHalfDay === absence.endHalfDay) {
      return true;
    }
    if (!startDate.isSame(endDate, 'days')) {
      const inclusivity = !startHalfDay ? (!endHalfDay ? '[]' : '[)') : !endHalfDay ? '(]' : '()';
      if (abStart.isBetween(startDate, endDate, 'days', inclusivity)) {
        return true;
      }
      if (abEnd.isBetween(startDate, endDate, 'days', inclusivity)) {
        return true;
      }
      if (abEnd.isSame(startDate, 'days') && (!absence.endHalfDay || !startHalfDay)) {
        return true;
      }
      if (abStart.isSame(endDate, 'days') && (!absence.startHalfDay || !endHalfDay)) {
        return true;
      }
    } else {
      if (abEnd.isSame(absence.start, 'days')) {
        if (abEnd.isSame(startDate, 'days')) {
          if ((absence.endHalfDay && !startHalfDay) || (absence.startHalfDay && !endHalfDay)) {
            return true;
          }
        }
      } else {
        if (abEnd.isSame(startDate, 'days') && (!absence.endHalfDay || !startHalfDay)) {
          return true;
        }
        if (abStart.isSame(endDate, 'days') && (!absence.startHalfDay || !endHalfDay)) {
          return true;
        }
      }
    }
    return false;
  });
}

export function isHoliday(date: Moment, holidays: ReadonlyArray<IHoliday> = []) {
  return holidays.some(holiday => date.isSame(holiday.date, 'days'));
}

export function isWeekend(date) {
  return date.isoWeekday() === 6 || date.isoWeekday() === 7;
}

export function calculateNumberOfDays(absence, holidays: ReadonlyArray<IHoliday> = []) {
  const startDate = moment(absence.start);
  const endDate = moment(absence.end);
  let days = 0;
  const date = startDate.clone();
  while (date.isSameOrBefore(endDate)) {
    if (!isWeekend(date) && !isHoliday(date, holidays)) {
      if ((date.isSame(startDate) && !absence.startHalfDay) || !date.isSame(startDate)) {
        days += 0.5;
      }
      if ((date.isSame(endDate) && !absence.endHalfDay) || !date.isSame(endDate)) {
        days += 0.5;
      }
    }
    date.add(1, 'day');
  }
  return days;
}

export const DaysNumber: FunctionComponent<{ values; errors; holidays }> = props => {
  const { values, errors, holidays } = props;
  if (!values.start || errors.start || errors.end) {
    return null;
  }
  return (
    <Row>
      <Col sm={6} className="ant-form-item-label">
        <label>Décompte (Durée)</label>
      </Col>
      <Col sm={18}>
        <div className="ant-form-item-control">
          <div className="ant-input">
            <b>{calculateNumberOfDays(values, holidays)}</b> jours
          </div>
        </div>
      </Col>
    </Row>
  );
};

export function getValidatorsResources(validators: ReadonlyArray<IAbsenceValidator>) {
  if (validators.length > 0) {
    return validators.reduce((acc, val) => acc.concat(...val.resources), []) as ReadonlyArray<IResource>;
  }
  return [] as ReadonlyArray<IResource>;
}

export function getValidatorResources(absenceValidator: IAbsenceValidator) {
  if (!!absenceValidator) {
    return absenceValidator.resources;
  }
  return [] as ReadonlyArray<IResource>;
}

export const formatDaysNumber = number => (number % 1 === 0 ? number : number.toFixed(2));

export const getAbsenceStatusIcon = absence => {
  if (!absence.submissionDate) {
    return <Icon type="delete" twoToneColor="silver" theme="twoTone" title="Brouillon" />;
  }
  switch (absence.validationStatus) {
    case ValidationStatus.APPROVED:
      return (
        <Icon
          type="check-circle"
          twoToneColor="#52c41a"
          theme="twoTone"
          title={`Approuvé le ${moment(absence.validationDate).format(FORMAT_DATETIME)}`}
        />
      );
    case ValidationStatus.REJECTED:
      return (
        <Icon
          type="close-circle"
          twoToneColor="red"
          theme="twoTone"
          title={`Refusé le ${moment(absence.validationDate).format(FORMAT_DATETIME)}`}
        />
      );
    case ValidationStatus.PENDING:
      return <Icon type="clock-circle" theme="twoTone" title="En attente" />;
    default:
      return '';
  }
};

export const getAbsenceDates = absence => {
  const start = moment(absence.start);
  const end = moment(absence.end);
  if (start.isSame(end, 'day')) {
    return <>{end.format('DD MMM YYYY')}</>;
  } else if (start.isSame(end, 'month')) {
    return (
      <>
        {start.format('DD')} - {end.format('DD MMM YYYY')}
      </>
    );
  } else if (start.isSame(end, 'year')) {
    return (
      <>
        {start.format('DD MMM')} - {end.format('DD MMM YYYY')}
      </>
    );
  } else {
    return (
      <>
        {start.format('DD MMM YYYY')} - {end.format('DD MMM YYYY')}
      </>
    );
  }
};

export const getAbsenceType = (absence, absenceTypes) => {
  if (absenceTypes.length === 0) {
    return '';
  }
  const absenceType = absenceTypes.find(type => type.id === absence.typeId);
  if (absenceType) {
    return absenceType.type;
  }
  return '';
};
