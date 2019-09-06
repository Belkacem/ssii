import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { formatMoney } from 'app/application/common/utils/invoice-utils';
import { Alert, Button, Col, DatePicker, Icon, Input, InputNumber, Row, Spin } from 'antd';
import { IInvoiceItem } from 'app/shared/model/invoice-item.model';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import moment, { Moment } from 'moment';

interface IInvoiceItemsFormProps {
  formProps: any;
  loading?: boolean;
  defaultTax?: number;
}

export const InvoiceItemsForm: FunctionComponent<IInvoiceItemsFormProps> = props => {
  const focusedInputRef: RefObject<Input> = useRef<Input>(null);
  const [focusLastItem, setFocusLastItem] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { formProps, loading = true, defaultTax = 0 } = props;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(
    () => {
      if (isMounted && formProps.values.items.length === 0) {
        handleAppendItem();
      }
    },
    [isMounted]
  );

  useEffect(
    () => {
      if (focusLastItem && focusedInputRef.current) {
        focusedInputRef.current.focus();
        setFocusLastItem(false);
      }
    },
    [focusLastItem]
  );

  const handleAppendItem = () => {
    const item: IInvoiceItem = {
      name: '',
      date: formProps.values.issueDate ? formProps.values.issueDate : undefined,
      description: '',
      quantity: 0,
      unitPrice: 0,
      tax: defaultTax
    };
    formProps.setFieldValue('items', [...formProps.values.items, item]);
    setFocusLastItem(true);
  };

  const handleRemoveItem = removedItem => {
    const items = formProps.values.items.filter(item => item !== removedItem);
    formProps.setFieldValue('items', items);
    setFocusLastItem(true);
  };

  const setItemValue = (itemIndex, fieldName, ev) => {
    if (typeof ev === 'string' || typeof ev === 'number') {
      formProps.setFieldValue(`items[${itemIndex}].${fieldName}`, ev);
    } else if (ev && ev.target) {
      formProps.setFieldValue(`items[${itemIndex}].${fieldName}`, ev.target.value);
    }
  };

  const setItemDate = (itemIndex, date: Moment) => {
    formProps.setFieldValue(`items[${itemIndex}].date`, date);
  };

  const setItemTouched = (itemIndex, fieldName) => {
    formProps.setFieldTouched(`items[${itemIndex}].${fieldName}`);
  };

  const formatMoneyCurrency = value => (value ? `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '€ 0');

  const parseMoneyCurrency = value => value.replace(/€\s?|(\s*)/g, '');

  const formatPercent = value => (value ? `${value}%` : '0%');

  const parsePercent = value => value.replace('%', '');

  const renderRow = (item, index) => {
    const errors = formProps.errors && formProps.errors.items && formProps.errors.items[index];
    const values = formProps.values.items[index];
    const rowTotal =
      values && values.quantity && values.unitPrice
        ? values.quantity * values.unitPrice + values.quantity * values.unitPrice * (values.tax / 100)
        : 0;
    const focused = focusLastItem && index === formProps.values.items.length - 1;
    const date = values && values.date && moment(values.date, FORMAT_DATE_SERVER);
    return (
      <tr key={index} className="ant-table-row">
        <td className={errors && errors.date ? 'has-error' : ''}>
          <DatePicker
            value={date}
            format="DD/MM/YYYY"
            placeholder="Date"
            className="table-input"
            onChange={setItemDate.bind(null, index)}
            style={{ minWidth: 120 }}
            allowClear={false}
          />
        </td>
        <td className={errors && errors.name ? 'has-error' : ''}>
          <Input
            ref={focused ? focusedInputRef : null}
            name={`items[${index}].name`}
            value={values && values.name ? values.name : ''}
            placeholder="Nom de l'article"
            className="table-input"
            onChange={setItemValue.bind(null, index, 'name')}
            onBlur={setItemTouched.bind(null, index, 'name')}
            style={{ minWidth: 180 }}
          />
        </td>
        <td className={errors && errors.quantity ? 'has-error' : ''}>
          <InputNumber
            name={`items[${index}].quantity`}
            value={values && values.quantity ? values.quantity : 0}
            placeholder="Quantity"
            className="table-input"
            onChange={setItemValue.bind(null, index, 'quantity')}
            onBlur={setItemTouched.bind(null, index, 'quantity')}
            style={{ width: 60 }}
          />
        </td>
        <td className={errors && errors.unitPrice ? 'has-error' : ''}>
          <InputNumber
            name={`items[${index}].unitPrice`}
            value={values && values.unitPrice ? values.unitPrice : 0}
            placeholder="Prix unitaire"
            className="table-input"
            onChange={setItemValue.bind(null, index, 'unitPrice')}
            onBlur={setItemTouched.bind(null, index, 'unitPrice')}
            style={{ width: 100 }}
            min={0}
            formatter={formatMoneyCurrency}
            parser={parseMoneyCurrency}
          />
        </td>
        <td className={errors && errors.tax ? 'has-error' : ''}>
          <InputNumber
            name={`items[${index}].tax`}
            value={values && values.tax ? values.tax : 0}
            placeholder="TVA"
            className="table-input"
            onChange={setItemValue.bind(null, index, 'tax')}
            onBlur={setItemTouched.bind(null, index, 'tax')}
            style={{ width: 65 }}
            min={0}
            max={100}
            step={1}
            formatter={formatPercent}
            parser={parsePercent}
          />
        </td>
        <td className="td-total">{formatMoney(rowTotal)}</td>
        <td>
          <Button block icon="delete" type="danger" onClick={handleRemoveItem.bind(null, item)} />
        </td>
      </tr>
    );
  };

  const getTotalHt = items => items.map(item => item.quantity * item.unitPrice).reduce((total, itemTotal) => total + itemTotal, 0);

  const getTotalTva = items =>
    items.map(item => item.quantity * item.unitPrice * (item.tax / 100)).reduce((total, itemTotal) => total + itemTotal, 0);

  const getTotalTTC = items =>
    items
      .map(item => item.quantity * item.unitPrice + item.quantity * item.unitPrice * (item.tax / 100))
      .reduce((total, itemTotal) => total + itemTotal, 0);

  return (
    <>
      <div className="ant-table ant-table-middle invoice-items-table">
        <div className="ant-table-content">
          <div className="ant-table-body">
            <table>
              <thead className="ant-table-thead">
                <tr>
                  <th style={{ width: 120 }}>Date</th>
                  <th>Désignation</th>
                  <th style={{ width: 60 }}>Qté</th>
                  <th style={{ width: 100 }}>Prix unitaire (HT)</th>
                  <th style={{ width: 65 }}>% TVA</th>
                  <th style={{ width: 100, textAlign: 'right' }}>Sous Total (TTC)</th>
                  <th style={{ width: 45, textAlign: 'center' }}>
                    <Icon type="setting" />
                  </th>
                </tr>
              </thead>
              {!loading &&
                typeof formProps.errors.items === 'string' && (
                  <tbody>
                    <tr>
                      <td colSpan={7}>
                        <Alert message={<small>{formProps.errors.items}</small>} type="error" showIcon banner />
                      </td>
                    </tr>
                  </tbody>
                )}
              <tbody className="ant-table-tbody">
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <Spin spinning />
                    </td>
                  </tr>
                ) : (
                  formProps.values.items.map((item, index) => renderRow(item, index))
                )}
              </tbody>
            </table>
          </div>
          <div className="ant-table-footer">
            <a onClick={handleAppendItem}>
              <small>
                <Icon type="plus" /> Ajouter un élément
              </small>
            </a>
          </div>
        </div>
      </div>
      <Row>
        <Col md={{ offset: 16, span: 8 }} sm={{ offset: 12, span: 12 }}>
          <table className="invoice-totals-table">
            <tbody className="ant-table-tbody">
              <tr>
                <td>Total HT</td>
                <td>{formatMoney(getTotalHt(formProps.values.items))}</td>
              </tr>
              <tr>
                <td>TVA</td>
                <td>{formatMoney(getTotalTva(formProps.values.items))}</td>
              </tr>
              <tr>
                <td>Total TTC</td>
                <td>{formatMoney(getTotalTTC(formProps.values.items))}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
    </>
  );
};
