import { FormikContext, getIn } from 'formik';
import { ReactNode, CSSProperties } from 'react';

export type FormItemLayout =
  | 'vertical'
  | 'horizontal'
  | {
      labelCol: { span: number; offset?: number };
      wrapperCol: { span: number; offset?: number };
    };

export type FieldLabelType = string | ReactNode;

export interface ICommonFieldProps {
  label?: FieldLabelType;
  name?: string;
  layout?: FormItemLayout;
  formik?: FormikContext<any>;
  loading?: boolean;
  disabled?: boolean;
  helper?: string;
  style?: CSSProperties;
}

export const getFieldLayout = (layout: FormItemLayout = 'vertical') =>
  layout === 'horizontal'
    ? {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      }
    : layout !== 'vertical' && layout;

export const isRequired = (formik: FormikContext<any>, name: string) => {
  if (!formik) return false;
  const validationSchema = typeof formik.validationSchema === 'function' ? formik.validationSchema() : formik.validationSchema;
  if (!validationSchema) return false;
  const fieldSchema = getIn(validationSchema.describe().fields, name);
  return fieldSchema && fieldSchema.tests.find(test => test.name === 'required');
};

export const getValidateStatus = (loading: boolean, name: string, formik: FormikContext<any>) => {
  if (!!formik && !!formik.errors && !!formik.touched && !!formik.submitCount) {
    const { errors, touched, submitCount } = formik;
    if (loading) {
      return 'validating';
    }
    if (touched[name] || submitCount > 0) {
      if (errors[name]) {
        return 'error';
      } else {
        return 'success';
      }
    }
  }
  return '';
};

export const getHelper = (helper: string, name: string, formik: FormikContext<any>) => {
  if (!!formik && !!formik.errors && !!formik.touched && !!formik.submitCount) {
    const { errors, touched, submitCount } = formik;
    if (touched[name] || submitCount > 0) {
      if (errors[name]) {
        return errors[name];
      }
    }
  }
  return helper;
};

export const isEmpty = value => value === undefined || value === null || value === '' || value.length === 0;
