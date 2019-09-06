import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { Button, Divider, Skeleton } from 'antd';
import { phoneNumberFormatter } from 'app/application/components/zsoft-form/custom-fields/phoneField.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { DateFormat } from 'app/application/components/date.format.component';
import moment from 'moment';
import { contractTypes } from 'app/application/modules/company/resources/resource-contracts/contracts';

interface IResourceProfileProps extends StateProps, DispatchProps, RouteComponentProps {}

const ResourceProfile: FunctionComponent<IResourceProfileProps> = props => {
  const { resourceEntity, loading, contracts } = props;

  const getLastContractType = () => {
    if (contracts.length > 0) {
      const lastContract = contracts.reduce((acc, val) => (moment(acc.startDate).isBefore(val.startDate, 'days') ? val : acc));
      return contractTypes.find(t => t.value === lastContract.type).label;
    }
  };

  const handleEditAction = () => {
    props.history.push(`/app/resource/profile/update`);
  };

  if (loading) {
    return (
      <div className="padding-3rem">
        <Skeleton active avatar />
      </div>
    );
  }
  return (
    <div>
      <PageHead
        title="Mon Profil"
        onBack="/app/home"
        backOnlyMobile
        margin={false}
        actions={
          <>
            <Button type="primary" icon="edit" onClick={handleEditAction} className="ant-btn-textual">
              <span>Modifier</span>
            </Button>
          </>
        }
      />
      <div style={{ minHeight: 153, padding: '1rem' }}>
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
      <Divider className="no-margin" />
      <div>
        <Divider orientation="left" dashed>
          Détails personnels et contact
        </Divider>
        {/* BASIC INFORMATION */}
        <dl>
          <dt>Téléphone</dt>
          <dd>
            {resourceEntity.phoneNumber ? (
              <a href={`tel:${phoneNumberFormatter(resourceEntity.phoneNumber)}`}>{phoneNumberFormatter(resourceEntity.phoneNumber)}</a>
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
      </div>
      <br />
    </div>
  );
};

const mapStateToProps = ({ application, resourceContract }: IRootState) => ({
  loading: application.resource.current.loading,
  resourceEntity: application.resource.current.entity,
  contracts: resourceContract.entities
});

const mapDispatchToProps = {};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ResourceProfile);
