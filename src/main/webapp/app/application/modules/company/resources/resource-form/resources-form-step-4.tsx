import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Row } from 'antd';
import CountriesList from 'app/application/common/config/countries';
import { IResource } from 'app/shared/model/resource.model';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

const validationSchema = Yup.object().shape({
  countryOfBirth: Yup.string()
    .label('Pays de naissance')
    .nullable(true)
    .required(),
  townOfBirth: Yup.string()
    .label('Ville de naissance')
    .nullable(true)
    .required(),
  citizenShip: Yup.string()
    .label('Citoyenneté')
    .nullable(true)
    .required(),
  workPermitType: Yup.string()
    .label('Type du Permis de travail')
    .nullable(true),
  workPermitNumber: Yup.string()
    .label('Numéro du permis de travail')
    .nullable(true),
  workPermitExpiryDate: Yup.date()
    .label("Date d'expiration du permis de travail")
    .nullable(true)
});

interface IResourcesFormStep4Props {
  resource: IResource;
  isNew: boolean;
  updating: boolean;
  onSave: (resource: IResource) => void;
  onNext: (step: number, resource: IResource) => void;
}

export const ResourcesFormStep4: FunctionComponent<IResourcesFormStep4Props> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const [showWorkPermit, setShowWorkPermit] = useState(props.resource.citizenShip !== 'France');
  const { resource, isNew, updating } = props;

  const handleCitizenShipChange = citizenShip => {
    formikRef.current.setFieldValue('citizenShip', citizenShip);
    setShowWorkPermit(citizenShip !== 'France');
  };

  const handleSave = values => {
    props.onSave(values);
    if (isNew) {
      props.onNext(4, values);
    }
  };

  const handlePrev = () => props.onNext(2, formikRef.current.state.values);

  return (
    <Formik ref={formikRef} initialValues={resource} enableReinitialize validationSchema={validationSchema} onSubmit={handleSave}>
      <Form className="form-layout">
        <Row className="form-content">
          <Col lg={18} md={22}>
            <SelectField
              label="Pays de naissance"
              name="countryOfBirth"
              layout="horizontal"
              options={CountriesList.map(country => ({ label: country.name, value: country.name }))}
              autoFocus
            />
            <TextField label="Ville de naissance" name="townOfBirth" layout="horizontal" />
            <SelectField
              label="Citoyenneté"
              name="citizenShip"
              layout="horizontal"
              onChange={handleCitizenShipChange}
              options={CountriesList.map(country => ({ label: country.name, value: country.name }))}
            />
            {/* Work permit */}
            <Row style={{ display: showWorkPermit ? 'inherit' : 'none' }}>
              <Col sm={6} className="ant-form-item-label">
                <label htmlFor="workPermitType">Permis de travail</label>
              </Col>
              <Col sm={8}>
                <TextField placeholder="Type" name="workPermitType" />
              </Col>
              <Col sm={5}>
                <TextField placeholder="Numéro" name="workPermitNumber" />
              </Col>
              <Col sm={5}>
                <DateField placeholder="Date d'expiration" name="workPermitExpiryDate" />
              </Col>
            </Row>
          </Col>
        </Row>
        <div className="form-actions">
          <Button.Group>
            <Button onClick={handlePrev}>Précédent</Button>
            <Button type="primary" htmlType="submit" loading={updating}>
              {isNew ? 'Suivant' : 'Sauvegarder'}
            </Button>
          </Button.Group>
        </div>
      </Form>
    </Formik>
  );
};
