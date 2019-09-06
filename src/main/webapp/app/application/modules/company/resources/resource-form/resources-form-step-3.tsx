import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import { Button, Col, Row } from 'antd';
import { IResource } from 'app/shared/model/resource.model';
import { IResourceContract } from 'app/shared/model/resource-contract.model';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

const validationSchema = Yup.object().shape({
  hireDate: Yup.date()
    .label("Date d'embauche")
    .nullable(true)
    .required(),
  socialSecurity: Yup.string()
    .label('Numero de sécurité sociale')
    .nullable(true),
  identification: Yup.string()
    .label('Matricule')
    .nullable(true)
});

interface IResourcesFormStep3Props {
  resource: IResource;
  contracts: ReadonlyArray<IResourceContract>;
  isNew: boolean;
  updating: boolean;
  onSave: (resource: IResource) => void;
  onNext: (step: number, resource: IResource) => void;
}

export const ResourcesFormStep3: FunctionComponent<IResourcesFormStep3Props> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const [goNext, setGoNext] = useState(null);
  const { resource, isNew, updating, contracts } = props;

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
      props.onNext(3, values);
    } else {
      props.onSave(values);
    }
  };

  const handleNext = () => setGoNext(true);
  const handlePrev = () => props.onNext(1, formikRef.current.state.values);
  const handleSave = () => setGoNext(false);

  const getInitHireDate = () => {
    if (resource.hireDate) {
      return resource.hireDate;
    }
    if (contracts.length === 0) {
      return null;
    }
    return moment.min(contracts.map(c => c.startDate));
  };

  return (
    <Formik
      ref={formikRef}
      initialValues={{ ...resource, hireDate: getInitHireDate() }}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <Form className="form-layout">
        <Row className="form-content">
          <Col lg={18} md={22}>
            <TextField label="Matricule" name="identification" layout="horizontal" autoFocus />
            <TextField label="N° Sécurité sociale" name="socialSecurity" layout="horizontal" />
            <DateField label="Date d'embauche" name="hireDate" layout="horizontal" />
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
