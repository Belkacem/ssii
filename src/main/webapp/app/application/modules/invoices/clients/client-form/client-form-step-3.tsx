import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Row } from 'antd';
import AddressForm from 'app/application/components/zsoft-form/custom-fields/addressForm.component';
import { IClient } from 'app/shared/model/client.model';

interface IClientsFormStep3Props {
  client: IClient;
  isNew: boolean;
  updating: boolean;
  currentStep: number;
  onChangeStep: (step: number, client: IClient) => void;
  onSave: (client: IClient) => void;
}

const validationSchema = Yup.object().shape({
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

export const ClientsFormStep3: FunctionComponent<IClientsFormStep3Props> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>();
  const [goNext, setGoNext] = useState<boolean>(undefined);
  const { client, isNew, updating, currentStep } = props;

  useEffect(
    () => {
      if (goNext !== undefined) {
        formikRef.current.submitForm();
      }
    },
    [goNext]
  );

  const handleSubmit = values => {
    if (goNext || isNew) {
      props.onChangeStep(currentStep + 1, values);
    } else {
      props.onSave(values);
    }
  };

  const handlePrev = () => props.onChangeStep(currentStep - 1, formikRef.current.state.values);
  const handleNext = () => setGoNext(true);
  const handleSave = () => setGoNext(false);

  return (
    <Formik ref={formikRef} initialValues={client} enableReinitialize validationSchema={validationSchema} onSubmit={handleSubmit}>
      {formProps => (
        <Form className="form-layout">
          <Row className="form-content">
            <Col md={22} sm={24} xs={24}>
              <div style={{ textAlign: 'right' }}>
                <AddressForm formProps={formProps} autoFocus />
              </div>
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
