import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Divider, Row } from 'antd';
import { IClient } from 'app/shared/model/client.model';
import NumberField from 'app/application/components/zsoft-form/generic-fields/numberField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import CheckboxField from 'app/application/components/zsoft-form/generic-fields/checkboxField.component';

interface IClientsFormStep4Props {
  client: IClient;
  isNew: boolean;
  updating: boolean;
  currentStep: number;
  onChangeStep: (step: number, client: IClient) => void;
  onSave: (client: IClient) => void;
}

const validationSchema = Yup.object().shape({
  paymentDelay: Yup.number()
    .label('Délai de paiement')
    .required()
    .nullable(true),
  email: Yup.string()
    .label('Adresse E-mail')
    .email()
    .required()
    .nullable(true),
  reference: Yup.string()
    .label('Référence')
    .nullable(true),
  attachActivityReports: Yup.boolean()
    .label("joindre le rapport d'activité aux e-mails de factures")
    .required(),
  separateInvoices: Yup.boolean()
    .label('Factures séparées')
    .required()
});

export const ClientsFormStep4: FunctionComponent<IClientsFormStep4Props> = props => {
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
      <Form className="form-layout">
        <Row className="form-content">
          <Col md={22} sm={24} xs={24}>
            <TextField label="E-mail" layout="horizontal" name="email" autoFocus />
            <NumberField label="Délai de paiement" name="paymentDelay" layout="horizontal" step={1} min={1} max={60} suffix="jours" />
            <TextField label="Référence" layout="horizontal" name="reference" />
            <Divider orientation="left" className="margin-bottom-8">
              E-mails et Factures
            </Divider>
            <CheckboxField
              label="Les pièces jointes"
              helper="joindre le rapport d'activité aux e-mails de factures"
              name="attachActivityReports"
              optionLabel="Rapport d'activité"
              layout="horizontal"
            />
            <CheckboxField
              label="Factures séparées"
              helper="Générer des factures séparées par type de prestations (journalières et exceptionnelles)"
              name="separateInvoices"
              optionLabel="Oui"
              layout="horizontal"
            />
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
    </Formik>
  );
};
