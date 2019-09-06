import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Modal } from 'antd';
import { IClient } from 'app/shared/model/client.model';
import * as Client_ext from 'app/application/entities/client/client.actions';
import StepsPage, { IStepProps } from 'app/application/components/steps/steps-page';

import { ClientsFormStep1 } from './client-form-step-1';
import { ClientsFormStep2 } from './client-form-step-2';
import { ClientsFormStep3 } from './client-form-step-3';
import { ClientsFormStep4 } from './client-form-step-4';
import { ClientsFormStep5 } from './client-form-step-5';
import { sirenFormatter, sirenParser } from 'app/application/components/zsoft-form/custom-fields/sirenField.component';

interface IClientsFormProps extends StateProps, DispatchProps {
  showModal: boolean;
  clientEntity: IClient;
  handleClose: any;
  step?: number;
}

const ClientsForm: FunctionComponent<IClientsFormProps> = props => {
  const [client, setClient] = useState();
  const [currentStep, setCurrentStep] = useState(0);
  const isNew = !!props.clientEntity && props.clientEntity.id === undefined;
  const { updating, handleClose, showModal } = props;

  useEffect(
    () => {
      if (!!props.step) {
        setCurrentStep(props.step);
      }
    },
    [props.step]
  );

  useEffect(
    () => {
      setCurrentStep(props.step ? props.step : 0);
      if (!!props.clientEntity) {
        props.clientEntity.siren = sirenFormatter(props.clientEntity.siren);
      }
      setClient(props.clientEntity);
    },
    [props.showModal]
  );

  useEffect(
    () => {
      if (props.updateSuccess) {
        props.handleClose();
      }
    },
    [props.updateSuccess]
  );

  const handleSave = values => {
    if (isNew) {
      const clientPayload = {
        ...values,
        companyId: props.company.id
      };
      clientPayload.siren = sirenParser(clientPayload.siren);
      props.createClient(clientPayload);
    } else {
      const clientPayload = {
        ...props.clientEntity,
        ...values
      };
      clientPayload.siren = sirenParser(clientPayload.siren);
      props.updateClient(clientPayload);
    }
  };

  const handleChangeStep = (step, clientEntity = client) => {
    setCurrentStep(step);
    setClient(clientEntity);
  };
  let clientFormSteps: IStepProps[] = [];
  if (isNew) {
    clientFormSteps.push({
      title: 'Chercher',
      description: 'trouver un client par son numéro SIREN.',
      content: (
        <ClientsFormStep1
          client={client}
          company={props.company}
          fetchedClient={props.fetchedClient}
          fetching={props.fetching}
          errorMessage={props.errorMessage}
          onFetch={props.getClientBySiren}
          onChangeStep={handleChangeStep}
        />
      )
    });
  }
  clientFormSteps = clientFormSteps.concat([
    {
      title: 'Informations de Base',
      description: 'Modifier les informations de base du client.',
      content: (
        <ClientsFormStep2
          client={client}
          onChangeStep={handleChangeStep}
          isNew={isNew}
          onSave={handleSave}
          updating={updating}
          currentStep={currentStep}
        />
      )
    },
    {
      title: 'Adresse',
      description: "modifier l'adresse du client.",
      content: (
        <ClientsFormStep3
          client={client}
          onChangeStep={handleChangeStep}
          isNew={isNew}
          onSave={handleSave}
          updating={updating}
          currentStep={currentStep}
        />
      )
    },
    {
      title: 'Informations Additionnelles',
      description: 'Modifier les informations additionnelles du client.',
      content: (
        <ClientsFormStep4
          client={client}
          onChangeStep={handleChangeStep}
          isNew={isNew}
          onSave={handleSave}
          updating={updating}
          currentStep={currentStep}
        />
      )
    },
    {
      title: 'Coordonnées bancaires',
      description: 'modifier les coordonnées bancaires du client.',
      content: (
        <ClientsFormStep5
          client={client}
          onChangeStep={handleChangeStep}
          onSave={handleSave}
          updating={updating}
          currentStep={currentStep}
        />
      )
    }
  ]);

  return (
    <Modal
      title={isNew ? "Création d'un nouveau client" : "Modification d'un client"}
      visible={showModal}
      onCancel={handleClose}
      destroyOnClose
      footer={false}
      maskClosable={false}
      bodyStyle={{ padding: 0 }}
      centered
      width={768}
    >
      {client && currentStep !== -1 && <StepsPage onNavigate={!isNew && handleChangeStep} steps={clientFormSteps} current={currentStep} />}
    </Modal>
  );
};

const mapStateToProps = ({ application, client }: IRootState) => ({
  updating: client.updating,
  company: application.company.current,
  updateSuccess: client.updateSuccess,
  fetchedClient: application.client.fetchedClient,
  fetching: application.client.fetching,
  errorMessage: application.client.errorMessage
});

const mapDispatchToProps = {
  createClient: Client_ext.createClient,
  updateClient: Client_ext.updateClient,
  resetClient: Client_ext.resetClient,
  getClientBySiren: Client_ext.getClientBySiren
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ClientsForm);
