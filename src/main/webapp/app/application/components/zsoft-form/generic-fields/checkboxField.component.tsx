import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import { Form, Checkbox } from 'antd';
import { getFieldLayout, getHelper, getValidateStatus, ICommonFieldProps, isRequired } from 'app/application/common/utils/form-utils';
import { connect } from 'formik';

interface ICheckboxFieldPropsType extends ICommonFieldProps {
  name: string;
  onChange?: (value: any) => void;
  optionLabel: string;
  checked?: boolean;
  defaultChecked?: boolean;
}

export const CheckboxField: FunctionComponent<ICheckboxFieldPropsType> = props => {
  const { name, label, formik, optionLabel } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);

  const checked = formik && formik.values && formik.values[name] ? formik.values[name] : props.checked;
  const defaultChecked = formik && formik.initialValues && formik.initialValues[name] ? formik.initialValues[name] : props.defaultChecked;

  const handleChangeEvent = (ev): void => {
    if (props.onChange) {
      props.onChange(ev.target.checked);
    } else {
      formik.setFieldValue(name, ev.target.checked);
      formik.setFieldTouched(name);
    }
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
      <Checkbox
        id={name}
        defaultChecked={defaultChecked}
        checked={checked}
        disabled={props.disabled}
        onChange={handleChangeEvent}
        children={optionLabel}
      />
    </Form.Item>
  );
};

export default connect(CheckboxField);
