import React, { FunctionComponent } from 'react';

interface ITimesheetHeadCellProps {
  showWeekends: boolean;
  toggleWeekends: Function;
  className: string;
  content: any;
}

export const TimesheetHeadCell: FunctionComponent<ITimesheetHeadCellProps> = props => {
  const handleClick = () => {
    if (props.className.indexOf('weekend') !== -1) {
      props.toggleWeekends();
    }
  };

  const className = `${props.className}${props.showWeekends ? '' : ' closed'}`;
  return (
    <th>
      <div className={className} onClick={handleClick}>
        {props.content}
      </div>
    </th>
  );
};
