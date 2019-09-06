import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Link, Route, RouteComponentProps, Switch } from 'react-router-dom';
import * as ProjectExt from 'app/application/entities/project/project.actions';
import ProjectsUpdateModal from '../project-update/projects-update-modal';
import { Button, Empty, Icon } from 'antd';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import List from 'app/application/components/list/list.component';
import ProjectDashboard from 'app/application/modules/activity-reports/projects/projects-dashboard/project-dashboard';

interface IProjectsListProps extends StateProps, DispatchProps, RouteComponentProps<{ project_id }> {}

const UseSelectedProjectId = (projectId: string): string => {
  const [selected, setSelected] = useState(projectId);
  useEffect(
    () => {
      setSelected(projectId);
    },
    [projectId]
  );
  return selected;
};

const ProjectsList: FunctionComponent<IProjectsListProps> = props => {
  const listRef: RefObject<List> = useRef<List>(null);
  const [updateEntity, setUpdateEntity] = useState(null);
  const selectedProjectId = UseSelectedProjectId(props.match.params.project_id);

  useEffect(
    () => {
      if (props.updateSuccess) {
        listRef.current.reload();
      }
    },
    [props.updateSuccess]
  );

  useEffect(
    () => {
      if (props.match.params[0] === 'add') {
        handleAddAction();
      }
    },
    [props.match.params]
  );

  useEffect(
    () => {
      listRef.current.pushData(props.projectsList);
    },
    [props.projectsList]
  );

  const getEntities = (activePage, itemsPerPage, sort, order) => {
    props.getProjects(activePage - 1, itemsPerPage, `${sort},${order}`);
  };

  const renderClient = clientId => {
    if (clientId === null) {
      return (
        <small style={{ color: '#faad14', whiteSpace: 'nowrap' }} title="Client manquant">
          <Icon type="warning" theme="filled" />
        </small>
      );
    }
  };

  const renderName = project => {
    const client = props.clients.find(c => c.id === project.clientId);
    return (
      <div className="resource-meta" style={{ height: 30 }}>
        <Icon type="project" />
        <div className="meta-content">
          <span className="meta-title">{project.nom}</span>
          <span className="meta-description">
            {project.localisation}
            {!!client && ` (${client.name})`}
          </span>
        </div>
        <div className="meta-status">{renderClient(project.clientId)}</div>
      </div>
    );
  };

  const handleAddAction = () => setUpdateEntity({});

  const handleHideModal = () => {
    setUpdateEntity(null);
    if (props.match.params[0] === 'add') {
      props.history.push('/app/company/projects');
    }
  };

  const handleOpenDashboard = project => props.history.push(`/app/company/projects/${project.id}`);

  const handleFilterProjects = (dataSource, searchText) => {
    const reg = new RegExp(searchText, 'gi');
    return dataSource.filter(project => project.nom.match(reg) || (project.localisation && project.localisation.match(reg)));
  };

  const { totalItems, loading } = props;
  const header = (
    <PageHead
      title="Projets"
      margin={false}
      actions={<Button title="Ajouter un projet" type="primary" icon="plus" onClick={handleAddAction} />}
    />
  );
  return (
    <>
      <List
        ref={listRef}
        rowKey="id"
        totalItems={totalItems}
        renderItem={renderName}
        fetchData={getEntities}
        placeholder="Rechercher par nom ..."
        onClick={handleOpenDashboard}
        onFilter={handleFilterProjects}
        selectedItem={selectedProjectId}
        hasSelectedItem={!props.match.isExact || !!selectedProjectId}
        header={header}
        loading={loading}
      >
        <Switch>
          <Route path="/app/company/projects/:project_id(\d+)?/:active_tab?" component={ProjectDashboard} />
          <>
            <Empty description="Aucun projet trouvé !" style={{ paddingTop: '5rem' }}>
              <Button type="primary">
                <Link to="/app/company/projects/add">
                  <Icon type="plus" /> Ajouter un projet
                </Link>
              </Button>
            </Empty>
          </>
        </Switch>
      </List>
      <ProjectsUpdateModal showModal={updateEntity !== null} handleClose={handleHideModal} projectEntity={updateEntity} />
    </>
  );
};

const mapStateToProps = ({ application, project }: IRootState) => ({
  projectsList: application.project.list.projects,
  totalItems: application.project.list.totalItems,
  loading: application.project.list.loading,
  updating: project.updating,
  updateSuccess: project.updateSuccess,
  clients: application.project.list.clients
});

const mapDispatchToProps = {
  getProjects: ProjectExt.getProjectsList
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsList);
