import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import ProjectsUpdateModal from '../project-update/projects-update-modal';
import { Alert, Button, Divider, Icon, Skeleton } from 'antd';
import * as Client from 'app/entities/client/client.reducer';
import { ClientDetailsSmall } from 'app/application/modules/invoices/clients/client-details/client-details-small';

interface IProjectDetailsProps extends StateProps, DispatchProps, RouteComponentProps<{ project_id }> {}

const ProjectDetails: FunctionComponent<IProjectDetailsProps> = props => {
  const [showModal, setShowModal] = useState(false);
  const { project, loading, client, clientLoading } = props;

  useEffect(
    () => {
      if (props.project && !!props.project.clientId) {
        props.getClient(props.project.clientId);
      }
    },
    [props.project.clientId]
  );

  const handleUpdateAction = () => setShowModal(true);

  const handleHideModal = () => setShowModal(false);

  return (
    <div className="fullwidth">
      <PageHead
        title="Tableau de bord du projet"
        margin={false}
        actions={
          <Button title="Modifier le projet" className="ant-btn-textual" type="primary" onClick={handleUpdateAction}>
            <Icon type="edit" />
            <span>Modifier</span>
          </Button>
        }
      />
      <div style={{ padding: '1rem' }}>
        {loading ? (
          <Skeleton paragraph={{ rows: 2 }} title={false} active />
        ) : (
          <dl className="jh-entity-details">
            <dt>Nom du projet</dt>
            <dd>{project.nom}</dd>
            <dt>Localisation</dt>
            <dd>{project.localisation}</dd>
          </dl>
        )}
        <Divider orientation="left" className="margin-bottom-8">
          Détails de Client
        </Divider>
        {loading || clientLoading ? (
          <Skeleton active />
        ) : project.clientId !== null && client ? (
          <ClientDetailsSmall client={client} />
        ) : (
          <Alert
            message={
              <small>
                <b>Attention</b> : Le client de ce projet est manquant
              </small>
            }
            type="warning"
            showIcon
          />
        )}
      </div>
      <ProjectsUpdateModal showModal={showModal} handleClose={handleHideModal} projectEntity={project} />
    </div>
  );
};

const mapStateToProps = ({ client, project }: IRootState) => ({
  project: project.entity,
  loading: project.loading,
  client: client.entity,
  clientLoading: client.loading
});

const mapDispatchToProps = {
  getClient: Client.getEntity
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ProjectDetails);
