import React, { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import { DatePicker, Form } from 'antd';
import { getFieldLayout, getHelper, getValidateStatus, ICommonFieldProps, isRequired } from 'app/application/common/utils/form-utils';
import { connect } from 'formik';
import moment, { Moment } from 'moment';
import { FORMAT_MONTH } from 'app/application/common/config/constants';

interface IMonthFieldPropsType extends ICommonFieldProps {
  name: string;
  placeholder?: string;
  onChange?: (month: Moment) => void;
  allowClear?: boolean;
  open?: boolean;
  disabledDate?: (currentDate: Moment) => boolean;
  dropdownClassName?: string;
  getCalendarContainer?: () => HTMLElement;
  value?: string;
  defaultValue?: string;
}

const asMoment = (date: string | Moment): Moment => {
  if (!!date) {
    if (typeof date === 'string') {
      return moment(date);
    }
    return date;
  }
  return undefined;
};

export const MonthField: FunctionComponent<IMonthFieldPropsType> = props => {
  const { name, label, formik } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);
  const value = formik && formik.values && formik.values[name] ? asMoment(formik.values[name]) : asMoment(props.value);
  const defaultValue =
    formik && formik.initialValues && formik.initialValues[name] ? asMoment(formik.initialValues[name]) : asMoment(props.defaultValue);

  const handleChangeEvent = (selectedMonth: Moment): void => {
    if (props.onChange) {
      props.onChange(selectedMonth);
    } else {
      formik.setFieldValue(name, selectedMonth);
    }
  };

  const getCalendarContainer = () => {
    if (props.getCalendarContainer()) {
      return props.getCalendarContainer();
    }
    return document.body;
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
      <DatePicker.MonthPicker
        id={name}
        format={FORMAT_MONTH}
        defaultValue={defaultValue}
        value={value}
        placeholder={props.placeholder}
        disabled={props.disabled}
        onChange={handleChangeEvent}
        allowClear={props.allowClear}
        open={props.open}
        disabledDate={props.disabledDate}
        style={{ width: '100%', height: open && 290 }}
        dropdownClassName={props.dropdownClassName}
        getCalendarContainer={getCalendarContainer}
      />
    </Form.Item>
  );
};

export default connect(MonthField);
