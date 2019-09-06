import React, { FunctionComponent } from 'react';
import { IStandardActivity } from 'app/shared/model/standard-activity.model';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';

export interface ITimesheetValidationTotalsProps {
  standardActivities?: ReadonlyArray<IStandardActivity>;
  exceptionalActivities?: ReadonlyArray<IExceptionalActivity>;
}

export const TimesheetValidationTotals: FunctionComponent<ITimesheetValidationTotalsProps> = props => {
  const { exceptionalActivities } = props;
  const standardActivities = props.standardActivities.filter(act => act.morning || act.afternoon);
  let total = 0;
  total += standardActivities.filter(act => !act.validationStatus || act.validationStatus === 'PENDING').length;
  total += exceptionalActivities.filter(act => !act.validationStatus || act.validationStatus === 'PENDING').length;
  const expectedTotal = standardActivities.length + exceptionalActivities.length;
  const percent = 100 - (expectedTotal === 0 ? 0 : Math.ceil((total * 100) / expectedTotal));
  return (
    <div className={`activities-result mini ${total !== 0 ? 'has-error' : ''}`}>
      <div className="item">
        <div className="days">
          <sup>Validation</sup>
          {percent}
          <sup>%</sup>
        </div>
      </div>
      <div className="item">=</div>
      <div className="item">
        <div className="days">
          <sup>Activité Normale</sup>
          {standardActivities.filter(act => !!act.validationStatus && act.validationStatus !== 'PENDING').length} /{' '}
          {standardActivities.length}
        </div>
      </div>
      <div className="item-divider" />
      <div className="item">
        <div className="days">
          <sup>Astreintes</sup>
          {exceptionalActivities.filter(act => !!act.validationStatus && act.validationStatus !== 'PENDING').length} /{' '}
          {exceptionalActivities.length}
        </div>
      </div>
    </div>
  );
};
