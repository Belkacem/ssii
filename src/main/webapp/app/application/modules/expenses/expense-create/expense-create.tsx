import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';

import { isHoliday, isWeekend } from 'app/application/common/utils/absence-utils';
import moment, { Moment } from 'moment';
import { Button, Col, Modal, Row } from 'antd';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import { IResource } from 'app/shared/model/resource.model';
import { hasContract } from 'app/application/common/utils/contract-utils';

import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import * as Holiday from 'app/entities/holiday/holiday.reducer';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';
import * as ResourceConfiguration from 'app/application/entities/resource-configuration/resource-configuration.actions';
import * as ExpenseExt from 'app/application/entities/expense/expense.actions';
import * as ExpenseType from 'app/entities/expense-type/expense-type.reducer';
import * as ProjectResourceExt from 'app/application/entities/project-resource/project-resource.actions';
import * as ProjectExt from 'app/application/entities/project/project.actions';
import { formatMoney } from 'app/application/common/utils/invoice-utils';

import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import MoneyField from 'app/application/components/zsoft-form/custom-fields/moneyField.component';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import NumberField from 'app/application/components/zsoft-form/generic-fields/numberField.component';
import TextAreaField from 'app/application/components/zsoft-form/generic-fields/textAreaField.component';
import FileBase64Field from 'app/application/components/zsoft-form/generic-fields/file64Field.component';
import { ValidationStatus } from 'app/shared/model/expense.model';

interface IExpenseCreateModalProps extends StateProps, DispatchProps {
  visible?: boolean;
  onClose?: Function;
  selectedResource?: IResource;
  minDate?: Moment;
  maxDate?: Moment;
}

