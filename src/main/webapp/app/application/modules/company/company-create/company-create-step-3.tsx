import React, { FunctionComponent, RefObject, useRef } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Divider } from 'antd';
import AddressForm from 'app/application/components/zsoft-form/custom-fields/addressForm.component';
import { ICompany } from 'app/shared/model/company.model';

interface ICompanyFormStep3Props {
  company: ICompany;
  onChangeStep: Function;
  onSave: Function;
  currentStep: number;
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

export const CompanyFormStep3: FunctionComponent<ICompanyFormStep3Props> = props => {
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
      {formProps => (
        <Form>
          <div className="flex-step-content">
            <div className="text-center">
              <h2>Adresse d'entreprise</h2>
              <small>modifier l'adresse du votre entreprise.</small>
              <Divider />
            </div>
            <AddressForm formProps={formProps} autoFocus />
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
      )}
    </Formik>
  );
};
