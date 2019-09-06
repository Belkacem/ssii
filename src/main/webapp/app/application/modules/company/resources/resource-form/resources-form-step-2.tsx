import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Row } from 'antd';
import { IResource } from 'app/shared/model/resource.model';
import AddressForm from 'app/application/components/zsoft-form/custom-fields/addressForm.component';
import PhoneNumberField, { isValidPhoneNumber } from 'app/application/components/zsoft-form/custom-fields/phoneField.component';

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

interface IResourcesFormStep2Props {
  resource: IResource;
  isNew: boolean;
  updating: boolean;
  onSave: (resource: IResource) => void;
  onNext: (step: number, resource: IResource) => void;
}

export const ResourcesFormStep2: FunctionComponent<IResourcesFormStep2Props> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const [goNext, setGoNext] = useState(null);
  const { resource, isNew, updating } = props;

  useEffect(
    () => {
      if (goNext !== null) {
        formikRef.current.submitForm();
      }
    },
    [goNext]
  );

  const handleSubmit = values => {
    if (goNext) {
      props.onNext(2, values);
    } else {
      props.onSave(values);
    }
  };

  const handleNext = () => setGoNext(true);
  const handlePrev = () => props.onNext(0, formikRef.current.state.values);
  const handleSave = () => setGoNext(false);

  return (
    <Formik ref={formikRef} initialValues={resource} enableReinitialize validationSchema={validationSchema} onSubmit={handleSubmit}>
      {formProps => (
        <Form className="form-layout">
          <Row className="form-content">
            <Col lg={18} md={22}>
              <PhoneNumberField name="phoneNumber" label="N° Téléphone" layout="horizontal" autoFocus />
              <AddressForm formProps={formProps} />
            </Col>
          </Row>
          <div className="form-actions">
            <Button.Group>
              <Button onClick={handlePrev}>Précédent</Button>
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
