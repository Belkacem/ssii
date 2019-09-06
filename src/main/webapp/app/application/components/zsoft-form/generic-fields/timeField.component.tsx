import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import { TimePicker, Form } from 'antd';
import { getFieldLayout, getHelper, getValidateStatus, ICommonFieldProps, isRequired } from 'app/application/common/utils/form-utils';
import { connect } from 'formik';
import moment, { Moment } from 'moment';

interface ITimeFieldPropsType extends ICommonFieldProps {
  name: string;
  placeholder?: string;
  onChange?: (time: Moment) => void;
  allowClear?: boolean;
  hourStep?: number;
  minuteStep?: number;
  value?: Moment;
  defaultValue?: Moment;
  defaultOpenValue?: Moment;
}

const validTime = (date: string | Moment) =>
  typeof date === 'string' ? (!!date && moment(date).isValid() ? moment(date) : undefined) : !!date && date.isValid() ? date : undefined;

export const TimeField: FunctionComponent<ITimeFieldPropsType> = props => {
  const { name, label, allowClear, formik, placeholder } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);

  const initialValue = (formik.initialValues && formik.initialValues[name]) || null;
  const defaultValue = initialValue && initialValue[name] ? validTime(initialValue[name]) : validTime(props.defaultValue);
  const value = formik && formik.values && formik.values[name] ? validTime(formik.values[name]) : validTime(props.value);

  const handleChangeEvent = (selecedTime: Moment): void => {
    if (props.onChange) {
      props.onChange(selecedTime);
    } else {
      formik.setFieldValue(name, selecedTime);
    }
  };

  return (
    <Form.Item label={label} required={required} {...formItemLayout} validateStatus={validateStatus} help={helper} hasFeedback>
      <TimePicker
        format="HH:mm"
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={props.disabled}
        onChange={handleChangeEvent}
        allowClear={allowClear}
        className="fullwidth"
        hourStep={props.hourStep}
        minuteStep={props.minuteStep}
        defaultOpenValue={props.defaultOpenValue}
      />
    </Form.Item>
  );
};

export default connect(TimeField);
