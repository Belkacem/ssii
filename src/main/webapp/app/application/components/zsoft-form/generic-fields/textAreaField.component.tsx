import React, { ChangeEvent, FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Form, Input } from 'antd';
import { getFieldLayout, getHelper, getValidateStatus, ICommonFieldProps, isRequired } from 'app/application/common/utils/form-utils';
import { connect } from 'formik';
/* tslint:disable:no-submodule-imports */
import TextArea from 'antd/lib/input/TextArea';
export { default as TextArea } from 'antd/lib/input/TextArea';

interface IAutoSizeType {
  minRows?: number;
  maxRows?: number;
}

interface ITextAreaFieldPropsType extends ICommonFieldProps {
  textareaRef?: RefObject<TextArea>;
  name: string;
  onChange?: (value: string) => void;
  value?: string;
  placeholder?: string;
  autosize?: boolean | IAutoSizeType;
  autoFocus?: boolean;
  rows?: number;
  cols?: number;
}

export const TextAreaField: FunctionComponent<ITextAreaFieldPropsType> = props => {
  const textareaRef: RefObject<TextArea> = props.textareaRef || useRef<TextArea>(null);
  const { name, label, formik, autosize = { minRows: 2, maxRows: 6 } } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);

  const value = formik && formik.values && formik.values[name] ? formik.values[name] : props.value;

  const handleChangeEvent = (ev: ChangeEvent<HTMLTextAreaElement>): void => {
    if (props.onChange) {
      props.onChange(ev.target.value);
    } else {
      formik.setFieldValue(name, ev.target.value);
    }
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
      <Input.TextArea
        id={name}
        ref={textareaRef}
        value={value}
        disabled={props.disabled}
        placeholder={props.placeholder}
        onChange={handleChangeEvent}
        onBlur={handleBlurEvent}
        autosize={autosize}
        autoFocus={props.autoFocus}
        rows={props.rows}
        cols={props.cols}
      />
    </Form.Item>
  );
};

export default connect(TextAreaField);
