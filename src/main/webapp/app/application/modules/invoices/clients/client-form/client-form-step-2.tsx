import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Row } from 'antd';
import { Form as ClientForms, IClient } from 'app/shared/model/client.model';
import SirenField, { isValidSiren } from 'app/application/components/zsoft-form/custom-fields/sirenField.component';
import TvaField, { isValidTva } from 'app/application/components/zsoft-form/custom-fields/tvaField.component';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

interface IClientsFormStep2Props {
  client: IClient;
  isNew: boolean;
  updating: boolean;
  currentStep: number;
  onSave: (client: IClient) => void;
  onChangeStep: (step: number, client: IClient) => void;
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .label("Nom de l'entreprise")
    .required(),
  form: Yup.string()
    .label('Forme')
    .required(),
  siren: Yup.number()
    .label('Numéro de SIREN')
    .required()
    .test('length', 'Le numéro SIREN composé de 9 chiffres', value => isValidSiren(`${value}`)),
  tva: Yup.string()
    .label('Numéro de TVA')
    .required()
    .test(
      'valid-tva',
      'la Composition du numéro de TVA :[FR + code clé (40) + numéro SIREN (123456824)]',
      value => value && isValidTva(value)
    )
    .nullable(true)
});

const clientFormsList = [
  { value: ClientForms.SARL, label: 'SARL' },
  { value: ClientForms.EURL, label: 'EURL' },
  { value: ClientForms.SAS, label: 'SAS' },
  { value: ClientForms.SASU, label: 'SASU' },
  { value: ClientForms.OTHER, label: 'Autre' }
];

export const ClientsFormStep2: FunctionComponent<IClientsFormStep2Props> = props => {
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
            <Row>
              <Col sm={6} className="ant-form-item-label">
                <label htmlFor="name">
                  Nom <b className="required-start">*</b>
                </label>
              </Col>
              <Col sm={6}>
                <SelectField autoFocus name="form" placeholder="Forme" options={clientFormsList} />
              </Col>
              <Col sm={12}>
                <TextField placeholder="Nom de client" name="name" autoFocus />
              </Col>
            </Row>
            <SirenField label="N° SIREN" helper="le numéro de SIREN" layout="horizontal" />
            <TvaField layout="horizontal" helper="le numéro de TVA intracommunautaire" />
          </Col>
        </Row>
        <div className="form-actions">
          <Button.Group>
            {currentStep !== 0 && <Button onClick={handlePrev}>Précédent</Button>}
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
