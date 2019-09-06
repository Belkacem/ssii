import React, { FunctionComponent } from 'react';
import { Button, DatePicker } from 'antd';
import moment, { Moment } from 'moment';
import { FORMAT_MONTH } from 'app/application/common/config/constants';

interface IMonthFilterProps {
  value: Moment;
  setValue: (month: Moment) => void;
  maxWidth?: boolean;
  allowClear?: boolean;
}

export const MonthFilter: FunctionComponent<IMonthFilterProps> = props => {
  const { maxWidth = false, allowClear = false } = props;
  const handleChangeMonth = (selectedMonth: Moment) => {
    props.setValue(selectedMonth);
  };

  const handleNextMonth = () => {
    handleChangeMonth(moment(props.value).add(1, 'months'));
  };

  const handlePrevMonth = () => {
    handleChangeMonth(moment(props.value).add(-1, 'months'));
  };

  return (
    <>
      <Button icon="left" title="Le mois précédent" onClick={handlePrevMonth} disabled={!props.value} />
      <DatePicker.MonthPicker
        value={props.value}
        allowClear={allowClear}
        onChange={handleChangeMonth}
        format={FORMAT_MONTH}
        className="no-border-radius"
        style={maxWidth ? { width: 'calc(100% - 62px)' } : {}}
        placeholder="Filter par mois"
      />
      <Button icon="right" title="Le mois prochain" onClick={handleNextMonth} disabled={!props.value} />
    </>
  );
};
