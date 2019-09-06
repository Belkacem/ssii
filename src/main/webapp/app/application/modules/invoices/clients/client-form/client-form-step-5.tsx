import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Row } from 'antd';
import { IClient } from 'app/shared/model/client.model';
import IBAN from 'iban';
import IbanField, { isValidIban } from 'app/application/components/zsoft-form/custom-fields/ibanField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

interface IClientsFormStep5Props {
  client: IClient;
  updating: boolean;
  currentStep: number;
  onChangeStep: (step: number, client: IClient) => void;
  onSave: (client: IClient) => void;
}

const validationSchema = Yup.object().shape({
  iban: Yup.string()
    .label('IBAN')
    .test('valid-iban', "Ce numéro IBAN n'est pas valide", iban => !iban || iban === '' || (iban && isValidIban(iban)))
    .nullable(true),
  bik: Yup.string()
    .label('BIK')
    .nullable(true)
});

export const ClientsFormStep5: FunctionComponent<IClientsFormStep5Props> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>();
  const { client, updating, currentStep } = props;

  const handleSubmit = values => {
    if (!updating) {
      props.onSave(values);
    }
  };
  const handlePrev = () => props.onChangeStep(currentStep - 1, formikRef.current.state.values);

  return (
    <Formik ref={formikRef} initialValues={client} enableReinitialize validationSchema={validationSchema} onSubmit={handleSubmit}>
      <Form className="form-layout">
        <Row className="form-content">
          <Col md={22} sm={24} xs={24}>
            <IbanField layout="horizontal" autoFocus />
            <TextField label="BIC" layout="horizontal" name="bic" />
          </Col>
        </Row>
        <div className="form-actions">
          <Button.Group>
            <Button onClick={handlePrev}>Précédent</Button>
            <Button type="primary" htmlType="submit" loading={updating}>
              Sauvegarder
            </Button>
          </Button.Group>
        </div>
      </Form>
    </Formik>
  );
};
