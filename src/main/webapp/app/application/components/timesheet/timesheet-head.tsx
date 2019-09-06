import React, { FunctionComponent, useEffect, useState } from 'react';
import { IHoliday } from 'app/shared/model/holiday.model';
import { IResourceContract } from 'app/shared/model/resource-contract.model';
import moment, { Moment } from 'moment';
import { hasContract } from 'app/application/common/utils/contract-utils';
import { Icon } from 'antd';
import { isWeekend } from 'app/application/common/utils/absence-utils';
import { TimesheetHeadCell } from './timesheet-head-cell';

interface ITimeSheetHeadProps {
  month: Moment;
  title?: string;
  holidays?: ReadonlyArray<IHoliday>;
  contracts?: ReadonlyArray<IResourceContract>;
  showWeekends?: boolean;
  toggleWeekend?: () => void;
}

export const TimeSheetHead: FunctionComponent<ITimeSheetHeadProps> = props => {
  const { title = '', month, contracts = [], holidays = [], showWeekends = false } = props;
  const [columns, setColumns] = useState([]);
  useEffect(
    () => {
      if (!!month) {
        const _columns = [];
        _columns.push({ title, className: `table-cell-title` });
        _columns.push({
          title: (
            <>
              <Icon type="setting" title="Actions" className="horizontal-display" />
              <span className="vertical-display">Actions</span>
            </>
          ),
          className: `table-cell-activity-action`
        });
        const day = month.clone().startOf('months');
        const endOfMonth = month.clone().endOf('months');
        while (day.isSameOrBefore(endOfMonth)) {
          const hasHoliday = holidays.find(h => moment(h.date).isSame(day, 'days'));
          const weekend = isWeekend(day);
          const isDisabled = !hasContract(day.clone(), contracts);
          const classes = ['table-cell-activity'];
          if (isDisabled) {
            classes.push('disabled');
          }
          if (hasHoliday) {
            classes.push('holiday');
          }
          if (weekend) {
            classes.push('weekend');
          }
          _columns.push({
            title: (
              <>
                <div className="vertical-display">{day.format('dddd DD')}</div>
                <div className="horizontal-display">
                  <div>
                    <small>{day.format('dd')}</small>
                  </div>
                  <b>{day.format('DD')}</b>
                </div>
              </>
            ),
            className: classes.join(' ')
          });
          day.add(1, 'day');
        }
        _columns.push({
          title: (
            <>
              <span className="horizontal-display">∑</span>
              <span className="vertical-display">Total</span>
            </>
          ),
          className: `table-cell-activity-total`
        });
        setColumns(_columns);
      }
    },
    [month, holidays, contracts]
  );

  return (
    <thead className="timesheet-head">
      <tr>
        {columns.map((column, key) => (
          <TimesheetHeadCell
            key={key}
            showWeekends={showWeekends}
            toggleWeekends={props.toggleWeekend}
            className={column.className}
            content={column.title}
          />
        ))}
      </tr>
    </thead>
  );
};
