import React, { FunctionComponent, useState, useEffect } from 'react';
import { ExceptionalActivitiesModal } from './exceptional-activities-modal';
import { Button, Icon, List, Tooltip } from 'antd';
import { nbrToHours } from 'app/application/common/utils/activity-utils';
import moment, { Moment } from 'moment';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';
import { IProject } from 'app/shared/model/project.model';
import { IActivityReport } from 'app/shared/model/activity-report.model';
import { IProjectResource } from 'app/shared/model/project-resource.model';
import { ExceptionalActivitiesItem } from 'app/application/components/exceptional-activities/exceptional-activities-item';

export const ASTREINTE_LABELS = {
  ASTREINTE_ACTIVE: 'Astreinte',
  ASTREINTE_ACTIVE_SITE: 'Intervention sur site',
  ASTREINTE_PASSIVE: 'Astreinte passive'
};

interface IExceptionalActivitiesListProps {
  month: Moment;
  reports?: ReadonlyArray<IActivityReport>;
  projectResources?: ReadonlyArray<IProjectResource>;
  exceptionalActivities: ReadonlyArray<IExceptionalActivity>;
  projects: ReadonlyArray<IProject>;
  loading: boolean;
  editable: boolean;
  validation?: boolean;
  visible: boolean;
  onActivityChanged?: Function;
}

export const ExceptionalActivitiesList: FunctionComponent<IExceptionalActivitiesListProps> = props => {
  const { exceptionalActivities, loading, visible, editable, validation = false, reports, projectResources, month } = props;
  const [modalProps, setModalProps] = useState(null);

  const handleOnAdd = () => {
    const projects = props.reports.map(report => ({
      value: report.id,
      label: getProjectNameByReport(report.id)
    }));
    const entity = {
      nbHours: 1,
      start: moment('09', 'HH'),
      activityReportId: projects.length === 1 ? projects[0].value : undefined
    };
    setModalProps({
      entity,
      projects,
      index: null,
      month,
      onUpdate: updateActivity,
      onClose: handleCloseModal
    });
  };

  const handleUpdate = (activity, index) => {
    const entity = {
      ...activity,
      start: nbrToHours(activity.start)
    };
    const projects = reports.map(report => ({
      value: report.id,
      label: getProjectNameByReport(report.id)
    }));
    setModalProps({
      entity,
      projects,
      index,
      month,
      onUpdate: updateActivity,
      onClose: handleCloseModal
    });
  };

  const handleDelete = index => {
    const _exceptionalActivities = exceptionalActivities.filter((a, i) => i !== index);
    if (props.onActivityChanged) {
      props.onActivityChanged(_exceptionalActivities);
    }
  };

  const updateActivity = (entity, index) => {
    const _exceptionalActivities = [...exceptionalActivities];
    if (index === null) {
      _exceptionalActivities.push(entity);
    } else {
      _exceptionalActivities[index] = entity;
    }
    handleCloseModal();
    if (props.onActivityChanged) {
      props.onActivityChanged(_exceptionalActivities);
    }
  };

  const handleCloseModal = () => {
    setModalProps(null);
  };

  const getProjectByReport = reportId => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      const projectResource = projectResources.find(pr => pr.id === report.projectResourceId);
      if (projectResource) {
        return props.projects.find(p => p.id === projectResource.projectId);
      }
    }
    return null;
  };

  const getProjectNameByReport = reportId => {
    if (typeof reportId !== 'number') {
      return (
        <Tooltip title={reportId} placement="right">
          {reportId}
        </Tooltip>
      );
    }
    const project = getProjectByReport(reportId);
    if (project) {
      return (
        <Tooltip title={project.nom} placement="right">
          {project.nom}
        </Tooltip>
      );
    }
    return '';
  };

  const renderExceptionalActivity = (activity, index) => {
    const project = getProjectByReport(activity.activityReportId);
    return (
      <ExceptionalActivitiesItem
        index={index}
        activity={activity}
        project={project}
        editable={editable}
        validation={validation}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        onValidate={updateActivity}
      />
    );
  };

  if (!visible) {
    return null;
  }
  return (
    <>
      <List
        rowKey="id"
        header={
          <div style={{ padding: '0 8px' }}>
            {editable && (
              <Button onClick={handleOnAdd} style={{ float: 'right', marginTop: -5 }}>
                <Icon type="plus" /> Ajouter
              </Button>
            )}
            Astreintes
          </div>
        }
        dataSource={[...exceptionalActivities]}
        renderItem={renderExceptionalActivity}
        loading={loading}
        className="exceptional-activities-list"
      />
      <ExceptionalActivitiesModal visible={modalProps !== null} {...modalProps} />
    </>
  );
};
