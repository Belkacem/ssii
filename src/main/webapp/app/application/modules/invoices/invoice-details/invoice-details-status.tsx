import React, { CSSProperties, FunctionComponent } from 'react';
import { IInvoice, InvoiceStatus } from 'app/shared/model/invoice.model';
import moment from 'moment';
import { Tag, Icon } from 'antd';
import { FORMAT_DATE } from 'app/application/common/config/constants';

interface IInvoiceDetailsStatusProps {
  invoice: IInvoice;
  type?: 'icon' | 'tag' | 'text';
}

const tagStyle: CSSProperties = {
  borderRadius: 20,
  width: 70,
  textAlign: 'center',
  fontWeight: 'bold'
};

export const InvoiceDetailsStatus: FunctionComponent<IInvoiceDetailsStatusProps> = props => {
  const { invoice, type = 'tag' } = props;
  const paymentDate = !!invoice.paymentDate && `, le ${moment(invoice.paymentDate).format(FORMAT_DATE)}`;
  if (type === 'tag') {
    if (invoice.status === InvoiceStatus.PAID) {
      return (
        <>
          <Tag color="#4CAF50" style={tagStyle} title={`Payée${paymentDate}`} children="Payée" />
          <small>{!!invoice.paymentDate && moment(invoice.paymentDate).format(FORMAT_DATE)}</small>
        </>
      );
    } else {
      if (moment().diff(invoice.dueDate, 'days') > 0) {
        return <Tag color="#F44336" style={tagStyle} children="En retard" />;
      } else {
        switch (invoice.status) {
          case InvoiceStatus.DRAFT:
            return <Tag color="gray" style={tagStyle} children="Brouillon" />;
          case InvoiceStatus.SENT:
            return <Tag color="#108ee9" style={tagStyle} children="Envoyée" />;
          default:
            return null;
        }
      }
    }
  } else if (type === 'text') {
    if (invoice.status === InvoiceStatus.PAID) {
      return (
        <span style={{ color: '#4CAF50' }}>
          Payée
          {paymentDate}
        </span>
      );
    } else {
      if (moment().diff(invoice.dueDate, 'days') > 0) {
        return <span style={{ color: '#F44336' }}>En retard</span>;
      } else {
        switch (invoice.status) {
          case InvoiceStatus.DRAFT:
            return <span style={{ color: '#5a5a5a' }}>Brouillon</span>;
          case InvoiceStatus.SENT:
            return <span style={{ color: '#108ee9' }}>Envoyée</span>;
          default:
            return null;
        }
      }
    }
  } else {
    if (invoice.status === InvoiceStatus.PAID) {
      return <Icon theme="twoTone" twoToneColor="#52c41a" type="check-circle" title={`Payée${paymentDate}`} />;
    } else {
      if (moment().diff(invoice.dueDate, 'days') > 0) {
        return <Icon theme="twoTone" twoToneColor="#F44336" type="clock-circle" title="En retard" />;
      } else {
        switch (invoice.status) {
          case InvoiceStatus.DRAFT:
            return <Icon type="exclamation-circle" title="Brouillon" />;
          case InvoiceStatus.SENT:
            return <Icon theme="twoTone" twoToneColor="#108ee9" type="mail" title="Envoyer" />;
          default:
            return null;
        }
      }
    }
  }
};
