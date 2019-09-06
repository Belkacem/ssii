import React, { FunctionComponent } from 'react';
import { Moment } from 'moment';
import { FORMAT_DATE } from 'app/application/common/config/constants';
import { IHoliday } from 'app/shared/model/holiday.model';
import { TimesheetSlot, ITimeslotProps } from './timesheet-slot';
import { Spin } from 'antd';

export interface ITimesheetCellProps {
  cellIndex: any;
  day?: Moment;
  holiday?: IHoliday;
  morning?: ITimeslotProps;
  afternoon?: ITimeslotProps;
  weekend?: boolean;
  showWeekends?: boolean;
  error?: boolean;
  disabled?: boolean;
  total?: number;
  toggleWeekends?: () => void;
  loading?: boolean;
}

export const TimesheetCell: FunctionComponent<ITimesheetCellProps> = props => {
  const handleClick = () => {
    if (props.weekend) {
      props.toggleWeekends();
    }
  };

  const { weekend, total, day, error, morning, afternoon, holiday, cellIndex, showWeekends, loading = false } = props;
  const dayClasses = ['day'];
  if (weekend) {
    dayClasses.push('weekend');
    if (!showWeekends) {
      dayClasses.push('closed');
    }
  }
  if (holiday) {
    dayClasses.push('holiday');
  }
  const title = day.format(FORMAT_DATE) + (holiday ? '\n' + holiday.name : '') + (weekend ? '\njour de week-end' : '');
  return (
    <td className={dayClasses.join(' ')}>
      <div className="na" onClick={handleClick} title={title}>
        {!weekend && (
          <Spin spinning={loading} size="small">
            <TimesheetSlot
              key={`${cellIndex}_am`}
              {...morning}
              day={day}
              error={error}
              editable={error ? true : morning.editable}
              isMorning
              title={'Matin de ' + title}
            />
            <TimesheetSlot
              key={`${cellIndex}_pm`}
              {...afternoon}
              day={day}
              error={error}
              editable={error ? true : afternoon.editable}
              isMorning={false}
              title={'Après-midi de ' + title}
            />
          </Spin>
        )}
        <span className="day-text">{total}</span>
      </div>
    </td>
  );
};
