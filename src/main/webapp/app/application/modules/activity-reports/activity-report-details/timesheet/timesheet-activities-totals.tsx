import React, { FunctionComponent } from 'react';
import { Moment } from 'moment';

export interface ITimesheetTotals {
  expectedDays: number;
  executedDays: number;
  absenceDays: number;
  interContractDays: number;
  additionalHours: number;
}

export interface ITimesheetTotalsProps extends ITimesheetTotals {
  showValidation: boolean;
  showAbsences: boolean;
  hasCollision: Moment;
  hasErrors: any[];
}

export const TimesheetTotals: FunctionComponent<ITimesheetTotalsProps> = props => {
  const { expectedDays, executedDays, absenceDays, interContractDays, showAbsences, additionalHours, hasErrors } = props;

  return (
    <div className={`activities-result ${hasErrors.length > 0 ? 'has-error' : ''}`}>
      <div className="item">
        <span className="title">Ouvrés</span>
        <div className="days">
          {expectedDays} <sup>jours</sup>
        </div>
      </div>
      <div className="item">=</div>
      <div className="item">
        <span className="title">Activité Normale</span>
        <div className="days">
          {executedDays} <sup>jours</sup>
        </div>
      </div>
      {showAbsences && (
        <>
          <div className="item">+</div>
          <div className="item">
            <span className="title">Absences</span>
            <div className="days">
              {absenceDays} <sup>jours</sup>
            </div>
          </div>
          <div className="item">+</div>
          <div className="item">
            <span className="title">Intercontrat</span>
            <div className="days">
              {interContractDays} <sup>jours</sup>
            </div>
          </div>
        </>
      )}
      <div className="item-divider" />
      <div className="item">
        <span className="title">Astreintes</span>
        <div className="days">
          {additionalHours} <sup>heures</sup>
        </div>
      </div>
    </div>
  );
};
