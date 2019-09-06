import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';
import { IResource } from 'app/shared/model/resource.model';

import moment from 'moment';
import { Alert } from 'antd';

import { ResourcesFormStep1 } from './resources-form-step-1';
import { ResourcesFormStep2 } from './resources-form-step-2';
import { ResourcesFormStep3 } from './resources-form-step-3';
import { ResourcesFormStep4 } from './resources-form-step-4';
import { ResourcesFormStep5 } from './resources-form-step-5';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import StepsPage, { IStepProps } from 'app/application/components/steps/steps-page';
import { PageHead } from 'app/application/common/layout/page-head/page-head';

interface IResourcesFormProps extends StateProps, DispatchProps, RouteComponentProps<{ resource_id }> {}

const ResourcesForm: FunctionComponent<IResourcesFormProps> = props => {
  const [resource, setResource] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [emailExistError, setEmailExistError] = useState(false);
  const isNew = props.match.params.resource_id === undefined;

  useEffect(
    () => {
      setCurrentStep(0);
      props.resetResource();
      props.resetContracts();
      if (!props.match.params.resource_id) {
        setResource({});
      } else {
        props.getResource(props.match.params.resource_id);
        props.getContractByResource(props.match.params.resource_id);
      }
    },
    [props.match.params.resource_id]
  );

  useEffect(
    () => {
      if (props.updateSuccess) {
        if (!isNew) {
          handleClose();
        } else {
          setResource(props.resourceEntity);
        }
      }
    },
    [props.updateSuccess]
  );

  useEffect(
    () => {
      if (props.updateSuccessContract) {
        handleClose();
      }
    },
    [props.updateSuccessContract]
  );

  useEffect(
    () => {
      if (props.resourceEntity) {
        setResource(props.resourceEntity);
      }
    },
    [props.resourceEntity]
  );

  useEffect(
    () => {
      if (isNew && props.errorMessage) {
        if (props.errorMessage.response.data.errorKey === 'emailexists') {
          setEmailExistError(true);
        }
      }
    },
    [props.errorMessage]
  );

  useEffect(
    () => {
      if (emailExistError) {
        setCurrentStep(0);
      }
    },
    [emailExistError]
  );

  const handleCurrentStepChange = (step: number, resourceEntity: IResource = resource) => {
    setCurrentStep(step);
    setResource(resourceEntity);
  };

  const handleEmailChanged = () => {
    setEmailExistError(false);
  };

  const formatServerDate = date => (date === null ? null : moment(date).format(FORMAT_DATE_SERVER));

  const handleSave = values => {
    const payload = {
      ...props.resourceEntity,
      ...values,
      dateOfBirth: formatServerDate(values.dateOfBirth),
      hireDate: formatServerDate(values.hireDate),
      workPermitExpiryDate: formatServerDate(values.workPermitExpiryDate),
      draft: false
    };
    if (isNew) {
      props.createResource(payload);
    } else {
      props.updateResource(payload);
    }
  };

  const handleCreateContract = values => props.createContract(values);

  const handleClose = () => props.history.push(`/app/company/resources/${props.resourceEntity.id}/profile`);

  const handleGoBack = () => props.history.goBack();

  const { loadingEmp, errorMessage, updating, updatingContract, contracts } = props;
  if (!isNew && !loadingEmp && errorMessage) {
    return (
      <div className="padding-3rem">
        <Alert message="Erreur" description="Ressource non trouvé !" type="error" showIcon />
      </div>
    );
  }
  const resourceFormSteps: IStepProps[] = [
    {
      title: 'Personnel',
      description: 'Informations personnelles.',
      content: (
        <ResourcesFormStep1
          resource={resource}
          onNext={handleCurrentStepChange}
          emailExistError={emailExistError}
          emailChanged={handleEmailChanged}
          isNew={isNew}
          onSave={handleSave}
          updating={updating}
        />
      )
    },
    {
      title: 'Contact',
      description: 'Détails du contact.',
      content: (
        <ResourcesFormStep2 resource={resource} onNext={handleCurrentStepChange} isNew={isNew} onSave={handleSave} updating={updating} />
      )
    },
    {
      title: 'Embauche',
      description: 'Détails embauche.',
      content: (
        <ResourcesFormStep3
          resource={resource}
          contracts={contracts}
          onNext={handleCurrentStepChange}
          isNew={isNew}
          onSave={handleSave}
          updating={updating}
        />
      )
    },
    {
      title: 'Citoyenneté',
      description: 'Citoyenneté et Permis de travail.',
      content: (
        <ResourcesFormStep4 resource={resource} onNext={handleCurrentStepChange} isNew={isNew} onSave={handleSave} updating={updating} />
      )
    }
  ];
  if (isNew) {
    resourceFormSteps.push({
      title: 'Contrat',
      description: 'Ajouter un contrat.',
      content: <ResourcesFormStep5 resource={resource} onSave={handleCreateContract} updating={updatingContract} />
    });
  }

  return (
    <div className="page-layout fullHeight">
      <PageHead
        title={isNew ? "Création d'une nouvelle ressource" : "Modification d'une ressource"}
        onBack={isNew ? handleGoBack : handleClose}
        margin={false}
      />
      <div className="page-layout">
        {Object.keys(resource).length > 0 && (
          <StepsPage onNavigate={!isNew ? handleCurrentStepChange : undefined} steps={resourceFormSteps} current={currentStep} />
        )}
      </div>
    </div>
  );
};

export const convertDateTimeFromServer = date => date && moment(date, FORMAT_DATE_SERVER);

const mapStateToProps = ({ resource, resourceContract }: IRootState) => ({
  resourceEntity: resource.entity,
  loadingEmp: resource.loading,
  errorMessage: resource.errorMessage,
  updating: resource.updating,
  updateSuccess: resource.updateSuccess,
  contracts: resourceContract.entities,
  updateSuccessContract: resourceContract.updateSuccess,
  updatingContract: resourceContract.updating
});

const mapDispatchToProps = {
  createResource: ResourceExt.create,
  getResource: ResourceExt.getById,
  updateResource: ResourceExt.update,
  resetResource: ResourceExt.reset,
  createContract: ResourceContract.createContract,
  resetContracts: ResourceContract.resetContracts,
  getContractByResource: ResourceContract.getByResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ResourcesForm);
