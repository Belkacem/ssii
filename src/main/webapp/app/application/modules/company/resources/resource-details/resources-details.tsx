import React, { FunctionComponent, lazy, Suspense, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';
import * as ProjectResourceInfoExt from 'app/application/entities/project-resource-info/project-resource-info.actions';
import * as ResourceConfiguration from 'app/application/entities/resource-configuration/resource-configuration.actions';

import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { Alert, Badge, Button, Col, Divider, Icon, Modal, Row, Skeleton, Tabs } from 'antd';
import Contracts, { contractTypes } from 'app/application/modules/company/resources/resource-contracts/contracts';
import { ResourceHistoryTimeline } from './resource-history-timeline';
import { ResourceDetailsStatus } from './resource-details-status';
import { ResourceConfigurationUpdate } from 'app/application/modules/company/resources/resource-configuration/resource-configuration-update';
import CreateAbsenceModal from 'app/application/modules/absences/absence-create/absence-create';
import ResourcesContract from '../resource-contracts/resources-contract';
import moment from 'moment';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { ContractType } from 'app/shared/model/resource-contract.model';
import { phoneNumberFormatter } from 'app/application/components/zsoft-form/custom-fields/phoneField.component';
import { DateFormat } from 'app/application/components/date.format.component';
import { LoadingDiv } from 'app/application/common/config/ui-constants';

const AbsenceCounters = lazy(() => import('app/application/modules/absences/absence-counters/absence-counters-per-resource'));

interface IResourcesDetailsProps extends StateProps, DispatchProps, RouteComponentProps<{ resource_id }> {}

const ResourcesDetails: FunctionComponent<IResourcesDetailsProps> = props => {
  const [absenceModalVisible, setAbsenceModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const { resourceEntity, loadingEmp, contracts, resourceConfig, resourceConfigUpdating, loadingContracts, errorMessage } = props;

  useEffect(
    () => {
      const resourceId = props.match.params.resource_id;
      if (!!resourceId) {
        props.getResource(resourceId);
        props.getContracts(resourceId);
        props.getProjectResourceInfosByResource(resourceId);
        props.getResourceConfiguration(resourceId);
      }
    },
    [props.match.params.resource_id]
  );

  const handleShowAbsenceModal = () => {
    setAbsenceModalVisible(true);
  };
  const handleHideAbsenceModal = () => {
    setAbsenceModalVisible(false);
  };
  const handleShowContractModal = contract => {
    setSelectedContract(contract);
  };
  const handleAddContract = () => {
    handleShowContractModal({
      compensation: 0,
      type: ContractType.EMPLOYEE
    });
  };
  const handleHideContractModal = () => {
    setSelectedContract(null);
  };
  const getLastContractType = () => {
    if (contracts.length > 0) {
      const lastContract = contracts.reduce((acc, val) => (moment(acc.startDate).isBefore(val.startDate, 'days') ? val : acc));
      return contractTypes.find(t => t.value === lastContract.type).label;
    }
  };

  const handleEditAction = () => {
    props.history.push(`/app/company/resources/${resourceEntity.id}/update`);
  };

  const handleDeleteAction = () => {
    Modal.confirm({
      title: "Suppression d'une ressource",
      content: (
        <span>
          Êtes-vous sûr de vouloir supprimer cette ressource ?<br />
          <b>{getFullName(resourceEntity)}</b>
        </span>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        props.deleteResources([resourceEntity.id]);
      }
    });
  };

  const handleToggleActive = () => {
    Modal.confirm({
      title: resourceConfig.active ? "Désactivation d'une ressource" : "Activation d'une ressource",
      content: (
        <>
          Êtes-vous sûr de {resourceConfig.active ? 'désactiver' : 'activer'} cette ressource ?<br />
          <b>{getFullName(resourceEntity)}</b>
        </>
      ),
      okText: resourceConfig.active ? 'Désactiver' : 'Activer',
      okType: resourceConfig.active ? 'danger' : 'primary',
      cancelText: 'Annuler',
      onOk: () => {
        props.updateResourceConfiguration({
          ...resourceConfig,
          active: !resourceConfig.active
        });
      }
    });
  };

  const handleResendTicket = () => props.resendTicket(resourceEntity);

  if (loadingEmp && !resourceEntity.id) {
    return (
      <div className="padding-3rem">
        <Skeleton active avatar />
      </div>
    );
  }
  if ((!loadingEmp && !resourceEntity.id && errorMessage) || !props.match.params.resource_id) {
    return (
      <div className="padding-3rem">
        <Alert message="Erreur" description="Ressource non trouvé !" type="error" showIcon />
      </div>
    );
  }
  const rowContracts = contracts.filter(contract => contract.resourceId === resourceEntity.id);
  return (
    <div>
      <PageHead
        title={<Badge dot offset={[10, 5]} status={resourceConfig.active ? 'success' : 'error'} children={getFullName(resourceEntity)} />}
        onBack="/app/company/resources"
        backOnlyMobile
        margin={false}
        actions={
          <>
            <Button type="primary" icon="edit" onClick={handleEditAction} className="ant-btn-textual">
              <span>Modifier</span>
            </Button>
            {resourceEntity.draft && (
              <Button type="danger" icon="delete" onClick={handleDeleteAction} className="ant-btn-textual">
                <span>Supprimer</span>
              </Button>
            )}
            <Button onClick={handleShowAbsenceModal} icon="schedule" className="ant-btn-textual">
              <span>Ajouter une absence</span>
            </Button>
            <Button
              type={resourceConfig.active ? 'danger' : 'primary'}
              icon={resourceConfig.active ? 'stop' : 'check-circle'}
              className="ant-btn-textual"
              onClick={handleToggleActive}
              children={resourceConfig.active ? <span>Désactiver</span> : <span>Activer</span>}
            />
          </>
        }
      />
      {resourceEntity.id === resourceConfig.resourceId &&
        !resourceConfig.active && (
          <a onClick={handleToggleActive}>
            <Alert
              message={
                <small>
                  Cette ressource est désactivée, ils ne pourront plus se connecter à ce compte, leurs données passées resteront visibles
                </small>
              }
              type="error"
              banner
            />
          </a>
        )}
      {alert && (
        <a onClick={handleEditAction}>
          <ResourceDetailsStatus resource={resourceEntity} loading={loadingEmp} />
        </a>
      )}
      {resourceEntity.userId === null && (
        <a onClick={handleResendTicket}>
          <Alert
            message={<small>Envoyer un nouveau lien d'invitation à cette ressource pour créer un compte et remplir leur profil</small>}
            type="warning"
            icon={<Icon type="mail" theme="filled" />}
            banner
          />
        </a>
      )}
      {rowContracts.length === 0 &&
        !loadingContracts && (
          <a onClick={handleAddContract}>
            <Alert message={<small>Contrat manquant !</small>} type="error" banner />
          </a>
        )}
      <Tabs
        defaultActiveKey="about"
        size="small"
        className="padding-bottom-1rem"
        tabBarGutter={16}
        animated={{ inkBar: false, tabPane: true }}
      >
        <Tabs.TabPane
          tab={
            <small>
              <Icon type="info-circle" /> À propos
            </small>
          }
          key="about"
          className="padding-1rem"
        >
          <div style={{ minHeight: 112 }}>
            <div style={{ float: 'left', marginRight: 16 }}>
              <Avatar name={getFullName(resourceEntity)} size={120} borderRadius="4px" />
            </div>
            <div>
              <h3>
                <b>{getFullName(resourceEntity)}</b>
              </h3>
              <div>
                <dl>
                  <dt>Contrat</dt>
                  <dd>{getLastContractType()}</dd>
                  {resourceEntity.identification && (
                    <>
                      <dt>Matricule</dt>
                      <dd>{resourceEntity.identification}</dd>
                    </>
                  )}
                  {resourceEntity.socialSecurity && (
                    <>
                      <dt>N° Sécurité sociale</dt>
                      <dd>{resourceEntity.socialSecurity}</dd>
                    </>
                  )}
                  <dt>Embauche</dt>
                  <dd>
                    {resourceEntity.hireDate ? (
                      <>
                        <DateFormat value={resourceEntity.hireDate} /> ({moment(resourceEntity.hireDate).fromNow()})
                      </>
                    ) : (
                      '-'
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <Divider />
          <Row>
            <Col sm={16}>
              <Divider orientation="left" dashed>
                Détails personnels et contact
              </Divider>
              {/* BASIC INFORMATION */}
              <dl>
                <dt>Téléphone</dt>
                <dd>
                  {resourceEntity.phoneNumber ? (
                    <a href={`tel:${phoneNumberFormatter(resourceEntity.phoneNumber)}`}>
                      {phoneNumberFormatter(resourceEntity.phoneNumber)}
                    </a>
                  ) : (
                    '-'
                  )}
                </dd>
                <dt>Adresse Email</dt>
                <dd>
                  <a href={`mailto:${resourceEntity.email}`}>{resourceEntity.email}</a>
                </dd>
                <dt>Date de naissance</dt>
                <dd>{resourceEntity.dateOfBirth ? <DateFormat value={resourceEntity.dateOfBirth} /> : '-'}</dd>
                <dt>Sexe</dt>
                <dd>{!resourceEntity.gender ? '' : resourceEntity.gender === 'MALE' ? 'Masculin' : 'Féminin'}</dd>
              </dl>
              <Divider orientation="left" dashed>
                Adresse
              </Divider>
              <dl className="jh-entity-details">
                <dt>Adresse Ligne 1</dt>
                <dd>{resourceEntity.addressLine1}</dd>
                <dt>Adresse Ligne 2</dt>
                <dd>{resourceEntity.addressLine2}</dd>
                <dt>Ville</dt>
                <dd>{resourceEntity.city}</dd>
                <dt>Code postal</dt>
                <dd>{resourceEntity.postalCode}</dd>
                <dt>Pays</dt>
                <dd>{resourceEntity.country}</dd>
              </dl>
              <Divider orientation="left" dashed>
                Citoyenneté et permis de travail
              </Divider>
              {/* CITIZENSHIP INFORMATION */}
              <dl>
                <dt>Pays de naissance</dt>
                <dd>{resourceEntity.countryOfBirth}</dd>
                <dt>Ville de naissance</dt>
                <dd>{resourceEntity.townOfBirth}</dd>
                <dt>Citoyenneté</dt>
                <dd>{resourceEntity.citizenShip}</dd>
              </dl>
              {/* WORK PERMIT INFORMATION */}
              {resourceEntity.citizenShip !== 'France' && (
                <dl>
                  <dt>Type di permis de travail</dt>
                  <dd>{resourceEntity.workPermitType}</dd>
                  <dt>Numéro di permis de travail</dt>
                  <dd>{resourceEntity.workPermitNumber}</dd>
                  <dt>Date d'expiration di permis de travail</dt>
                  <dd>{resourceEntity.workPermitExpiryDate ? <DateFormat value={resourceEntity.workPermitExpiryDate} /> : '-'}</dd>
                </dl>
              )}
            </Col>
            <Col sm={8}>
              <Divider orientation="right" dashed>
                Timeline de la ressource
              </Divider>
              <ResourceHistoryTimeline
                resource={resourceEntity}
                projectResources={props.projectResources}
                projects={props.projects}
                contracts={props.contracts}
              />
            </Col>
          </Row>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <small>
              <Icon type="calendar" /> Congés et Absences
            </small>
          }
          key="absence_counters"
        >
          <Suspense fallback={<LoadingDiv />}>
            <AbsenceCounters resource={resourceEntity} />
          </Suspense>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <small>
              <Icon type="audit" /> Contrats
            </small>
          }
          key="contracts"
        >
          <Contracts resource={resourceEntity} onShowContractModal={handleShowContractModal} />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={
            <small>
              <Icon type="setting" /> Configurations
            </small>
          }
          key="configuration"
        >
          <ResourceConfigurationUpdate
            configuration={resourceConfig}
            updating={resourceConfigUpdating}
            onUpdate={props.updateResourceConfiguration}
          />
        </Tabs.TabPane>
      </Tabs>
      <CreateAbsenceModal show={absenceModalVisible} selectedResource={resourceEntity} onClose={handleHideAbsenceModal} />
      <ResourcesContract resource={resourceEntity} contract={selectedContract} onClose={handleHideContractModal} />
    </div>
  );
};

const mapStateToProps = ({ resource, resourceContract, resourceConfiguration, projectResource, project }: IRootState) => ({
  resourceEntity: resource.entity,
  loadingEmp: resource.loading,
  errorMessage: resource.errorMessage,
  contracts: resourceContract.entities,
  loadingContracts: resourceContract.loading,
  resourceConfig: resourceConfiguration.entity,
  resourceConfigUpdating: resourceConfiguration.updating,
  projectResources: projectResource.entities,
  projects: project.entities
});

const mapDispatchToProps = {
  getResource: ResourceExt.getById,
  updateResource: ResourceExt.update,
  resendTicket: ResourceExt.resendTicket,
  getContracts: ResourceContract.getByResource,
  getProjectResourceInfosByResource: ProjectResourceInfoExt.getByResource,
  getResourceConfiguration: ResourceConfiguration.getByResource,
  updateResourceConfiguration: ResourceConfiguration.update,
  deleteResources: ResourceExt.deleteBulk
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ResourcesDetails));
