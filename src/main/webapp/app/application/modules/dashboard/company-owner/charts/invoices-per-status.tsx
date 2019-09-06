import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { getInvoices as getAllInvoices } from 'app/application/entities/invoice/invoice.actions';
import { getByInvoicesIn as getInvoiceItemsByInvoicesIn } from 'app/application/entities/invoice-item/invoice-item.actions';
import { Spin } from 'antd';
import moment, { Moment } from 'moment';
import { getInvoiceTotal } from 'app/application/common/utils/invoice-utils';
import { getChartDates, getDateFormat, getGranularity, UnitsType } from 'app/application/common/utils/charts-utils';
import { Axis, Chart, Geom, Legend, Tooltip } from 'bizcharts';
import DataSet from '@antv/data-set';
import { moneyFormatter } from 'app/application/common/utils/dashboard-utils';
import { InvoiceStatus } from 'app/shared/model/invoice.model';

interface IInvoicesPerStatusProps extends StateProps, DispatchProps {
  date?: Moment;
  unit?: UnitsType;
}

const cols = [
  { label: 'Brouillon', value: 'DRAFT' },
  { label: 'Envoyée', value: 'SENT' },
  { label: 'Payée', value: 'PAID' },
  { label: 'Retard', value: 'OVERDUE' }
];

const InvoicesPerStatus: FunctionComponent<IInvoicesPerStatusProps> = props => {
  const { invoices, invoicesItems, date = moment(), unit = 'months' } = props;
  const loading = props.loadingInvoices || props.loadingInvoicesItems;
  const [data, setData] = useState([]);
  const dates = getChartDates(date, unit);
  const dateFormat = getDateFormat(unit);
  const formattedDates = dates.map(d => d.format('YYYY-MM-DD'));
  const today = moment();

  useEffect(() => {
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
      if (invoices.length > 0) {
        const _data = cols.map(col => {
          const item = { name: col.label };
          dates.map(d => {
            let total = 0;
            invoices.map(inv => {
              const granularity = getGranularity(unit);
              if (moment(inv.issueDate).isSame(d, granularity)) {
                if (col.value === 'OVERDUE') {
                  if (inv.status !== InvoiceStatus.PAID && today.diff(inv.dueDate, 'days') > 0) {
                    const invoiceitems = invoicesItems.filter(invItem => invItem.invoiceId === inv.id);
                    total += getInvoiceTotal(invoiceitems);
                  }
                } else if (col.value !== 'PAID') {
                  if (col.value === inv.status && today.diff(inv.dueDate, 'days') <= 0) {
                    const invoiceitems = invoicesItems.filter(invItem => invItem.invoiceId === inv.id);
                    total += getInvoiceTotal(invoiceitems);
                  }
                } else {
                  if (col.value === inv.status) {
                    const invoiceitems = invoicesItems.filter(invItem => invItem.invoiceId === inv.id);
                    total += getInvoiceTotal(invoiceitems);
                  }
                }
              }
            });
            item[d.format('YYYY-MM-DD')] = total;
          });
          return item;
        });
        setData(_data);
      }
    },
    [invoicesItems, unit, date]
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
      tickCount: 6,
      formatter: moneyFormatter
    },
    date: {
      type: 'timeCat',
      tickCount: 8,
      nice: false,
      formatter: val => {
        return moment(val).format(dateFormat);
      }
    }
  };

  return (
    <Spin spinning={loading}>
      <Chart height={258} data={dv} forceFit scale={scale}>
        <Axis name="date" line={{ lineWidth: 1 }} tickLine={{ lineWidth: 1 }} />
        <Axis name="total" line={{ lineWidth: 1 }} tickLine={{ lineWidth: 1 }} />
        <Legend />
        <Tooltip crosshairs={{ type: 'y' }} />
        <Geom
          type="interval"
          position="date*total"
          color={['name', ['#B0BEC5', '#FFE66D', '#388E3C', '#FF6B6B']]}
          adjust={[
            {
              type: 'dodge',
              marginRatio: 1
            }
          ]}
        />
      </Chart>
    </Spin>
  );
};

const mapStateToProps = ({ invoice, invoiceItem }: IRootState) => ({
  invoices: invoice.entities,
  invoicesItems: invoiceItem.entities,
  loadingInvoices: invoice.loading,
  loadingInvoicesItems: invoice.loading
});

const mapDispatchToProps = {
  getAllInvoices,
  getInvoiceItemsByInvoicesIn
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(InvoicesPerStatus);
