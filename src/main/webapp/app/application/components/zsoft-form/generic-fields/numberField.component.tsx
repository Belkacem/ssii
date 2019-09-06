import React, { ChangeEvent, FunctionComponent, useEffect, useRef, useState } from 'react';
import { Form, InputNumber } from 'antd';
import { getFieldLayout, getHelper, getValidateStatus, ICommonFieldProps, isRequired } from 'app/application/common/utils/form-utils';
import { connect } from 'formik';

interface INumberFieldPropsType extends ICommonFieldProps {
  name: string;
  label: string;
  autoFocus?: boolean;
  allowClear?: boolean;
  min?: number;
  max?: number;
  step?: number | 'any';
  prefix?: string;
  suffix?: string;
  onChange?: (value: number) => void;
}

export const NumberField: FunctionComponent<INumberFieldPropsType> = props => {
  const inputNumberRef = useRef<InputNumber>(null);
  const { name, label, autoFocus = false, suffix, prefix, formik, allowClear = false } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);
  const defaultValue = formik.initialValues[name];
  const [number, setNumber] = useState(null);
  const [cursorPos, setCursorPos] = useState();

  useEffect(
    () => {
      if (defaultValue) {
        setNumber(defaultValue);
      } else if (!allowClear) {
        setNumber(0);
      }
    },
    [defaultValue]
  );

  const numberParser = (value: string): any => value.replace(/[^0-9.-]+/g, '');

  const numberFormatter = (value: number): string => `${!!prefix ? `${prefix} ` : ''}${value}${!!suffix ? ` ${suffix}` : ''}`;

  const handleChangeEvent = (value: number): void => {
    setNumber(value);
    setCursorPos(`${value}`.length + (!!prefix ? prefix.length + 1 : 0));
  };

  const handleBlurEvent = (): void => {
    formik.setFieldTouched(name);
  };

  useEffect(
    () => {
      // @ts-ignore
      inputNumberRef.current.inputNumberRef.input.setSelectionRange(cursorPos, cursorPos);
      if (props.onChange) {
        props.onChange(number);
      } else {
        formik.setFieldValue(name, number);
      }
    },
    [number]
  );

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
        ref={inputNumberRef}
        name={name}
        id={name}
        type="text"
        defaultValue={defaultValue}
        value={number}
        autoFocus={autoFocus}
        disabled={props.disabled}
        onChange={handleChangeEvent}
        onBlur={handleBlurEvent}
        formatter={numberFormatter}
        parser={numberParser}
        min={props.min}
        max={props.max}
        step={props.step}
        className="ant-input fullwidth"
        style={props.style}
      />
    </Form.Item>
  );
};

export default connect(NumberField);
