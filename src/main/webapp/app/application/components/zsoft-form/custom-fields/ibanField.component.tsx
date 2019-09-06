import React, { ChangeEvent, FunctionComponent, useEffect, useRef, useState } from 'react';
import { Form, Input } from 'antd';
import { getFieldLayout, getHelper, getValidateStatus, ICommonFieldProps, isRequired } from 'app/application/common/utils/form-utils';
import { connect } from 'formik';
import IBAN from 'iban';

interface IIbanFieldPropsType extends ICommonFieldProps {
  onChange?: (value: string) => void;
  autoFocus?: boolean;
}

export const ibanParser = (value: string): string => IBAN.electronicFormat(`${value}`);

export const ibanFormatter = (value: string): string => value && IBAN.printFormat(ibanParser(value));

export const numberFilter = (value: string): string => value.replace(/[^FR\s\d]/i, '');

export const isValidIban = (value: string): boolean => IBAN.isValid(value);

export const isValidIbanInput = (value: string): boolean => value.match(/^(\s*[FR\d]\s*){0,27}$/i) != null;

export const IbanField: FunctionComponent<IIbanFieldPropsType> = props => {
  const inputRef = useRef<Input>(null);
  const { name = 'iban', label = 'IBAN', autoFocus = false, formik } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);
  const defaultValue = ibanFormatter(formik.initialValues[name]) || '';
  const [iban, setIban] = useState(defaultValue);
  const [cursorPos, setCursorPos] = useState();

  const handleChangeEvent = (e: ChangeEvent<HTMLInputElement>): void => {
    const ibanValue = numberFilter(e.target.value);
    const formattedIban = ibanFormatter(ibanValue);
    if (isValidIbanInput(formattedIban)) {
      setIban(formattedIban);
      setCursorPos(e.target.selectionStart + formattedIban.length - ibanValue.length);
    }
  };

  const handleBlurEvent = (): void => {
    formik.setFieldTouched(name);
  };

  useEffect(
    () => {
      inputRef.current.input.setSelectionRange(cursorPos, cursorPos);
      if (props.onChange) {
        props.onChange(iban);
      } else {
        formik.setFieldValue(name, iban);
      }
    },
    [iban]
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
        placeholder="FRXX XXXX XXXX XXXX XXXX XXXX XXX"
        defaultValue={defaultValue}
        value={iban}
        autoFocus={autoFocus}
        onChange={handleChangeEvent}
        onBlur={handleBlurEvent}
      />
    </Form.Item>
  );
};

export default connect(IbanField);
