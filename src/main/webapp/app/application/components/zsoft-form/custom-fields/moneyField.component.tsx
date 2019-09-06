import React, { ChangeEvent, FunctionComponent, useEffect, useRef, useState } from 'react';
import { Form, InputNumber } from 'antd';
import {
  getFieldLayout,
  getHelper,
  getValidateStatus,
  ICommonFieldProps,
  isRequired,
  FieldLabelType
} from 'app/application/common/utils/form-utils';
import { connect } from 'formik';
import { DEFAULT_CURRENCY, DEFAULT_MONEY_PRECISION, DEFAULT_MONEY_SEPARATOR } from 'app/application/common/config/constants';

interface IMoneyFieldPropsType extends ICommonFieldProps {
  name: string;
  label: FieldLabelType;
  autoFocus?: boolean;
}

export const moneyParser = (value: string): any => value.replace(/[^0-9.-]+/g, '');

export const moneyFormatter = (value: number): string =>
  `${DEFAULT_CURRENCY} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, DEFAULT_MONEY_SEPARATOR);

export const MoneyField: FunctionComponent<IMoneyFieldPropsType> = props => {
  const inputRef = useRef<InputNumber>(null);
  const { name, label, autoFocus = false, formik } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);
  const defaultValue = formik.initialValues[name] || 0;

  const handleChangeEvent = (value: number): void => {
    formik.setFieldValue(name, value);
  };

  const handleBlurEvent = (): void => {
    formik.setFieldTouched(name);
  };

  return (
    <Form.Item
      label={label}
      required={required}
      {...formItemLayout}
      validateStatus={validateStatus}
      help={helper}
      hasFeedback
      htmlFor={name}
    >
      <InputNumber
        ref={inputRef}
        name={name}
        id={name}
        type="text"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        onChange={handleChangeEvent}
        onBlur={handleBlurEvent}
        formatter={moneyFormatter}
        parser={moneyParser}
        min={0}
        precision={DEFAULT_MONEY_PRECISION}
        className="ant-input fullwidth"
      />
    </Form.Item>
  );
};

export default connect(MoneyField);
