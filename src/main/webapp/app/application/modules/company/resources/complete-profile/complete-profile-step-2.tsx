import React, { FunctionComponent, RefObject, useRef } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Row } from 'antd';
import AddressForm from 'app/application/components/zsoft-form/custom-fields/addressForm.component';
import PhoneNumberField, { isValidPhoneNumber } from 'app/application/components/zsoft-form/custom-fields/phoneField.component';
import { IResource } from 'app/shared/model/resource.model';

const validationSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .label('Numéro de téléphone')
    .test(
      'valid-phone',
      'Le numéro Téléphone composé de 9 chiffres, ex: +33 1 23 45 67 89',
      value => !value || value === '' || (value && isValidPhoneNumber(value))
    )
    .nullable(true)
    .required(),
  addressLine1: Yup.string()
    .label('Adresse Ligne 1')
    .nullable(true)
    .required(),
  addressLine2: Yup.string()
    .label('Adresse Ligne 2')
    .nullable(true),
  city: Yup.string()
    .label('Ville')
    .nullable(true)
    .required(),
  postalCode: Yup.string()
    .label('Code postal')
    .nullable(true)
    .required(),
  country: Yup.string()
    .label('Pays')
    .nullable(true)
    .required()
});

interface ICompleteProfileStep2Props {
  profile: IResource;
  updating: boolean;
  onSave: (resource: IResource) => void;
}

export const CompleteProfileStep2: FunctionComponent<ICompleteProfileStep2Props> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { profile, updating } = props;
  const handleSave = values => props.onSave(values);

  return (
    <Formik ref={formikRef} initialValues={profile} enableReinitialize validationSchema={validationSchema} onSubmit={handleSave}>
      {formProps => (
        <Form className="form-layout">
          <Row className="form-content">
            <Col lg={18} md={22}>
              <PhoneNumberField name="phoneNumber" label="N° Téléphone" layout="horizontal" autoFocus />
              <AddressForm formProps={formProps} />
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
