import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Row } from 'antd';
import { convertDateTimeFromServer } from './resources-form';
import moment from 'moment';
import { Gender, IResource } from 'app/shared/model/resource.model';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import RadioFields from 'app/application/components/zsoft-form/generic-fields/radioFields.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

const getValidationSchema = (emailExistError: boolean) =>
  Yup.object().shape({
    firstName: Yup.string()
      .label('Prénom')
      .nullable(true)
      .required(),
    lastName: Yup.string()
      .label('Nom')
      .nullable(true)
      .required(),
    email: Yup.string()
      .label('E-mail')
      .nullable(true)
      .email()
      .test('emailexists', 'Email déjà utilisé !', () => Promise.resolve(!emailExistError))
      .required(),
    secondaryEmail: Yup.string()
      .label('E-mail secondaire')
      .email()
      .nullable(true),
    gender: Yup.string()
      .label('Sexe')
      .nullable(true)
      .required(),
    dateOfBirth: Yup.date()
      .label('Date de naissance')
      .nullable(true)
      .required()
  });

interface IResourcesFormStep1Props {
  resource: IResource;
  emailExistError: boolean;
  isNew: boolean;
  updating: boolean;
  onSave: (resource: IResource) => void;
  onNext: (step: number, resource: IResource) => void;
  emailChanged: () => void;
}

export const ResourcesFormStep1: FunctionComponent<IResourcesFormStep1Props> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const [goNext, setGoNext] = useState(null);
  const { resource, isNew, updating } = props;

  useEffect(
    () => {
      if (props.emailExistError) {
        formikRef.current.setFieldTouched('email');
      }
    },
    [props.emailExistError]
  );

  useEffect(
    () => {
      if (goNext !== null) {
        formikRef.current.submitForm();
      }
    },
    [goNext]
  );

  const emailChanged = (email: string) => {
    formikRef.current.setFieldValue('email', email);
    props.emailChanged();
  };

  const birthDayMaxDate = current => current > moment().add(-23, 'years');

  const handleSubmit = values => {
    if (goNext) {
      props.onNext(1, values);
    } else {
      props.onSave(values);
    }
  };

  const handleNext = () => setGoNext(true);
  const handleSave = () => setGoNext(false);

  return (
    <Formik
      ref={formikRef}
      initialValues={resource}
      enableReinitialize
      validationSchema={getValidationSchema(props.emailExistError)}
      onSubmit={handleSubmit}
    >
      {formProps => (
        <Form className="form-layout">
          <Row className="form-content">
            <Col lg={18} md={22}>
              <Row>
                <Col sm={6} className="ant-form-item-label">
                  <label htmlFor="firstName">
                    Nom et Prénom <b className="required-start">*</b>
                  </label>
                </Col>
                <Col sm={9}>
                  <TextField name="firstName" placeholder="Prénom" autoFocus />
                </Col>
                <Col sm={9}>
                  <TextField name="lastName" placeholder="Nom" />
                </Col>
              </Row>
              <TextField label="E-mail" name="email" onChange={emailChanged} layout="horizontal" />
              <TextField label="E-mail secondaire" name="secondaryEmail" layout="horizontal" />
              <RadioFields
                label="Sexe"
                name="gender"
                layout="horizontal"
                options={[
                  { label: 'Masculin', value: Gender.MALE },
                  { label: 'Féminin', value: Gender.FEMALE },
                  { label: 'Autre', value: Gender.OTHER }
                ]}
              />
              <DateField
                label="Date de naissance"
                name="dateOfBirth"
                disabledDate={birthDayMaxDate}
                defaultPickerValue={convertDateTimeFromServer(formProps.values.dateOfBirth) || moment().add(-23, 'years')}
                layout="horizontal"
              />
            </Col>
          </Row>
          <div className="form-actions">
            <Button.Group>
              <Button type="primary" onClick={handleNext}>
                Suivant
              </Button>
            </Button.Group>
            {!isNew && (
              <Button type="dashed" icon="save" onClick={handleSave} loading={updating} style={{ float: 'left' }}>
                Sauvegarder
              </Button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};
