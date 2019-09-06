import React, { FunctionComponent } from 'react';
import { IInvoice, InvoiceStatus } from 'app/shared/model/invoice.model';
import moment from 'moment';
import { Divider } from 'antd';

interface IInvoiceDetailsOverDueProps {
  invoice: IInvoice;
  divider?: boolean;
}

export const InvoiceDetailsOverDue: FunctionComponent<IInvoiceDetailsOverDueProps> = props => {
  const { invoice, divider = false } = props;
  if (!!invoice.id && invoice.status !== InvoiceStatus.PAID) {
    const text =
      moment().diff(invoice.dueDate, 'days') > 0 ? (
        <span style={{ color: '#F44336' }}>Due {moment(invoice.dueDate).fromNow()}</span>
      ) : (
        <span style={{ color: '#FF9800' }}>Due {moment(invoice.dueDate).fromNow()}</span>
      );
    return (
      <>
        {divider && <Divider type="vertical" />}
        <b>{text}</b>
      </>
    );
  }
  return null;
};
