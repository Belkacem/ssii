import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Checkbox, Col, Row } from 'antd';
import { IResource } from 'app/shared/model/resource.model';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import { ContractType, IResourceContract } from 'app/shared/model/resource-contract.model';
import { getCompensationLabel } from 'app/application/common/utils/resource-utils';
import MoneyField from 'app/application/components/zsoft-form/custom-fields/moneyField.component';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import DateRangeField from 'app/application/components/zsoft-form/generic-fields/dateRangeField.component';

const validationSchema = Yup.object().shape({
  startDate: Yup.date()
    .label('Date début')
    .required(),
  endDate: Yup.date()
    .label('Date fin')
    .nullable(true),
  type: Yup.string()
    .label('Type de contrat')
    .required(),
  compensation: Yup.number()
    .label('Compensation')
    .required()
});

interface IResourcesFormStep5Props {
  resource: IResource;
  onSave: (contract: IResourceContract) => void;
  updating: boolean;
}

export const ResourcesFormStep5: FunctionComponent<IResourcesFormStep5Props> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const { resource, updating } = props;

  const handleSave = values => {
    const payload = { ...values };
    if (typeof values.startDate === 'object') {
      payload.startDate = values.startDate.format(FORMAT_DATE_SERVER);
      payload.endDate = values.endDate ? values.endDate.format(FORMAT_DATE_SERVER) : null;
    }
    payload.endDate = hasEndDate ? values.endDate : null;
    payload.resourceId = resource.id;
    props.onSave(payload);
  };

  const disabledDate = current => resource.hireDate && current.isBefore(resource.hireDate, 'days');

  const toggleEndDate = () => setHasEndDate(!hasEndDate);

  const initData = {
    startDate: resource.hireDate
  };
  return (
    <Formik ref={formikRef} initialValues={initData} enableReinitialize validationSchema={validationSchema} onSubmit={handleSave}>
      {formProps => (
        <Form className="form-layout">
          <Row className="form-content">
            <Col lg={18} md={22}>
              <Row>
                <Col sm={7} />
                <Col sm={17}>
                  <Checkbox onChange={toggleEndDate} checked={!hasEndDate}>
                    Jusqu'à aujourd'hui
                  </Checkbox>
                </Col>
              </Row>
              {!hasEndDate ? (
                <DateField
                  label="Période"
                  name="startDate"
                  placeholder="Date début"
                  allowClear={false}
                  disabledDate={disabledDate}
                  layout={{
                    labelCol: { span: 7 },
                    wrapperCol: { span: 17 }
                  }}
                  autoFocus
                />
              ) : (
                <DateRangeField
                  label="Période"
                  name={['startDate', 'endDate']}
                  placeholder={['Date début', 'Date fin']}
                  allowClear={false}
                  value={[formProps.values.startDate, formProps.values.endDate]}
                  disabledDate={disabledDate}
                  layout={{
                    labelCol: { span: 7 },
                    wrapperCol: { span: 17 }
                  }}
                  autoFocus
                />
              )}
              <SelectField
                label="Type de contrat"
                name="type"
                options={[
                  { label: 'Salarié', value: ContractType.EMPLOYEE },
                  { label: 'Free-lance', value: ContractType.FREELANCE },
                  { label: 'Stagiaire', value: ContractType.INTERN },
                  { label: 'Autre', value: ContractType.OTHER }
                ]}
                layout={{
                  labelCol: { span: 7 },
                  wrapperCol: { span: 17 }
                }}
              />
              <MoneyField
                name="compensation"
                label={getCompensationLabel(formProps.values.type)}
                layout={{
                  labelCol: { span: 7 },
                  wrapperCol: { span: 17 }
                }}
              />
            </Col>
          </Row>
          <div className="form-actions">
            <Button.Group>
              <Button type="primary" htmlType="submit" loading={updating}>
                Sauvegarder
              </Button>
            </Button.Group>
          </div>
        </Form>
      )}
    </Formik>
  );
};
