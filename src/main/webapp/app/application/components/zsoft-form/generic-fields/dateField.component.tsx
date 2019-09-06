import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import { DatePicker, Form } from 'antd';
import { getFieldLayout, getHelper, getValidateStatus, ICommonFieldProps, isRequired } from 'app/application/common/utils/form-utils';
import { connect } from 'formik';
import moment, { Moment } from 'moment';
import { FORMAT_DATE_PICKER } from 'app/application/common/config/constants';

interface IDateFieldPropsType extends ICommonFieldProps {
  name: string;
  autoFocus?: boolean;
  placeholder?: string;
  onChange?: (value: Moment) => void;
  allowClear?: boolean;
  format?: string;
  disabledDate?: (currentDate: Moment) => boolean;
  defaultPickerValue?: Moment;
  value?: Moment;
  defaultValue?: Moment;
}

const validMoment = (date: string | Moment) =>
  typeof date === 'string' ? (!!date && moment(date).isValid() ? moment(date) : undefined) : !!date && date.isValid() ? date : undefined;

export const DateField: FunctionComponent<IDateFieldPropsType> = props => {
  const {
    name,
    label,
    // autoFocus = false,
    allowClear,
    formik,
    format = FORMAT_DATE_PICKER,
    disabledDate,
    defaultPickerValue,
    placeholder
  } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);

  const initialValue = (formik.initialValues && formik.initialValues[name]) || null;
  const defaultValue = initialValue && initialValue[name] ? validMoment(initialValue[name]) : validMoment(props.defaultValue);
  const value = formik && formik.values && formik.values[name] ? validMoment(formik.values[name]) : validMoment(props.value);

  const handleChangeEvent = (selectedDate: Moment): void => {
    if (props.onChange) {
      props.onChange(selectedDate);
    } else {
      formik.setFieldValue(name, selectedDate);
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
      <DatePicker
        id={name}
        format={format}
        value={value}
        defaultValue={defaultValue}
        disabledDate={disabledDate}
        defaultPickerValue={defaultPickerValue}
        placeholder={placeholder}
        disabled={props.disabled}
        onChange={handleChangeEvent}
        allowClear={allowClear}
        // autoFocus={autoFocus}
        className="fullwidth"
      />
    </Form.Item>
  );
};

export default connect(DateField);
