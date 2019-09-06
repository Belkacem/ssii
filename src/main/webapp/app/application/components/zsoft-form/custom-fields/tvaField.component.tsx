import React, { ChangeEvent, FunctionComponent, useEffect, useRef, useState } from 'react';
import { Form, Input, Tooltip } from 'antd';
import { getFieldLayout, getHelper, getValidateStatus, ICommonFieldProps, isRequired } from 'app/application/common/utils/form-utils';
import { connect } from 'formik';

interface ITvaFieldPropsType extends ICommonFieldProps {
  onChange?: (value: string) => void;
}

export const tvaParser = (value: string): string => `${value}`.replace(/\s*/g, '');

export const tvaFormatter = (value: string): string => {
  const tvaValue = tvaParser(value);
  const matches = tvaValue.length === 13 ? tvaValue.match(/(FR)?([0-9A-Z]{1,2})?[0-9]{9}/i) : tvaValue.match(/(FR)?([0-9A-Z])?[0-9]{0,9}/i);
  if (matches && matches.length === 3 && matches[1] && matches[2]) {
    const validationKey = matches[2];
    return matches[1] + validationKey + ' ' + tvaValue.substring(validationKey.length + 2);
  }
  return value;
};

export const numberFilter = (value: string): string => value.replace(/[^FR\s\d]/i, '');

export const isValidTva = (value: string): boolean => value.match(/^(FR\d{1,2}\s\d{9})$/i) != null;

export const isValidTvaInput = (value: string): boolean => value.match(/^(\s*[FR\d]\s*){0,13}$/i) != null;

export const TvaField: FunctionComponent<ITvaFieldPropsType> = props => {
  const inputRef = useRef<Input>(null);
  const { name = 'tva', label = 'N° TVA', formik } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);
  const defaultValue = formik.initialValues[name] || '';
  const [tva, setTva] = useState(defaultValue);
  const [cursorPos, setCursorPos] = useState();

  const handleChangeEvent = (e: ChangeEvent<HTMLInputElement>): void => {
    const tvaValue = numberFilter(e.target.value);
    const formattedTva = tvaFormatter(tvaValue);
    if (isValidTvaInput(formattedTva)) {
      setTva(formattedTva);
      setCursorPos(e.target.selectionStart + formattedTva.length - tvaValue.length);
    }
  };

  const handleBlurEvent = (): void => {
    formik.setFieldTouched(name);
  };

  useEffect(
    () => {
      inputRef.current.input.setSelectionRange(cursorPos, cursorPos);
      if (props.onChange) {
        props.onChange(tva);
      } else {
        formik.setFieldValue(name, tva);
      }
    },
    [tva]
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
        trigger="focus"
        placement="bottomRight"
        title={
          <>
            <b>Numéro TVA intracommunautaire</b>
            <br />
            <small>
              Le Numéro de TVA Intracommunautaire (Numéro d’Identification Fiscale), est un numéro attribué aux entreprises européennes
              assujetties à la TVA.
            </small>
          </>
        }
        children={
          <Input
            ref={inputRef}
            name={name}
            id={name}
            type="text"
            placeholder="FRXXXXXXXXXXX"
            defaultValue={defaultValue}
            value={tva}
            onChange={handleChangeEvent}
            onBlur={handleBlurEvent}
          />
        }
      />
    </Form.Item>
  );
};

export default connect(TvaField);
