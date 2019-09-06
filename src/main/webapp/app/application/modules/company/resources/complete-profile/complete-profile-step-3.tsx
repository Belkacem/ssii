import React, { FunctionComponent, RefObject, useRef } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Col, Row } from 'antd';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import moment from 'moment';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import { IResource } from 'app/shared/model/resource.model';
import { IResourceContract } from 'app/shared/model/resource-contract.model';

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

interface ICompleteProfileStep3Props {
  profile: IResource;
  updating: boolean;
  contracts: ReadonlyArray<IResourceContract>;
  onSave: (resource: IResource) => void;
}

export const CompleteProfileStep3: FunctionComponent<ICompleteProfileStep3Props> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { profile, updating, contracts } = props;

  const handleSave = values => {
    const payload = {
      ...values,
      hireDate: moment(values.hireDate).format(FORMAT_DATE_SERVER)
    };
    props.onSave(payload);
  };

  const getInitHireDate = () => {
    if (profile.hireDate) {
      return profile.hireDate;
    }
    if (contracts.length === 0) {
      return null;
    }
    return moment.min(contracts.map(c => c.startDate));
  };

  return (
    <Formik
      ref={formikRef}
      initialValues={{ ...profile, hireDate: getInitHireDate() }}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={handleSave}
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
          <Button type="primary" htmlType="submit" loading={updating}>
            Suivant
          </Button>
        </div>
      </Form>
    </Formik>
  );
};
