import React, { FunctionComponent, RefObject, useRef } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Divider } from 'antd';
import IBAN from 'iban';
import { ICompany } from 'app/shared/model/company.model';
import IbanField, { isValidIban } from 'app/application/components/zsoft-form/custom-fields/ibanField.component';
import MoneyField from 'app/application/components/zsoft-form/custom-fields/moneyField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

interface ICompanyFormStep4Props {
  company: ICompany;
  onChangeStep: Function;
  onSave: Function;
  updating: boolean;
  currentStep: number;
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .label('Adresse E-mail')
    .email()
    .nullable(true),
  domainName: Yup.string()
    .label('Nom de domaine')
    .nullable(true),
  iban: Yup.string()
    .label('IBAN')
    .test('valid-iban', "Ce numéro IBAN n'est pas valide", iban => !iban || iban === '' || (iban && isValidIban(iban)))
    .nullable(true),
  bik: Yup.string()
    .label('BIK')
    .nullable(true),
  capital: Yup.number()
    .label('Capital social')
    .nullable(true)
});

export const CompanyFormStep4: FunctionComponent<ICompanyFormStep4Props> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>();
  const { company, updating } = props;

  const handlePrev = () => {
    props.onChangeStep(props.currentStep - 1, formikRef.current.state.values);
  };

  const handleSubmit = values => {
    if (!updating) {
      props.onSave(values);
    }
  };

  const handleSave = () => {
    formikRef.current.submitForm();
  };

  return (
    <Formik ref={formikRef} initialValues={company} enableReinitialize validationSchema={validationSchema} onSubmit={handleSubmit}>
      <Form style={{ textAlign: 'center' }}>
        <div className="flex-step-content">
          <div className="text-center">
            <h2>Additionnel</h2>
            <small>Ajouter des informations additionnelles.</small>
            <Divider />
          </div>
          <TextField label="E-mail" autoFocus name="email" layout="horizontal" />
          <TextField label="Nom de domaine" name="domainName" layout="horizontal" />
          <MoneyField name="capital" label="Capital social" layout="horizontal" />
          <IbanField layout="horizontal" />
          <TextField label="BIC" name="bic" layout="horizontal" />
        </div>
        <div className="text-right">
          <Button.Group>
            <Button onClick={handlePrev}>Précédent</Button>
            <Button type="primary" onClick={handleSave} loading={updating}>
              Sauvegarder
            </Button>
          </Button.Group>
        </div>
      </Form>
    </Formik>
  );
};
