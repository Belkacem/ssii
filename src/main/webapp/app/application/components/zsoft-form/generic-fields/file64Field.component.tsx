import React, { FunctionComponent, useState, useEffect } from 'react';
import { connect } from 'formik';
import { getFieldLayout, getHelper, getValidateStatus, ICommonFieldProps, isRequired } from 'app/application/common/utils/form-utils';
import { Form, Icon, Upload } from 'antd';
/* tslint:disable:no-submodule-imports */
import { UploadChangeParam } from 'antd/lib/upload';
import mime from 'mime-types';

interface IFile64FieldPropsType extends ICommonFieldProps {
  name: string;
  placeholder?: string;
  accept?: string;
  max?: number;
  multiple?: boolean;
  listName?: string;
}

export const getBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

export const base64toFile = (base64: string, contentType: string) => {
  const extension = mime.extension(contentType);
  const filename = `file_${new Date().getTime()}.${extension}`;
  const bstr = atob(base64);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: contentType });
};

export const FileBase64Field: FunctionComponent<IFile64FieldPropsType> = props => {
  const { name, label, formik, placeholder, helper, accept, max, multiple = false, listName = 'files' } = props;

  const formItemLayout = getFieldLayout(props.layout);
  const required = isRequired(formik, name);

  const defaultFile = formik.initialValues[name] || null;
  const defaultContentType = formik.initialValues[`${name}ContentType`] || null;
  const [fileList, setFileList] = useState([]);
  const [validateError, setValidateError] = useState(null);
  const validateStatus = getValidateStatus(props.loading, name, formik);
  const validateStatusHelper = validateError || getHelper('', name, formik);
  const accepted_types = !!accept && accept.split(',').join(' ');

  useEffect(
    () => {
      if (defaultFile && defaultContentType) {
        const file: any = base64toFile(defaultFile, defaultContentType);
        file.uid = '1';
        setFileList([file]);
      }
    },
    [defaultFile, defaultContentType]
  );

  useEffect(
    () => {
      if (multiple) {
        const data = fileList.map(file => {
          const obj = {};
          obj[name] = file.encoded;
          obj[`${name}ContentType`] = file.type;
          return obj;
        });
        formik.setFieldValue(listName, data);
      } else {
        if (fileList.length === 0) {
          handleChangeFile(null, null);
        } else {
          const file = fileList[0];
          handleChangeFile(file.encoded, file.type);
        }
      }
    },
    [fileList]
  );

  const handleChangeFile = (base64, contentType) => {
    formik.setFieldValue(name, base64);
    formik.setFieldValue(`${name}ContentType`, contentType);
  };

  const handleChange = (info: UploadChangeParam) => {
    if (info.file.originFileObj) {
      getBase64(info.file.originFileObj).then(data => {
        let encoded = data.toString();
        encoded = encoded.replace(/^data:(.*;base64,)?/, '');
        if (encoded.length % 4 > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        const file: any = info.file.originFileObj;
        file.encoded = encoded;
        if (multiple) {
          setFileList(prevFileList => [...prevFileList, file]);
        } else {
          setFileList([file]);
        }
      });
    }
  };

  const handleRemoveFile = file => {
    setFileList(fileList.filter(f => f.uid !== file.uid));
  };

  const beforeUpload = file => {
    const acceptedType =
      !accept ||
      accept === '*' ||
      accept.split(',').some(type => type === mime.lookup(file.name) || mime.lookup(type) === mime.lookup(file.name));
    if (!acceptedType) {
      setValidateError(`Vous pouvez uniquement télécharger des fichiers de type: ${accepted_types}!`);
    }
    const acceptedSize = !max || file.size / 1024 / 1024 < max;
    if (!acceptedSize) {
      setValidateError(`La taille de fichier doit être inférieure à ${max} Mo !`);
    }
    if (acceptedType && acceptedSize) {
      setValidateError(null);
    }
    return acceptedType && acceptedSize;
  };

  const customRequest = () => false;

  return (
    <Form.Item
      className="ant-form-item-upload"
      label={label}
      required={required}
      {...formItemLayout}
      validateStatus={!!validateError ? 'error' : validateStatus}
      help={validateStatusHelper}
      hasFeedback
      htmlFor={name}
    >
      <Upload.Dragger
        id={name}
        name={name}
        customRequest={customRequest}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onRemove={handleRemoveFile}
        accept={accept}
        multiple={multiple}
        showUploadList
        listType="text"
        supportServerRender={false}
        fileList={fileList}
      >
        <p className="ant-upload-drag-icon">
          <Icon type="paper-clip" />
        </p>
        <p className="ant-upload-text">{!!placeholder ? placeholder : 'Ajouter un fichier'}</p>
        <p className="ant-upload-hint">
          {!!helper
            ? helper
            : 'Formats de justificatifs acceptés:' +
              (!!accept ? `${accepted_types}` : 'Tous') +
              ', ' +
              ('La taille maximale est ' + (!!max ? `${max} Mo` : 'Illimitée'))}
        </p>
      </Upload.Dragger>
    </Form.Item>
  );
};

export default connect(FileBase64Field);
