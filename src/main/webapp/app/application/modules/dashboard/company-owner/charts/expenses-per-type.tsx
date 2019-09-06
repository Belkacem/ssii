import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Spin } from 'antd';
import moment, { Moment } from 'moment';
import { getChartDates, getDateFormat, getGranularity, UnitsType } from 'app/application/common/utils/charts-utils';
import { Axis, Chart, Geom, Legend, Tooltip } from 'bizcharts';
import DataSet from '@antv/data-set';
import * as ExpenseType from 'app/entities/expense-type/expense-type.reducer';
import * as Expense from 'app/application/entities/expense/expense.actions';
import { moneyFormatter } from 'app/application/common/utils/dashboard-utils';

interface IExpensesPerTypeProps extends StateProps, DispatchProps {
  date?: Moment;
  unit?: UnitsType;
}

const ExpensesPerType: FunctionComponent<IExpensesPerTypeProps> = props => {
  const { expenses, expensesTypes, loading, date = moment(), unit = 'months' } = props;
  const [data, setData] = useState([]);
  const dates = getChartDates(date, unit);
  const dateFormat = getDateFormat(unit);
  const formattedDates = dates.map(d => d.format('YYYY-MM-DD'));

  useEffect(() => {
    props.getExpenses(0, 999, `date,asc`);
    props.getExpenseTypes(0, 999, `type,asc`);
  }, []);

  useEffect(
    () => {
      if (expenses.length > 0 && expensesTypes.length > 0) {
        const _data = expensesTypes.map(exptype => {
          const item = { name: exptype.type };
          dates.map(d => {
            let total = 0;
            expenses.map(exp => {
              const granularity = getGranularity(unit);
              if (moment(exp.date).isSame(d, granularity) && exptype.id === exp.typeId) {
                total += exp.amount + exp.amount * (exp.vat / 100);
              }
            });
            item[d.format('YYYY-MM-DD')] = total;
          });
          return item;
        });
        setData(_data);
      }
    },
    [expenses, expensesTypes, unit, date]
  );

  const ds = new DataSet();
  const dv = ds.createView().source(data);
  dv.transform({
    type: 'fold',
    fields: formattedDates,
    key: 'date',
    value: 'total'
  });

  const scale = {
    total: {
      formatter: moneyFormatter
    },
    date: {
      type: 'timeCat',
      formatter: val => {
        return moment(val).format(dateFormat);
      }
    }
  };

  return (
    <Spin spinning={loading}>
      <Chart height={258} data={dv} forceFit scale={scale}>
        <Axis name="date" />
        <Axis name="total" />
        <Legend />
        <Tooltip crosshairs={{ type: 'y' }} />
        <Geom
          type="interval"
          position="date*total"
          color="name"
          adjust={[
            {
              type: 'dodge',
              marginRatio: 1 / 32
            }
          ]}
        />
      </Chart>
    </Spin>
  );
};

const mapStateToProps = ({ application, expenseType }: IRootState) => ({
  expenses: application.expense.list.entities,
  loading: application.expense.list.loading,
  expensesTypes: expenseType.entities
});

const mapDispatchToProps = {
  getExpenses: Expense.getExpenses,
  getExpenseTypes: ExpenseType.getEntities
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ExpensesPerType);
