import React, { FunctionComponent, useState } from 'react';
import { Card, DatePicker, Radio, Select, Button } from 'antd';
import moment from 'moment';
import { UnitsType } from 'app/application/common/utils/charts-utils';

import InvoicesPerStatus from './invoices-per-status';
import ExpensesPerType from './expenses-per-type';
import TotalProfit from './total-profit';
import AbsenteeismRate from './absenteeism-rate';

const units = [{ label: 'Annuel', value: 'years' }, { label: 'Mensuel', value: 'months' }, { label: 'Semaine', value: 'weeks' }];
const graphs = ['Les factures par statut', 'Notes de frais par type', 'Profit & Loss', "Taux d'absentéisme"];

export const Charts: FunctionComponent = () => {
  const [date, setDate] = useState(moment());
  const [unit, setUnit] = useState<UnitsType>('years');
  const [graph, setGraph] = useState(0);

  const handleDateChange = value => {
    if (unit === 'years') {
      setDate(moment(value, 'YYYY-MM-DD').startOf(unit));
    } else {
      setDate(value.startOf(unit));
    }
  };
  const handleGraphChange = value => setGraph(value);
  const handleUnitChange = ev => setUnit(ev.target.value);
  const handleNextDate = () => {
    handleDateChange(moment(date).add(1, unit));
  };
  const handlePrevDate = () => {
    handleDateChange(moment(date).add(-1, unit));
  };

  const graphSelect = (
    <Select value={graph} key="graphs" onChange={handleGraphChange} size="small">
      {graphs.map((val, key) => (
        <Select.Option
          key={key}
          children={
            <small>
              <b>{val}</b>
            </small>
          }
          value={key}
        />
      ))}
    </Select>
  );

  const title =
    graphs[graph] +
    ' ' +
    (unit === 'years'
      ? `année : ${date.format('YYYY')}`
      : unit === 'months'
        ? `Mois : ${date.format('MMMM YYYY')}`
        : `Semaine : ${date.format('wo YYYY')}`);

  return (
    <Card title={title} size="small" extra={graphSelect}>
      <div className="chart-toolbar">
        <Radio.Group key="units" onChange={handleUnitChange} value={unit} size="small">
          {units.map(u => (
            <Radio.Button key={u.value} value={u.value} children={<small>{u.label}</small>} />
          ))}
        </Radio.Group>
        <Button.Group className="chart-date-filter-group">
          <Button icon="left" title="Précédent" onClick={handlePrevDate} disabled={!date} size="small" />
          {unit === 'years' ? (
            <Select key="date" value={date.format('YYYY')} onChange={handleDateChange} size="small">
              {Array.apply(0, Array(10)).map((_, i) => {
                const year = moment().add(-i, 'years');
                return <Select.Option key={year.year()} children={year.format('YYYY')} value={year.format('YYYY')} />;
              })}
            </Select>
          ) : unit === 'months' ? (
            <DatePicker.MonthPicker value={date} onChange={handleDateChange} format="MMMM YYYY" allowClear={false} size="small" />
          ) : (
            <DatePicker.WeekPicker value={date} onChange={handleDateChange} format="wo YYYY" allowClear={false} size="small" />
          )}
          <Button icon="right" title="Suivant" onClick={handleNextDate} disabled={!date} size="small" />
        </Button.Group>
      </div>
      {graph === 0 && <InvoicesPerStatus date={date} unit={unit} />}
      {graph === 1 && <ExpensesPerType date={date} unit={unit} />}
      {graph === 2 && <TotalProfit date={date} unit={unit} />}
      {graph === 3 && <AbsenteeismRate date={date} unit={unit} />}
    </Card>
  );
};
