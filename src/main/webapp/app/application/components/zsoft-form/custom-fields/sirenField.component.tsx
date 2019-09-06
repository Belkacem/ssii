import React, { ChangeEvent, FunctionComponent, useEffect, useRef, useState } from 'react';
import { Form, Input, Tooltip } from 'antd';
import { getFieldLayout, getHelper, getValidateStatus, ICommonFieldProps, isRequired } from 'app/application/common/utils/form-utils';
import { connect } from 'formik';

interface ISirenFieldPropsType extends ICommonFieldProps {
  onChange?: (value: string) => void;
  autoFocus?: boolean;
}

export const sirenParser = (value: string): string => `${value}`.replace(/\s*/g, '');

export const sirenFormatter = (value: string): string => {
  const matches = sirenParser(value).match(/\d{1,3}/g);
  return matches ? matches.join(' ') : '';
};

export const numberFilter = (value: string): string => value.replace(/[^\s\d]/g, '');

export const isValidSiren = (value: string): boolean => value.match(/^(\s*\d\s*){9}$/) != null;

export const isValidSirenInput = (value: string): boolean => value.match(/^(\s*\d\s*){0,9}$/) != null;

export const SirenField: FunctionComponent<ISirenFieldPropsType> = props => {
  const inputRef = useRef<Input>(null);
  const { name = 'siren', label = 'Le Numéro de Siren', autoFocus = false, formik } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);
  const defaultValue = formik.initialValues[name] || '';
  const [siren, setSiren] = useState(defaultValue);
  const [cursorPos, setCursorPos] = useState();

  const handleChangeEvent = (e: ChangeEvent<HTMLInputElement>): void => {
    const sirenValue = numberFilter(e.target.value);
    const formattedSiren = sirenFormatter(sirenValue);
    if (isValidSirenInput(formattedSiren)) {
      setSiren(formattedSiren);
      setCursorPos(e.target.selectionStart + formattedSiren.length - sirenValue.length);
    }
  };

  const handleBlurEvent = (): void => {
    formik.setFieldTouched(name);
  };

  useEffect(
    () => {
      inputRef.current.input.setSelectionRange(cursorPos, cursorPos);
      if (props.onChange) {
        props.onChange(siren);
      } else {
        formik.setFieldValue(name, siren);
      }
    },
    [siren]
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
      <Tooltip
        trigger="hover"
        placement="bottomRight"
        title={
          <>
            <b>Le Numéro Siren</b>
            <br />
            <small>Le numéro Siren correspond à une série unique de 9 chiffres, attribué par l’INSEE à chaque entreprise.</small>
          </>
        }
        children={
          <Input
            ref={inputRef}
            name={name}
            id={name}
            type="text"
            placeholder="XXX XXX XXX"
            defaultValue={defaultValue}
            value={siren}
            autoFocus={autoFocus}
            onChange={handleChangeEvent}
            onBlur={handleBlurEvent}
          />
        }
      />
    </Form.Item>
  );
};

export default connect(SirenField);
