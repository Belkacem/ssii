import React, { FunctionComponent } from 'react';
import { Moment } from 'moment';
import classNames from 'classnames';

export interface ITimeslotProps {
  disabled?: boolean;
  editable?: boolean;
  selected?: boolean;
  selection?: boolean;
  error?: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  entity?: any;
  borderColor?: string;
}

interface ITimesheetSlotProps extends ITimeslotProps {
  day?: Moment;
  isMorning?: boolean;
  title?: string;
}

export const TimesheetSlot: FunctionComponent<ITimesheetSlotProps> = props => {
  const { isMorning, title = '', day, disabled, editable, selected, status, error, selection, borderColor } = props;
  const classnames = classNames({
    timeslot: true,
    [`${day.format('YYYY-MM-DD')}`]: true,
    am: isMorning,
    pm: !isMorning,
    'timeslot-selected': selected,
    'timeslot-editable': editable,
    'timeslot-approved': selected && status === 'APPROVED',
    'timeslot-rejected': selected && status === 'REJECTED',
    'timeslot-disabled': disabled,
    'timeslot-error': error,
    selection
  });
  return (
    <div className={classnames} title={title}>
      {!!borderColor && <div className="timeslot-border" style={{ background: borderColor }} />}
    </div>
  );
};
