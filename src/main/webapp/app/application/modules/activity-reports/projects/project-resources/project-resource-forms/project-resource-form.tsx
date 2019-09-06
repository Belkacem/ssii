import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';
import { IProjectResource } from 'app/shared/model/project-resource.model';
import { Form, Formik } from 'formik';
import { Checkbox, Col, Row } from 'antd';
import CheckboxField from 'app/application/components/zsoft-form/generic-fields/checkboxField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import DateRangeField from 'app/application/components/zsoft-form/generic-fields/dateRangeField.component';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import moment, { Moment } from 'moment';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { IResource } from 'app/shared/model/resource.model';

interface IProjectResourcesFormProps {
  formikRef?: RefObject<Formik>;
  projectResource: IProjectResource;
  projectResources?: ReadonlyArray<IProjectResource>;
  resources?: ReadonlyArray<IResource>;
  onUpdate?: (value: IProjectResource) => void;
  onCreate?: (value: IProjectResource) => void;
}

const validationSchema = (hasEndDate: boolean) =>
  Yup.object().shape({
    startDate: Yup.date()
      .label('Date début')
      .required(),
    endDate: Yup.date()
      .label('Date fin')
      .nullable(true)
      .when('$hasEndDate', (_hasEndDate, schema) => {
        if (hasEndDate) {
          return schema.required();
        }
        return schema;
      }),
    resourceId: Yup.number()
      .label('Ressource')
      .required(),
    projectEmail: Yup.string().label('E-mail de projet')
  });

export const ProjectResourcesForm: FunctionComponent<IProjectResourcesFormProps> = props => {
  const formikRef: RefObject<Formik> = props.formikRef || useRef<Formik>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [minDate, setMinDate] = useState<Moment>();
  const { projectResource } = props;
  const resources = !!props.resources
    ? props.resources.filter(resource => !props.projectResources.some(pr => pr.resourceId === resource.id))
    : [];

  useEffect(
    () => {
      setHasEndDate(!projectResource.id ? false : !!projectResource.endDate);
    },
    [projectResource]
  );

  const handleSave = values => {
    const payload = {
      ...projectResource,
      ...values
    };
    if (typeof values.startDate === 'object') {
      payload.startDate = values.startDate.format(FORMAT_DATE_SERVER);
      payload.endDate = values.endDate ? values.endDate.format(FORMAT_DATE_SERVER) : null;
    }
    payload.endDate = hasEndDate ? values.endDate.format(FORMAT_DATE_SERVER) : null;
    if (!!projectResource.id) {
      props.onUpdate(payload);
    } else {
      props.onCreate(payload);
    }
  };

  const disabledDate = current => {
    return minDate && minDate.isAfter(current, 'days');
  };

  const toggleEndDate = () => setHasEndDate(!hasEndDate);

  const handleStartDateChange = (startDate: Moment) => {
    formikRef.current.setFieldValue('startDate', startDate);
    formikRef.current.setFieldValue('endDate', null);
  };

  const handlePeriodChange = (startDate: Moment, endDate: Moment) => {
    formikRef.current.setFieldValue('startDate', startDate);
    formikRef.current.setFieldValue('endDate', endDate);
  };

  const handleResourceChange = resourceId => {
    formikRef.current.setFieldValue('resourceId', resourceId);
    const selectedResource = props.resources.find(r => r.id === resourceId);
    if (selectedResource) {
      formikRef.current.setFieldValue('projectEmail', selectedResource.email);
      if (selectedResource.hireDate) {
        setMinDate(moment(selectedResource.hireDate));
      } else {
        setMinDate(null);
      }
    }
  };
  const initialValues = projectResource;
  if (!!initialValues && initialValues.startDate && typeof initialValues.startDate === 'string') {
    initialValues.startDate = moment(initialValues.startDate);
  }
  if (!!initialValues && initialValues.endDate && typeof initialValues.endDate === 'string') {
    initialValues.endDate = moment(initialValues.endDate);
  }
  return (
    <Formik
      ref={formikRef}
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema(hasEndDate)}
      onSubmit={handleSave}
    >
      {formProps => (
        <Form>
          {!projectResource.id && (
            <SelectField
              label="Ressource"
              name="resourceId"
              onChange={handleResourceChange}
              options={resources.map(emp => ({
                label: getFullName(emp),
                value: emp.id
              }))}
              layout="horizontal"
              autoFocus
            />
          )}
          <TextField label="E-mail de projet" name="projectEmail" layout="horizontal" />
          {!!projectResource.id && <CheckboxField label="Active" name="active" optionLabel="Oui" layout="horizontal" />}
          <Row>
            <Col sm={6} />
            <Col sm={18}>
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
              onChange={handleStartDateChange}
              disabledDate={disabledDate}
              layout="horizontal"
              autoFocus
            />
          ) : (
            <DateRangeField
              label="Période"
              name={['startDate', 'endDate']}
              placeholder={['Date début', 'Date fin']}
              allowClear={false}
              onChange={handlePeriodChange}
              disabledDate={disabledDate}
              value={[formProps.values.startDate, formProps.values.endDate]}
              layout="horizontal"
              autoFocus
            />
          )}
        </Form>
      )}
    </Formik>
  );
};
