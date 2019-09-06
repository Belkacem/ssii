import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import { Form, Radio } from 'antd';
import { getFieldLayout, getHelper, getValidateStatus, ICommonFieldProps, isRequired } from 'app/application/common/utils/form-utils';
import { connect } from 'formik';

interface IRadioOptionProps {
  label: string;
  value: any;
  disabled?: boolean;
}

interface ISelectFieldPropsType extends ICommonFieldProps {
  name: string;
  onChange?: (value: any) => void;
  options?: IRadioOptionProps[];
  value?: any;
  defaultValue?: any;
}

export const RadioFields: FunctionComponent<ISelectFieldPropsType> = props => {
  const { name, label, formik, options } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);

  const value = formik && formik.values && formik.values[name] ? formik.values[name] : props.value;
  const defaultValue = formik && formik.initialValues && formik.initialValues[name] ? formik.initialValues[name] : props.defaultValue;

  const handleChangeEvent = (ev): void => {
    if (props.onChange) {
      props.onChange(ev.target.value);
    } else {
      formik.setFieldValue(name, ev.target.value);
    }
  };
  const labelForHtml = value && options && options.length > 0 ? `${name}-${value}` : name;
  return (
    <Form.Item
      label={label}
      required={required}
      {...formItemLayout}
      validateStatus={validateStatus}
      help={helper}
      hasFeedback
      htmlFor={labelForHtml}
    >
      <Radio.Group
        id={name}
        defaultValue={defaultValue}
        value={value}
        disabled={props.disabled}
        onChange={handleChangeEvent}
        children={
          props.children ||
          options.map(option => (
            <Radio
              key={`${name}-${option.value}`}
              id={`${name}-${option.value}`}
              value={option.value}
              children={option.label}
              disabled={option.disabled}
            />
          ))
        }
      />
    </Form.Item>
  );
};

export default connect(RadioFields);
