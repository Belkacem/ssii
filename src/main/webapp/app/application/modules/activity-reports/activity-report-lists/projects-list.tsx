import React, { FunctionComponent, useEffect, useRef } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IProject } from 'app/shared/model/project.model';

import List from 'app/application/components/list/list.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { Icon } from 'antd';

interface IProjectsListProps extends RouteComponentProps<{ project_id? }> {
  projects: ReadonlyArray<IProject>;
  loading: boolean;
  isAcriveProject: (projectId: number) => boolean;
  getProjects: () => void;
}

const ProjectsList: FunctionComponent<IProjectsListProps> = props => {
  const listProjectsRef = useRef<List>();

  useEffect(
    () => {
      listProjectsRef.current.pushData(props.projects);
    },
    [props.projects]
  );

  const handleSelectProject = project => {
    props.history.push(`/app/activities/p/${project.id}`);
  };

  const handleFilterProjects = (dataSource, searchText) => {
    const reg = new RegExp(searchText, 'gi');
    return dataSource.filter(project => project.nom.match(reg) || (project.localisation && project.localisation.match(reg)));
  };

  const getEntities = () => {
    props.getProjects();
  };

  const renderProjectName = project => {
    const isMuted = props.isAcriveProject(project.id);
    return (
      <div className="resource-meta" style={{ height: 30, color: !isMuted ? '#b9b9b9' : undefined }}>
        <Icon type="project" />
        <div className="meta-content">
          <span className="meta-title">{project.nom}</span>
        </div>
      </div>
    );
  };

  const header = <PageHead title="Projets" margin={false} />;
  return (
    <>
      <List
        ref={listProjectsRef}
        rowKey="id"
        totalItems={props.projects.length}
        renderItem={renderProjectName}
        fetchData={getEntities}
        placeholder="Rechercher par projet ..."
        onClick={handleSelectProject}
        onFilter={handleFilterProjects}
        selectedItem={props.match.params.project_id}
        hasSelectedItem={!props.match.isExact || !!props.match.params.project_id}
        header={header}
        loading={props.loading}
        children={props.children}
      />
    </>
  );
};

export default withRouter(ProjectsList);
