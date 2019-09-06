import React, { ChangeEvent, FunctionComponent, useEffect, useRef, useState } from 'react';
import { Form, Input } from 'antd';
import { getFieldLayout, getHelper, getValidateStatus, ICommonFieldProps, isRequired } from 'app/application/common/utils/form-utils';
import { connect } from 'formik';

interface IPhoneNumberFieldPropsType extends ICommonFieldProps {
  autoFocus?: boolean;
}

export const phoneNumberParser = (value: string): string => `${value}`.replace(/(^(?:(?:\+|00)33|0))|(\s)/g, '');

export const phoneNumberFormatter = (value: string): string => {
  const matches = phoneNumberParser(value).match(/(^\d)|(\d{1,2})/g);
  return '+33 ' + (matches ? matches.join(' ') : '');
};

export const numberFilter = (value: string): string => value.replace(/(^(?:(?:\+|00)33|0))|[^\s\d]/g, '');

export const isValidPhoneNumber = (value: string): boolean => value.match(/^(\s*\d\s*){9}$/) != null;

export const isValidPhoneNumberInput = (value: string): boolean => value.match(/^(?:(?:\+|00)33|0)\s(\s*\d\s*){0,9}$/) != null;

export const PhoneNumberField: FunctionComponent<IPhoneNumberFieldPropsType> = props => {
  const inputRef = useRef<Input>(null);
  const { name = 'phone', label = 'Le Numéro de Téléphone', autoFocus = false, formik } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);
  const defaultValue = phoneNumberFormatter(formik.initialValues[name]) || '';
  const [phoneNumber, setPhoneNumber] = useState(defaultValue);
  const [cursorPos, setCursorPos] = useState(phoneNumber.length);

  const handleChangeEvent = (e: ChangeEvent<HTMLInputElement>): void => {
    const phoneNumberValue = numberFilter(e.target.value);
    const formattedPhoneNumber = phoneNumberFormatter(phoneNumberValue);
    if (isValidPhoneNumberInput(formattedPhoneNumber)) {
      setPhoneNumber(formattedPhoneNumber);
      setCursorPos(e.target.selectionStart + formattedPhoneNumber.length - phoneNumberValue.length);
    }
  };

  const handleBlurEvent = (): void => {
    formik.setFieldTouched(name);
  };

  useEffect(
    () => {
      inputRef.current.input.setSelectionRange(cursorPos, cursorPos);
      formik.setFieldValue(name, phoneNumberParser(phoneNumber));
    },
    [phoneNumber]
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
      <Input
        ref={inputRef}
        name={name}
        id={name}
        type="text"
        placeholder="+33 (0)1 XX XX XX XX"
        defaultValue={defaultValue}
        value={phoneNumber}
        autoFocus={autoFocus}
        onChange={handleChangeEvent}
        onBlur={handleBlurEvent}
      />
    </Form.Item>
  );
};

export default connect(PhoneNumberField);
