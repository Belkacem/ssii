import React, { ChangeEvent, FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Form, Select, Input } from 'antd';
import { getFieldLayout, getHelper, getValidateStatus, ICommonFieldProps, isRequired } from 'app/application/common/utils/form-utils';
import { connect } from 'formik';

interface IEmailsFieldPropsType extends ICommonFieldProps {
  selectRef?: RefObject<Select>;
  onChange?: (emails: string[]) => void;
  autoFocus?: boolean;
  allowClear?: boolean;
  value?: string[];
  defaultValue?: string[];
  domainNames?: string[];
}

export const EmailsField: FunctionComponent<IEmailsFieldPropsType> = props => {
  const selectRef = props.selectRef || useRef<Select>(null);
  const { name = 'emails', label = 'E-mails', formik, domainNames } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const helper = getHelper(props.helper, name, formik);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleChangeEvent = (emails: string[]): void => {
    if (props.onChange) {
      props.onChange(emails);
    } else {
      formik.setFieldValue(name, emails);
    }
  };

  const handleBlurEvent = (): void => {
    formik.setFieldTouched(name);
  };

  const handleSearch = (value: string) => {
    let suggestionLists: string[] = [];
    if (domainNames.length > 0 && value !== '') {
      suggestionLists = domainNames.map(domainName => value + '@' + domainName);
    }
    if (new RegExp('@').test(value)) {
      suggestionLists = [];
    }
    setSuggestions(suggestionLists);
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
      <Select
        id={name}
        ref={selectRef}
        defaultValue={props.defaultValue}
        value={props.value}
        disabled={props.disabled}
        mode="tags"
        className="fullwidth"
        autoFocus={props.autoFocus}
        allowClear={props.allowClear}
        tokenSeparators={[',', ' ', ';']}
        notFoundContent={false}
        onChange={handleChangeEvent}
        onBlur={handleBlurEvent}
        onSearch={handleSearch}
        children={suggestions.map(suggestion => (
          <Select.Option key={`${name}-${suggestion}`} value={suggestion} children={suggestion} />
        ))}
      />
    </Form.Item>
  );
};

export default connect(EmailsField);
