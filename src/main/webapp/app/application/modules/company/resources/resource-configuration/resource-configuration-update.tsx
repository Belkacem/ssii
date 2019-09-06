import React, { FunctionComponent, RefObject, useRef } from 'react';
import { IResourceConfiguration } from 'app/shared/model/resource-configuration.model';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Button, Divider } from 'antd';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import NumberField from 'app/application/components/zsoft-form/generic-fields/numberField.component';
import CheckboxField from 'app/application/components/zsoft-form/generic-fields/checkboxField.component';

interface IResourceConfigurationProps {
  configuration: IResourceConfiguration;
  onUpdate: (configuration: IResourceConfiguration) => void;
  updating: boolean;
}

const validationSchema = Yup.object().shape({
  active: Yup.boolean()
    .label('Active')
    .required(),
  canReportExpenses: Yup.boolean()
    .label('Peut déclarer les notes de frais')
    .required(),
  hasRTT: Yup.boolean()
    .label('RTT Active')
    .required(),
  daysRTT: Yup.number()
    .label('Réduction du temps de travail (jour/année)')
    .nullable(true)
    .required(),
  daysCP: Yup.number()
    .label('Les jours additionnelle du Congé Payés')
    .nullable(true)
    .required()
});

export const ResourceConfigurationUpdate: FunctionComponent<IResourceConfigurationProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>();
  const { configuration, updating } = props;

  const handleSubmit = values => {
    if (!updating) {
      props.onUpdate(values);
    }
  };

  const onSubmit = () => {
    formikRef.current.submitForm();
  };

  const initialValues = configuration;
  if (!initialValues.daysRTT) initialValues.daysRTT = 0;
  if (!initialValues.daysCP) initialValues.daysCP = 0;

  return (
    <>
      <PageHead
        title="Configurations"
        actions={
          <Button type="primary" onClick={onSubmit} loading={updating} icon="save" className="ant-btn-textual">
            <span>Sauvegarder</span>
          </Button>
        }
        margin={false}
      />
      <Formik ref={formikRef} initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={handleSubmit}>
        {formProps => (
          <Form className="fullwidth padding-1rem">
            <Divider orientation="left" className="margin-bottom-8">
              Général
            </Divider>
            <CheckboxField label="Active" name="active" optionLabel="Oui" layout="horizontal" />
            <Divider orientation="left" className="margin-bottom-8">
              Congés et absences
            </Divider>
            <CheckboxField label="RTT Active" name="hasRTT" optionLabel="Oui" layout="horizontal" />
            <NumberField
              label="RTT"
              helper="Réduction du temps de travail (jour/année), Mettre à zéro pour utiliser la valeur par défaut d'entreprise"
              name="daysRTT"
              layout="horizontal"
              style={{ width: 100 }}
              step={1}
              min={0}
              suffix="jours"
              disabled={!formProps.values.hasRTT}
            />
            <NumberField
              label="CP+"
              helper="Les jours additionnelle du Congé Payés (jour/année)"
              name="daysCP"
              layout="horizontal"
              style={{ width: 100 }}
              step={1}
              min={0}
              suffix="jours"
            />
            <Divider orientation="left" className="margin-bottom-8">
              Notes de frais
            </Divider>
            <CheckboxField label="Peut déclarer" name="canReportExpenses" optionLabel="Oui" layout="horizontal" />
          </Form>
        )}
      </Formik>
    </>
  );
};
