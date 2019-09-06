import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import * as Yup from 'yup';
import { Button, Modal } from 'antd';
import { Form, Formik } from 'formik';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import NumberField from 'app/application/components/zsoft-form/generic-fields/numberField.component';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import CheckboxField from 'app/application/components/zsoft-form/generic-fields/checkboxField.component';
import FileBase64Field from 'app/application/components/zsoft-form/generic-fields/file64Field.component';
import moment from 'moment';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';

interface IEntityManagerFormProps {
  entity: any;
  apiUrl: string;
  fields: any[];
  onClose: (entity: any) => void;
}

export const EntityManagerForm: FunctionComponent<IEntityManagerFormProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const [initialValues, setInitialValues] = useState({});
  const [updating, setUpdating] = useState(false);
  const { entity, fields, apiUrl } = props;
  const isNew = !!entity && entity.id === undefined;

  useEffect(
    () => {
      setInitialValues(entity);
    },
    [entity]
  );

  const saveEntity = async values => {
    setUpdating(true);
    const payload = { ...values };
    fields.map(field => {
      if (field && field.type === 'date') {
        const date = moment(payload[field.name]);
        payload[field.name] = date.isValid() ? date.format(FORMAT_DATE_SERVER) : null;
      } else if (field && field.type === 'datetime') {
        const date = moment(payload[field.name]);
        payload[field.name] = date.isValid() ? date.toDate() : null;
      }
      if (field.nullable && payload[field.name] === '') {
        payload[field.name] = null;
      }
    });
    try {
      if (isNew) {
        await axios.post(apiUrl, payload);
      } else {
        await axios.put(apiUrl, payload);
      }
      handleClose();
    } catch {}
    setUpdating(false);
  };

  const handleClose = () => {
    props.onClose(null);
  };

  const handleSubmit = () => {
    formikRef.current.submitForm();
  };

  const validationSchema = () => {
    const schema = {};
    fields
      .filter(field => !isNew || (isNew && field.name !== 'id'))
      .filter(field => !field.name.endsWith('ContentType'))
      .map(field => {
        let fieldSchema;
        if (field.type === 'number') {
          fieldSchema = Yup.number();
        } else if (field.type === 'date' || field.type === 'datetime') {
          fieldSchema = Yup.date();
        } else if (field.type === 'boolean') {
          fieldSchema = Yup.boolean();
        } else {
          fieldSchema = Yup.string();
        }
        fieldSchema = fieldSchema.label(field.name);
        if (field.required && field.type !== 'file') {
          fieldSchema = fieldSchema.required();
        }
        if (field.nullable || field.type === 'file') {
          fieldSchema = fieldSchema.nullable(true);
        }
        schema[field.name] = fieldSchema;
      });
    return Yup.object().shape(schema);
  };

  return (
    <Modal
      title={isNew ? 'Ajouter' : 'Modifier'}
      visible={!!entity}
      onCancel={handleClose}
      centered
      maskClosable={false}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={handleClose} type="default">
          Annuler
        </Button>,
        <Button key="submit" onClick={handleSubmit} type="primary" disabled={updating}>
          Sauvegarder
        </Button>
      ]}
    >
      <Formik ref={formikRef} initialValues={initialValues} validationSchema={validationSchema()} enableReinitialize onSubmit={saveEntity}>
        <Form>
          {fields
            .filter(field => !field.name.endsWith('ContentType'))
            .filter(field => !isNew || (isNew && field.name !== 'id'))
            .map((field, index) => {
              switch (field.type) {
                case 'number':
                  return (
                    <NumberField
                      key={field.name}
                      label={field.name}
                      name={field.name}
                      layout="horizontal"
                      autoFocus={index === 0}
                      allowClear={field.nullable || !field.required}
                    />
                  );
                case 'date':
                case 'datetime':
                  return (
                    <DateField
                      key={field.name}
                      label={field.name}
                      name={field.name}
                      layout="horizontal"
                      autoFocus={index === 0}
                      allowClear={field.nullable || !field.required}
                    />
                  );
                case 'boolean':
                  return <CheckboxField key={field.name} label={field.name} name={field.name} layout="horizontal" optionLabel="Oui" />;
                case 'file':
                  return (
                    <FileBase64Field
                      key={field.name}
                      label={field.name}
                      name={field.name}
                      layout="horizontal"
                      accept=".jpeg,.jpg,.pdf"
                      max={6}
                    />
                  );
                case 'string':
                default:
                  return (
                    <TextField
                      key={field.name}
                      label={field.name}
                      name={field.name}
                      layout="horizontal"
                      autoFocus={index === 0}
                      allowClear={field.nullable || !field.required}
                    />
                  );
              }
            })}
        </Form>
      </Formik>
    </Modal>
  );
};
