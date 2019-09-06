import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Spin } from 'antd';
import moment, { Moment } from 'moment';
import { getInvoiceTotal } from 'app/application/common/utils/invoice-utils';
import { getChartDates, getDateFormat, getGranularity, UnitsType } from 'app/application/common/utils/charts-utils';
import { Axis, Chart, Geom, Legend, Tooltip } from 'bizcharts';
import DataSet from '@antv/data-set';
import { getExpenses as getAllExpenses } from 'app/application/entities/expense/expense.actions';
import { getByInvoicesIn as getInvoiceItemsByInvoicesIn } from 'app/application/entities/invoice-item/invoice-item.actions';
import { getInvoices as getAllInvoices } from 'app/application/entities/invoice/invoice.actions';
import { moneyFormatter } from 'app/application/common/utils/dashboard-utils';

interface ITotalProfitProps extends StateProps, DispatchProps {
  date?: Moment;
  unit?: UnitsType;
}

const TotalProfit: FunctionComponent<ITotalProfitProps> = props => {
  const { invoices, invoicesItems, expenses, date = moment(), unit = 'months' } = props;
  const loading = props.loadingInvoices || props.loadingInvoicesItems || props.loadingExpenses;
  const [data, setData] = useState([]);
  const dates = getChartDates(date, unit);
  const dateFormat = getDateFormat(unit);

  useEffect(() => {
    props.getAllExpenses(0, 999, `date,asc`);
    props.getAllInvoices(0, 999, `issueDate,asc`);
  }, []);

  useEffect(
    () => {
      if (invoices.length > 0) {
        const invoicesIds = invoices.map(inv => inv.id);
        props.getInvoiceItemsByInvoicesIn(invoicesIds);
      }
    },
    [invoices]
  );

  useEffect(
    () => {
      const _data = dates.map(d => {
        let totalExpense = 0;
        let totalIncome = 0;
        expenses.map(exp => {
          const granularity = getGranularity(unit);
          if (moment(exp.date).isSame(d, granularity)) {
            totalExpense += exp.amount + exp.amount * (exp.vat / 100);
          }
        });
        invoices.map(inv => {
          const granularity = getGranularity(unit);
          if (moment(inv.issueDate).isSame(d, granularity)) {
            const invoiceitems = invoicesItems.filter(invItem => invItem.invoiceId === inv.id);
            totalIncome += getInvoiceTotal(invoiceitems);
          }
        });
        return {
          date: d.format('YYYY-MM-DD'),
          expenses: -totalExpense,
          income: totalIncome,
          profit: totalIncome - totalExpense
        };
      });
      setData(_data);
    },
    [expenses, invoicesItems, unit, date]
  );

  const ds = new DataSet();
  const dv = ds.createView().source(data);
  dv.transform({
    type: 'fold',
    fields: ['expenses', 'income', 'profit'],
    key: 'type',
    value: 'value'
  });

  const scale = {
    value: {
      formatter: moneyFormatter
    },
    date: {
      type: 'timeCat',
      formatter: val => {
        return moment(val).format(dateFormat);
      }
    }
  };

  const formatLegend = val => {
    switch (val) {
      case 'expenses':
        return 'Dépenses';
      case 'income':
        return 'Revenus';
      case 'profit':
        return 'Bénéfice';
      default:
        return '';
    }
  };

  const formatTootltip = (_date, _type, _val) => ({
    name: formatLegend(_type),
    title: moment(_date).format(dateFormat),
    value: moneyFormatter(_val)
  });

  return (
    <Spin spinning={loading}>
      <Chart height={258} data={dv} forceFit scale={scale}>
        <Axis name="date" />
        <Axis name="value" />
        <Tooltip crosshairs={{ type: 'y' }} />
        <Legend title itemFormatter={formatLegend} />
        <Geom type="area" position="date*value" color="type" tooltip={['date*type*value', formatTootltip]} />
        <Geom type="line" position="date*value" color="type" tooltip={false} />
      </Chart>
    </Spin>
  );
};

const mapStateToProps = ({ application, invoice, invoiceItem }: IRootState) => ({
  expenses: application.expense.list.entities,
  loadingExpenses: application.expense.list.loading,
  invoices: invoice.entities,
  invoicesItems: invoiceItem.entities,
  loadingInvoices: invoice.loading,
  loadingInvoicesItems: invoice.loading
});

const mapDispatchToProps = {
  getAllExpenses,
  getAllInvoices,
  getInvoiceItemsByInvoicesIn
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(TotalProfit);
