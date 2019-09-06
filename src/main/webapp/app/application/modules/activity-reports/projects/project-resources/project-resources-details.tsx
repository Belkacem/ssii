import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { Alert, Badge, Button, Divider, Dropdown, Icon, Menu, Modal } from 'antd';
import * as ProjectResourceExt from 'app/application/entities/project-resource/project-resource.actions';
import * as ProjectResource from 'app/entities/project-resource/project-resource.reducer';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import ProjectResourceInfo from './project-resource-info/project-resource-info-list';
import ProjectResourcesUpdateModal from './project-resources-update';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { LoadingDiv } from 'app/application/common/config/ui-constants';
import { DateFormat } from 'app/application/components/date.format.component';

interface IProjectResourcesDetailsProps extends StateProps, DispatchProps, RouteComponentProps<{ project_resource_id }> {}

const ProjectResourcesDetails: FunctionComponent<IProjectResourcesDetailsProps> = props => {
  const [visible, setVisible] = useState(false);
  const { projectResource, resource, project, loading, loadingResource, errorMessage } = props;

  useEffect(
    () => {
      props.getProjectResource(props.match.params.project_resource_id);
    },
    [props.match.params.project_resource_id]
  );

  useEffect(
    () => {
      if (!!projectResource.resourceId) {
        props.getResource(projectResource.resourceId);
      }
    },
    [projectResource]
  );

  const handleDeleteAction = () => {
    Modal.confirm({
      title: 'Suppression du membre',
      content: (
        <span>
          Êtes-vous sûr de supprimer ce membre(s) ?<br />
          <b>{getFullName(resource)}</b>
        </span>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        props.deleteProjectResource(projectResource.id);
      }
    });
  };

  const handleShowUpdateModal = () => setVisible(true);

  const handleHideUpdateModal = () => setVisible(false);

  const handleToggleActive = () => {
    Modal.confirm({
      title: projectResource.active ? 'Désactivation du membre' : 'Activation du membre',
      content: <>Êtes-vous sûr de {projectResource.active ? 'désactiver' : 'activer'} ce membre ?</>,
      okText: projectResource.active ? 'Désactiver' : 'Activer',
      okType: projectResource.active ? 'danger' : 'primary',
      cancelText: 'Annuler',
      onOk: () => {
        props.updateProjectResource({
          ...projectResource,
          active: !projectResource.active
        });
      }
    });
  };

  const actionsMenu = (
    <Menu>
      <Menu.Item onClick={handleShowUpdateModal}>
        <Icon type="edit" /> Modifier
      </Menu.Item>
      <Menu.Item onClick={handleDeleteAction}>
        <Icon type="delete" /> Supprimer
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item onClick={handleToggleActive}>
        <Icon type={projectResource.active ? 'stop' : 'check-circle'} /> {projectResource.active ? 'Désactiver' : 'Activer'}
      </Menu.Item>
    </Menu>
  );

  if (loading || loadingResource) {
    return <LoadingDiv />;
  }
  if (!loading && errorMessage) {
    return (
      <div className="padding-3rem">
        <Alert message="Erreur" description="Membre non trouvé !" type="error" showIcon />
      </div>
    );
  }
  return (
    <div>
      <PageHead
        title={getFullName(resource)}
        subTitle={
          <Badge
            dot
            status={projectResource.active ? 'success' : 'error'}
            offset={[8, 12]}
            title={projectResource.active ? 'Active' : 'Inactive'}
          >
            <small>{projectResource.projectEmail}</small>
          </Badge>
        }
        onBack={`/app/company/projects/${project.id}/members`}
        margin={false}
        actions={
          <Dropdown overlay={actionsMenu}>
            <Button icon="setting">
              Actions <Icon type="down" />
            </Button>
          </Dropdown>
        }
      />
      <div style={{ padding: 8, textAlign: 'center' }}>
        <small>
          <DateFormat value={projectResource.startDate} />
          {' - '}
          {projectResource.endDate === null ? "Jusqu'à maintenant" : <DateFormat value={projectResource.endDate} />}
        </small>
      </div>
      <Divider style={{ margin: 0 }} />
      <ProjectResourceInfo projectResource={projectResource} />
      <ProjectResourcesUpdateModal visible={visible} projectResource={projectResource} handleClose={handleHideUpdateModal} />
    </div>
  );
};

const mapStateToProps = ({ resource, project, projectResource }: IRootState) => ({
  project: project.entity,
  projectResource: projectResource.entity,
  loading: projectResource.loading,
  errorMessage: projectResource.errorMessage,
  resource: resource.entity,
  loadingResource: resource.loading
});

const mapDispatchToProps = {
  getProjectResource: ProjectResource.getEntity,
  deleteProjectResource: ProjectResourceExt.deleteProjectResource,
  updateProjectResource: ProjectResourceExt.updateProjectResource,
  getResource: ResourceExt.getById
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ProjectResourcesDetails);
