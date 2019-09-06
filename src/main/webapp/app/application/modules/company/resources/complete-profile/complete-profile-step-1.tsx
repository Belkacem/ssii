import React, { FunctionComponent, RefObject, useRef } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Row } from 'antd';
import moment from 'moment';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import RadioFields from 'app/application/components/zsoft-form/generic-fields/radioFields.component';
import { Gender, IResource } from 'app/shared/model/resource.model';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import { convertDateTimeFromServer } from 'app/application/modules/company/resources/resource-form/resources-form';

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .label('Prénom')
    .nullable(true)
    .required(),
  lastName: Yup.string()
    .label('Nom')
    .nullable(true)
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

interface ICompleteProfileStep1Props {
  profile: IResource;
  updating: boolean;
  onSave: (resource: IResource) => void;
}

export const CompleteProfileStep1: FunctionComponent<ICompleteProfileStep1Props> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { profile, updating } = props;

  const birthDayMaxDate = current => current > moment().add(-23, 'years');

  const handleSave = values => props.onSave({ ...values, draft: false });

  return (
    <Formik ref={formikRef} initialValues={profile} enableReinitialize validationSchema={validationSchema} onSubmit={handleSave}>
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
            <Button type="primary" htmlType="submit" loading={updating}>
              Suivant
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