const ExpenseCreateModal: FunctionComponent<IExpenseCreateModalProps> = props => {
  const formikRef = useRef<Formik>();
  const isResource: boolean = !!props.currentResource.id;

  const { visible, updateSuccess, holidays, minDate, maxDate, contracts, projectResources, currentValidator } = props;

  useEffect(
    () => {
      props.getExpenseTypes();
      props.getHolidays(0, 999, 'date,asc');
      if (isResource) {
        props.getContracts(props.currentResource.id);
        props.getProjectResources(props.currentResource.id);
        props.getResourcesConfiguration([props.currentResource.id]);
      } else {
        props.getAllResources();
      }
    },
    [visible]
  );

  useEffect(
    () => {
      props.getResourcesConfiguration(props.resources.map(resource => resource.id));
    },
    [props.resources]
  );

  useEffect(
    () => {
      handleClose();
    },
    [updateSuccess]
  );

  useEffect(
    () => {
      if (projectResources.length > 0) {
        const projectIds = projectResources.map(pr => pr.projectId);
        props.getProjects(projectIds);
      }
    },
    [projectResources]
  );

  const disabledDate = (current: Moment) => {
    return (
      contracts.length === 0 ||
      !hasContract(current, contracts) ||
      (minDate && minDate.isAfter(current, 'days')) ||
      (maxDate && maxDate.isBefore(current, 'days')) ||
      isWeekend(current) ||
      isHoliday(current, holidays)
    );
  };

  const getValidationSchema = () => {
    let fields: any = {
      description: Yup.string()
        .label('Description')
        .required(),
      typeId: Yup.number()
        .label('Type')
        .required(),
      projectResourceId: Yup.number()
        .label('Projet')
        .nullable(true),
      date: Yup.date()
        .label('Date')
        .required(),
      amount: Yup.number()
        .label('Montant (HT)')
        .required(),
      vat: Yup.number()
        .label('TVA')
        .required()
        .min(0)
        .max(100),
      files: Yup.array().of(
        Yup.object().shape({
          file: Yup.mixed(),
          fileContentType: Yup.string()
        })
      )
    };
    if (!isResource) {
      fields = {
        resourceId: Yup.number()
          .label('Ressource')
          .required(),
        ...fields
      };
    }
    return Yup.object().shape(fields);
  };

  const handleResourceChange = resourceId => {
    formikRef.current.setFieldValue('resourceId', resourceId);
    formikRef.current.setFieldValue('typeId', undefined);
    props.getContracts(resourceId);
    props.getProjectResources(resourceId);
  };

  const saveExpense = expenseValues => {
    const { files, ...values } = expenseValues;
    const payload = {
      ...values,
      submissionDate: moment(),
      projectResourceId: values.projectResourceId === -1 ? null : values.projectResourceId,
      date: moment(values.date).format(FORMAT_DATE_SERVER)
    };
    if (isResource) {
      payload.resourceId = props.currentResource.id;
      payload.validationStatus = ValidationStatus.PENDING;
      payload.validatorId = null;
    } else {
      payload.validationStatus = ValidationStatus.APPROVED;
      payload.validatorId = currentValidator.id;
    }
    props.createExpense(payload, files);
  };

  const handleClose = () => {
    if (props.onClose) {
      props.onClose();
    }
  };

  const handleSubmit = () => {
    formikRef.current.submitForm();
  };

  const getProjectName = (projectId: number): string => {
    const project = props.projects.find(p => p.id === projectId);
    return !!project ? project.nom : '';
  };

  const projectsNames = [
    { label: 'Interne', value: -1 },
    ...projectResources.map(pr => ({ label: getProjectName(pr.projectId), value: pr.id, disabled: !pr.active }))
  ];

  const footerActions = isResource
    ? [
        <Button key="cancel" onClick={handleClose} type="default">
          Annuler
        </Button>,
        <Button key="submit" onClick={handleSubmit} type="primary" loading={props.updating}>
          Soumettre à validation
        </Button>
      ]
    : [
        <Button key="cancel" onClick={handleClose} type="default">
          Annuler
        </Button>,
        <Button key="submit" onClick={handleSubmit} type="primary" loading={props.updating}>
          Sauvegarder
        </Button>
      ];

  const title = isResource ? 'Nouvelle Note de frais' : 'Crée une Nouvelle Note de frais valide';

  const { currentResource, resourcesConfig, expenseTypes, selectedResource } = props;
  const resources = props.resources.map(resource => {
    const resourceConfig = resourcesConfig.find(rc => rc.resourceId === resource.id);
    const canReportExpenses = !!resourceConfig && resourceConfig.active && resourceConfig.canReportExpenses;
    return {
      label: getFullName(resource),
      value: resource.id,
      disabled: !canReportExpenses
    };
  });
  const initialValues = {
    projectResourceId: -1,
    amount: 0,
    vat: 20
  };
  if (!currentResource.id) {
    if (selectedResource) {
      initialValues['resourceId'] = selectedResource.id;
    }
  }
  return (
    <Modal title={title} visible={visible} onCancel={handleClose} footer={footerActions} maskClosable={false} destroyOnClose centered>
      <Formik
        ref={formikRef}
        initialValues={initialValues}
        enableReinitialize
        validationSchema={getValidationSchema}
        onSubmit={saveExpense}
        isInitialValid
      >
        {formProps => (
          <Form>
            {!currentResource.id &&
              (selectedResource ? (
                <TextField label="Ressource" name="resource" readOnly value={getFullName(selectedResource)} layout="horizontal" />
              ) : (
                <SelectField
                  label="Ressource"
                  name="resourceId"
                  autoFocus
                  onChange={handleResourceChange}
                  options={resources}
                  layout="horizontal"
                />
              ))}
            {projectsNames.length > 0 && (
              <SelectField label="Projet" name="projectResourceId" options={projectsNames} layout="horizontal" />
            )}
            <SelectField
              label="Type"
              name="typeId"
              autoFocus={!!selectedResource}
              options={expenseTypes.map(lt => ({ label: lt.type, value: lt.id }))}
              layout="horizontal"
            />
            <DateField
              label="Date"
              name="date"
              disabledDate={disabledDate}
              allowClear={false}
              defaultPickerValue={minDate}
              layout="horizontal"
              disabled={!formProps.values.resourceId && !isResource}
            />
            <TextAreaField name="description" label="Description" layout="horizontal" placeholder="Ajouter une description ..." />
            <Row gutter={24} style={{ margin: '0px -12px -24px -12px' }}>
              <Col md={9}>
                <MoneyField
                  name="amount"
                  label={
                    <>
                      Montant <sup>HT</sup>
                    </>
                  }
                  layout="vertical"
                />
              </Col>
              <Col md={6}>
                <NumberField name="vat" label="TVA" layout="vertical" suffix="%" />
              </Col>
              <Col md={9}>
                <div className="ant-row ant-form-item total-label">
                  <div className="ant-form-item-label">
                    <label className="ant-form-item-required" title="TVA">
                      Total <sup>TTC</sup>
                    </label>
                  </div>
                  <div className="ant-form-item-control">
                    <b>{formatMoney(formProps.values.amount + formProps.values.amount * (formProps.values.vat / 100))}</b>
                    <small>€</small>
                  </div>
                </div>
              </Col>
            </Row>
            <FileBase64Field name="file" placeholder="Ajouter une justification" accept=".jpeg,.jpg,.pdf" max={6} multiple />
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

const mapStateToProps = ({
  application,
  authentication,
  expense,
  holiday,
  expenseType,
  resource,
  resourceContract,
  resourceConfiguration,
  project,
  projectResource
}: IRootState) => ({
  savedAbsence: expense.entity,
  currentResource: application.resource.current.entity,
  resources: resource.entities,
  holidays: holiday.entities,
  updating: expense.updating,
  updateSuccess: expense.updateSuccess,
  expenseTypes: expenseType.entities,
  account: authentication.account,
  contracts: resourceContract.entities,
  resourcesConfig: resourceConfiguration.entities,
  projects: project.entities,
  projectResources: projectResource.entities,
  currentValidator: application.expenseValidator.current
});

const mapDispatchToProps = {
  getAllResources: ResourceExt.getAll,
  createExpense: ExpenseExt.createExpense,
  getExpenseTypes: ExpenseType.getEntities,
  getHolidays: Holiday.getEntities,
  getContracts: ResourceContract.getByResource,
  getResourcesConfiguration: ResourceConfiguration.getAllByResources,
  getProjectResources: ProjectResourceExt.getByResource,
  getProjects: ProjectExt.getProjectsIdIn
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExpenseCreateModal);
