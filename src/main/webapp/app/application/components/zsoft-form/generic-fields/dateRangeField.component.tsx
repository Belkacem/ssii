import React, { ChangeEvent, FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { DatePicker, Form } from 'antd';
import { FormItemLayout, getFieldLayout, isRequired } from 'app/application/common/utils/form-utils';
import { connect, FormikContext } from 'formik';
import { Moment } from 'moment';
import { FORMAT_DATE_PICKER } from 'app/application/common/config/constants';

interface IDateRangeFieldPropsType {
  label?: string;
  name: [string, string];
  layout?: FormItemLayout;
  formik?: FormikContext<any>;
  loading?: boolean;
  disabled?: boolean;
  helper?: string;
  autoFocus?: boolean;
  placeholder?: [string, string];
  onChange?: (startDate: Moment, endDate: Moment) => void;
  allowClear?: boolean;
  format?: string;
  disabledDate?: (currentDate: Moment) => boolean;
  defaultPickerValue?: Moment;
  dropdownClassName?: string;
  dateRender?: (currentDate: Moment, today: Moment) => ReactNode;
  value?: [Moment, Moment];
  defaultValue?: [Moment, Moment];
}

export const getValidateStatus = (loading: boolean, names: string[], { errors, touched, submitCount }: FormikContext<any>) => {
  if (loading) {
    return 'validating';
  }
  let validationStatus = null;
  for (const name of names) {
    if (touched[name] || submitCount > 0) {
      if (errors[name]) {
        validationStatus = 'error';
        break;
      } else {
        validationStatus = 'success';
      }
    }
  }
  return validationStatus;
};

export const getHelper = (helper: string, names: string[], { errors, touched, submitCount }: FormikContext<any>) => {
  for (const name of names) {
    if (touched[name] || submitCount > 0) {
      if (errors[name]) {
        return errors[name];
      }
    }
  }
  return helper;
};

export const DateRangeField: FunctionComponent<IDateRangeFieldPropsType> = props => {
  const {
    formik,
    label = 'Période',
    name = ['start', 'end'],
    format = FORMAT_DATE_PICKER,
    placeholder = ['Date début', 'Date fin']
  } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = name[0] && isRequired(formik, name[0]);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);
  const defaultPickerValue: [Moment, Moment] = props.defaultPickerValue ? [props.defaultPickerValue, props.defaultPickerValue] : undefined;

  const handleChangeEvent = (selectedDates: Moment[]): void => {
    if (props.onChange) {
      props.onChange(selectedDates[0], selectedDates[1]);
    } else {
      formik.setFieldValue(name[0], selectedDates[0]);
      formik.setFieldValue(name[1], selectedDates[1]);
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
      htmlFor={name[0]}
    >
      <DatePicker.RangePicker
        id={name[0]}
        format={format}
        // defaultValue={props.defaultValue}
        value={props.value}
        disabledDate={props.disabledDate}
        defaultPickerValue={defaultPickerValue}
        placeholder={[placeholder[0], placeholder[0]]}
        disabled={props.disabled}
        onChange={handleChangeEvent}
        allowClear={props.allowClear}
        className="fullwidth"
        dropdownClassName={props.dropdownClassName}
        dateRender={props.dateRender}
      />
    </Form.Item>
  );
};

export default connect(DateRangeField);
