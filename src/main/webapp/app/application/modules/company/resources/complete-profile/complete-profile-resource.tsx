import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import { Progress } from 'antd';
import { getCurrentStep } from 'app/application/common/utils/resource-utils';
import { CompleteProfileStep1 } from './complete-profile-step-1';
import { CompleteProfileStep2 } from './complete-profile-step-2';
import { CompleteProfileStep3 } from './complete-profile-step-3';
import { CompleteProfileStep4 } from './complete-profile-step-4';
import { RouteComponentProps } from 'react-router-dom';
import StepsPage, { IStepProps } from 'app/application/components/steps/steps-page';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { IResource } from 'app/shared/model/resource.model';

interface ICompleteProfileResourceProps extends StateProps, DispatchProps, RouteComponentProps {}

const LAST_STEP = 4;

const CompleteProfileResource: FunctionComponent<ICompleteProfileResourceProps> = props => {
  const { profile, contracts, updating } = props;
  const currentStep = getCurrentStep(profile);
  const [progressEffect, setProgressEffect] = useState(0);

  useEffect(() => {
    props.resetContracts();
    props.getContractByResource(props.profile.id);
  }, []);

  useEffect(
    () => {
      if (currentStep === LAST_STEP) {
        const redirectTimeOut = setTimeout(() => {
          props.history.push('/app/home');
        }, 5000);
        return () => {
          clearTimeout(redirectTimeOut);
        };
      }
    },
    [currentStep]
  );

  useEffect(
    () => {
      if (currentStep === LAST_STEP && progressEffect < 100) {
        setProgressEffect(progressEffect + 1);
      }
    },
    [progressEffect]
  );

  const handleSaveProfile = (resource: IResource) => {
    props.completeProfile(resource);
  };

  const resourceFormSteps: IStepProps[] = [
    {
      title: 'Personnel',
      description: 'Informations personnelles.',
      content: <CompleteProfileStep1 profile={profile} updating={updating} onSave={handleSaveProfile} />
    },
    {
      title: 'Contact',
      description: 'Détails du contact.',
      content: <CompleteProfileStep2 profile={profile} updating={updating} onSave={handleSaveProfile} />
    },
    {
      title: 'Embauche',
      description: 'Détails embauche.',
      content: <CompleteProfileStep3 profile={profile} updating={updating} contracts={contracts} onSave={handleSaveProfile} />
    },
    {
      title: 'Citoyenneté',
      description: 'Citoyenneté et Permis de travail.',
      content: <CompleteProfileStep4 profile={profile} updating={updating} onSave={handleSaveProfile} />
    },
    {
      title: 'Terminer',
      description: '',
      content: (
        <>
          <div style={{ textAlign: 'center' }}>
            <Progress type="circle" percent={progressEffect} width={120} style={{ padding: 16 }} />
            <h2>Bon travail</h2>
            Les informations de votre profil sont complétées avec succès
          </div>
        </>
      )
    }
  ];
  return (
    <div className="page-layout fullHeight">
      <PageHead title="Completer mon profile" />
      <div className="page-layout">
        <StepsPage steps={resourceFormSteps} current={currentStep} showSteps={currentStep !== LAST_STEP} />
      </div>
    </div>
  );
};

const mapStateToProps = ({ application, resource, resourceContract }: IRootState) => ({
  profile: application.resource.current.entity,
  updating: resource.updating,
  updateSuccess: resource.updateSuccess,
  errorMessage: resource.errorMessage,
  contracts: resourceContract.entities
});

const mapDispatchToProps = {
  resetContracts: ResourceContract.resetContracts,
  getContractByResource: ResourceContract.getByResource,
  completeProfile: ResourceExt.completeProfile
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(CompleteProfileResource);
