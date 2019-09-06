import React, { ChangeEvent, FunctionComponent } from 'react';
import { Form, Select } from 'antd';
import {
  getFieldLayout,
  getHelper,
  getValidateStatus,
  ICommonFieldProps,
  isRequired,
  isEmpty
} from 'app/application/common/utils/form-utils';
import { connect } from 'formik';

type SelectValueType = string | number | string[] | number[];

interface ISelectOptionProps {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface ISelectFieldPropsType extends ICommonFieldProps {
  name: string;
  onChange?: (value: SelectValueType) => void;
  autoFocus?: boolean;
  multiple?: boolean;
  placeholder?: string;
  showSearch?: boolean;
  options: ISelectOptionProps[];
  allowClear?: boolean;
  value?: SelectValueType;
  defaultValue?: SelectValueType;
}

export const SelectField: FunctionComponent<ISelectFieldPropsType> = props => {
  const { name, label, autoFocus = false, formik, multiple = false, showSearch = true, options, placeholder } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);

  const value = formik && formik.values && formik.values[name] ? formik.values[name] : props.value;
  const defaultValue = formik && formik.initialValues && formik.initialValues[name] ? formik.initialValues[name] : props.defaultValue;

  const handleChangeEvent = (selectedItem: SelectValueType): void => {
    if (props.onChange) {
      props.onChange(selectedItem);
    } else {
      formik.setFieldValue(name, selectedItem);
    }
  };

  const handleBlurEvent = (): void => {
    formik.setFieldTouched(name);
  };

  const floatLabel = !label && placeholder && placeholder;
  const className = !label && placeholder ? 'ant-form-item-float-label' : '';
  return (
    <Form.Item
      label={label}
      className={className}
      required={required}
      {...formItemLayout}
      validateStatus={validateStatus}
      help={helper}
      hasFeedback
      htmlFor={name}
    >
      {floatLabel && <span className={`float-label ${isEmpty(value) ? 'float-label-clear' : ''}`}>{floatLabel}</span>}
      <Select
        id={name}
        defaultValue={defaultValue}
        value={value}
        disabled={props.disabled}
        placeholder={placeholder}
        showSearch={showSearch}
        mode={multiple ? 'multiple' : 'default'}
        optionFilterProp="children"
        className="fullwidth"
        autoFocus={autoFocus}
        onChange={handleChangeEvent}
        onBlur={handleBlurEvent}
        allowClear={props.allowClear}
        children={
          props.children ||
          options.map(option => (
            <Select.Option key={`${name}-${option.value}`} value={option.value} children={option.label} disabled={option.disabled} />
          ))
        }
      />
    </Form.Item>
  );
};

export default connect(SelectField);
