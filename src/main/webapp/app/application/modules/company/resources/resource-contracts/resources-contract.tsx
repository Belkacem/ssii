import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';
import { Form, Formik } from 'formik';
import { Button, Checkbox, Col, Modal, Row } from 'antd';
import { ContractType } from 'app/shared/model/resource-contract.model';
import * as Yup from 'yup';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import moment from 'moment';
import { getCompensationLabel } from 'app/application/common/utils/resource-utils';
import MoneyField from 'app/application/components/zsoft-form/custom-fields/moneyField.component';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import DateRangeField from 'app/application/components/zsoft-form/generic-fields/dateRangeField.component';

interface IResourcesContractProps extends StateProps, DispatchProps {
  resource: any;
  contract: any;
  onClose: Function;
}

const getValidationSchema = (requiredEndDate: boolean) =>
  Yup.object().shape({
    startDate: Yup.date()
      .label('Date début')
      .required(),
    endDate: Yup.date()
      .label('Date fin')
      .nullable(true)
      .when('$hasEndDate', (hasEndDate, schema) => {
        if (requiredEndDate) {
          return schema.required();
        }
        return schema;
      }),
    type: Yup.string()
      .label('Type de contrat')
      .required(),
    compensation: Yup.number()
      .label('Compensation')
      .required()
  });

const ResourcesContract: FunctionComponent<IResourcesContractProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const isNew = !props.contract || props.contract.id === undefined;
  const { updating, contract, resource } = props;

  useEffect(
    () => {
      if (props.updateSuccess) {
        handleClose();
      }
    },
    [props.updateSuccess]
  );

  useEffect(
    () => {
      if (!!contract) {
        setHasEndDate(contract.id === undefined ? false : contract.endDate !== null);
      }
    },
    [contract]
  );

  const disabledDate = current => {
    const contracts = props.contracts.filter(c => isNew || c.id !== c.id);
    const collisionContract = contracts.some(c => {
      if (c.endDate === null) {
        return current.isSame(c.startDate, 'days');
      }
      return current.isBetween(c.startDate, c.endDate, 'days', '[]');
    });
    return collisionContract || (resource.hireDate && current.isBefore(resource.hireDate, 'days'));
  };

  const getLastContract = () => {
    const contracts = props.contracts;
    const maxDate = contracts.reduce(
      (acc, c) => moment.max(acc, moment(c.startDate)),
      contracts.length > 0 ? moment(contracts[0].startDate) : moment()
    );
    return contracts.find(c => maxDate.isSame(c.startDate, 'days'));
  };

  const defaultPickerValue = () => {
    const lastContract = getLastContract();
    return lastContract
      ? lastContract.endDate === null
        ? moment(lastContract.startDate).add(1, 'days')
        : moment(lastContract.endDate).add(1, 'days')
      : null;
  };

  const handleSaveContract = values => {
    const payload = { ...values };
    if (typeof values.startDate === 'object') {
      payload.startDate = values.startDate.format(FORMAT_DATE_SERVER);
      payload.endDate = values.endDate ? values.endDate.format(FORMAT_DATE_SERVER) : null;
    }
    payload.endDate = hasEndDate ? values.endDate.format(FORMAT_DATE_SERVER) : null;
    if (isNew) {
      payload.resourceId = resource.id;
      props.createContract(payload);
      const lastContract = getLastContract();
      if (lastContract && lastContract.endDate === null) {
        props.updateContract({
          ...lastContract,
          endDate: moment(payload.startDate)
        });
      }
    } else {
      props.updateContract(payload);
    }
  };

  const handleClose = () => {
    props.onClose();
  };

  const handleSubmit = () => {
    formikRef.current.submitForm();
  };

  const handleDelete = () => {
    props.deleteContract(contract.id);
  };

  const toggleEndDate = () => {
    setHasEndDate(!hasEndDate);
  };

  const actions = [
    <Button key="cancel" onClick={handleClose} type="default">
      Annuler
    </Button>
  ];
  if (!isNew) {
    actions.push(
      <Button key="delete" onClick={handleDelete} type="danger" disabled={updating}>
        Supprimer
      </Button>
    );
    actions.push(
      <Button key="submit" onClick={handleSubmit} type="primary" disabled={updating}>
        Modifier
      </Button>
    );
  } else {
    actions.push(
      <Button key="submit" onClick={handleSubmit} type="primary" disabled={updating}>
        Créer
      </Button>
    );
  }
  const initData = !isNew ? contract : { ...contract, startDate: resource.hireDate };
  if (!!initData && initData.startDate && typeof initData.startDate === 'string') {
    initData.startDate = moment(initData.startDate);
  }
  if (!!initData && initData.endDate && typeof initData.endDate === 'string') {
    initData.endDate = moment(initData.endDate);
  }
  return (
    <Modal
      title={isNew ? 'Créer un contrat' : 'Modifier le contrat'}
      visible={contract !== null}
      onCancel={handleClose}
      footer={actions}
      maskClosable={false}
      destroyOnClose
    >
      <Formik
        ref={formikRef}
        initialValues={initData}
        enableReinitialize
        validationSchema={getValidationSchema(hasEndDate)}
        onSubmit={handleSaveContract}
      >
        {formProps => (
          <Form>
            <Row>
              <Col sm={8} />
              <Col sm={16}>
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
                defaultPickerValue={defaultPickerValue()}
                layout={{
                  labelCol: { span: 8 },
                  wrapperCol: { span: 16 }
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
                defaultPickerValue={defaultPickerValue()}
                layout={{
                  labelCol: { span: 8 },
                  wrapperCol: { span: 16 }
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
                labelCol: { span: 8 },
                wrapperCol: { span: 16 }
              }}
            />
            <MoneyField
              name="compensation"
              label={getCompensationLabel(formProps.values.type)}
              layout={{
                labelCol: { span: 8 },
                wrapperCol: { span: 16 }
              }}
            />
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

const mapStateToProps = ({ resourceContract }: IRootState) => ({
  contracts: resourceContract.entities,
  updating: resourceContract.updating,
  updateSuccess: resourceContract.updateSuccess
});

const mapDispatchToProps = {
  createContract: ResourceContract.createContract,
  updateContract: ResourceContract.updateContract,
  deleteContract: ResourceContract.deleteContract
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourcesContract);
