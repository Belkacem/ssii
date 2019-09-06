import React, { ChangeEvent, FunctionComponent, useRef, ReactNode, RefObject } from 'react';
import { Form, Input } from 'antd';
import {
  getFieldLayout,
  getHelper,
  getValidateStatus,
  ICommonFieldProps,
  isEmpty,
  isRequired
} from 'app/application/common/utils/form-utils';
import { connect } from 'formik';

interface ITextFieldPropsType extends ICommonFieldProps {
  inputRef?: RefObject<Input>;
  name: string;
  onChange?: (value: string) => void;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  allowClear?: boolean;
  readOnly?: boolean;
  prefix?: string | ReactNode;
  suffix?: string | ReactNode;
  size?: 'large' | 'default' | 'small';
  autoComplete?: 'on' | 'off' | string;
}

export const TextField: FunctionComponent<ITextFieldPropsType> = props => {
  const inputRef = props.inputRef || useRef<Input>(null);
  const { name, label, formik, placeholder, autoComplete = 'off', allowClear } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);
  const value = formik && formik.values && formik.values[name] ? formik.values[name] : props.value;
  const defaultValue = formik && formik.initialValues && formik.initialValues[name] ? formik.initialValues[name] : props.defaultValue;

  const handleChangeEvent = (ev: ChangeEvent<HTMLInputElement>): void => {
    if (props.onChange) {
      props.onChange(ev.target.value);
    } else {
      formik.setFieldValue(name, ev.target.value);
    }
  };

  const handleBlurEvent = (): void => {
    formik.setFieldTouched(name);
  };

  const floatLabel = !label && placeholder && placeholder;
  const className = !label && placeholder ? 'ant-form-item-float-label' : '';
  return (
    <Form.Item
      className={className}
      label={label}
      required={required}
      {...formItemLayout}
      validateStatus={validateStatus}
      help={helper}
      hasFeedback
      htmlFor={name}
    >
      {floatLabel && <span className={`float-label ${isEmpty(value) ? 'float-label-clear' : ''}`}>{floatLabel}</span>}
      <Input
        ref={inputRef}
        id={name}
        name={name}
        defaultValue={defaultValue}
        value={value}
        placeholder={placeholder}
        onChange={handleChangeEvent}
        onBlur={handleBlurEvent}
        disabled={props.disabled}
        readOnly={props.readOnly}
        {...!!props.prefix && { prefix: props.prefix }}
        {...!!props.suffix && { suffix: props.suffix }}
        size={props.size}
        autoFocus={props.autoFocus}
        autoComplete={autoComplete}
        allowClear={allowClear}
      />
    </Form.Item>
  );
};

export default connect(TextField);
