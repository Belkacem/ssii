import React, { FunctionComponent, RefObject, useRef } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Divider } from 'antd';
import { Form as CompanyForms, ICompany } from 'app/shared/model/company.model';
import SirenField, { isValidSiren } from 'app/application/components/zsoft-form/custom-fields/sirenField.component';
import TvaField, { isValidTva } from 'app/application/components/zsoft-form/custom-fields/tvaField.component';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

interface ICompanyFormStep2Props {
  company: ICompany;
  onChangeStep: (step: number, company: ICompany) => void;
  currentStep: number;
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

const companyFormsList = [
  { value: CompanyForms.SARL, label: 'SARL' },
  { value: CompanyForms.EURL, label: 'EURL' },
  { value: CompanyForms.SAS, label: 'SAS' },
  { value: CompanyForms.SASU, label: 'SASU' },
  { value: CompanyForms.OTHER, label: 'Autre' }
];

export const CompanyFormStep2: FunctionComponent<ICompanyFormStep2Props> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>();
  const { company } = props;

  const handleSubmit = values => {
    props.onChangeStep(props.currentStep + 1, values);
  };

  const handlePrev = () => {
    props.onChangeStep(props.currentStep - 1, formikRef.current.state.values);
  };

  const handleNext = () => {
    formikRef.current.submitForm();
  };

  return (
    <Formik ref={formikRef} initialValues={company} enableReinitialize validationSchema={validationSchema} onSubmit={handleSubmit}>
      <Form>
        <div className="flex-step-content">
          <div className="text-center">
            <h2>Informations de Base</h2>
            <small>Modifier les informations de base de votre entreprise.</small>
            <Divider />
          </div>
          <SelectField autoFocus label="Forme" name="form" layout="horizontal" options={companyFormsList} />
          <TextField label="Nom d'entreprise" name="name" layout="horizontal" />
          <SirenField layout="horizontal" />
          <TvaField label="Numéro de TVA" helper="le numéro de TVA intracommunautaire" layout="horizontal" />
        </div>
        <div className="text-right">
          <Button.Group>
            <Button onClick={handlePrev}>Précédent</Button>
            <Button type="primary" onClick={handleNext}>
              Suivant
            </Button>
          </Button.Group>
        </div>
      </Form>
    </Formik>
  );
};
