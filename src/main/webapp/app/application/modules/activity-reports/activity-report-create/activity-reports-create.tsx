import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import moment, { Moment } from 'moment';
import { Button, Col, Row } from 'antd';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { FORMAT_DATE_SERVER, FORMAT_FIRST_MONTH_SERVER, FORMAT_MONTH_SERVER } from 'app/application/common/config/constants';
import * as ProjectExt from 'app/application/entities/project/project.actions';
import * as ProjectResourceExt from 'app/application/entities/project-resource/project-resource.actions';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import * as ActivityReportExt from 'app/application/entities/activity-report/activity-report.actions';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import * as ProjectResourceInfoExt from 'app/application/entities/project-resource-info/project-resource-info.actions';
import { hasProjectContractInMonth } from 'app/application/common/utils/project-resource-info-utils';
import { getUrlParameter } from 'app/application/common/utils/url-utils';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import MonthField from 'app/application/components/zsoft-form/generic-fields/monthField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import { IProject } from 'app/shared/model/project.model';

interface IActivityReportsCreateProps extends StateProps, DispatchProps, RouteComponentProps<{ project_id?: string }> {}

const validationSchema = Yup.object().shape({
  projectId: Yup.number()
    .label('Projet')
    .nullable(true)
    .required(),
  projectResourceId: Yup.number()
    .label('Ressource')
    .nullable(true)
    .required(),
  month: Yup.date()
    .label('Mois')
    .nullable(true)
    .required()
});

const ActivityReportsCreate: FunctionComponent<IActivityReportsCreateProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentProjectResources, setCurrentProjectResources] = useState([]);
  const [lastSelectedMonth, setLastSelectedMonth] = useState(null);
  const initialValues = {
    projectId: !!selectedProject ? selectedProject : null,
    projectResourceId: null,
    month: null
  };
  const { updating, loading, projects, project } = props;

  useEffect(
    () => {
      const month = getUrlParameter('month', props.location.search);
      if (moment(month, FORMAT_MONTH_SERVER, true).isValid()) {
        setLastSelectedMonth(moment(month));
      } else {
        setLastSelectedMonth(null);
      }
    },
    [props.location.search]
  );

  useEffect(
    () => {
      if (!!lastSelectedMonth && formikRef.current && lastSelectedMonth.isValid()) {
        formikRef.current.setFieldValue('month', lastSelectedMonth.format(FORMAT_FIRST_MONTH_SERVER));
      }
    },
    [lastSelectedMonth]
  );

  useEffect(
    () => {
      if (props.match.params.project_id) {
        const project_id = Number(props.match.params.project_id);
        props.getProjectResourcesByProjectsIn([project_id], 0, 999, 'id,desc');
        setSelectedProject(project_id);
      } else {
        props.getProjects(0, 999, 'id,desc');
      }
    },
    [props.match.params.project_id]
  );

  useEffect(
    () => {
      if (props.projects) {
        const projectIds = props.projects.map(p => p.id);
        if (projectIds.length > 0) {
          props.getProjectResourcesByProjectsIn(projectIds, 0, 999, 'id,desc');
        }
      }
    },
    [props.projects]
  );

  useEffect(
    () => {
      if (props.projectResources.length > 0) {
        props.getResources();
      }
    },
    [props.projectResources]
  );

  useEffect(
    () => {
      if (props.projectResourceInfos.length > 0) {
        resetMonthField();
      }
    },
    [props.projectResourceInfos]
  );

  useEffect(
    () => {
      if (props.resources) {
        setProjectResources(selectedProject);
      }
    },
    [props.resources]
  );

  useEffect(
    () => {
      if (props.project) {
        setSelectedProject(props.project.id);
      }
    },
    [props.project]
  );

  useEffect(
    () => {
      if (props.updateSuccess) {
        props.history.push(getSelectedReportLink());
      }
    },
    [props.updateSuccess]
  );

  useEffect(() => {}, []);

  const resetMonthField = () => {
    if (lastSelectedMonth && !disabledDate(lastSelectedMonth)) {
      formikRef.current.setFieldValue('month', lastSelectedMonth.format(FORMAT_FIRST_MONTH_SERVER));
    } else {
      formikRef.current.setFieldValue('month', null);
    }
  };

  const setProjectResources = (p: IProject) => {
    const projectResources = props.projectResources.filter(pr => pr.projectId === p).map(projectResource => {
      const rcs = props.resources.filter(r => r.id === projectResource.resourceId);
      if (rcs.length > 0) {
        return {
          label: getFullName(rcs[0]),
          value: projectResource.id
        };
      }
    });
    setSelectedProject(p);
    setCurrentProjectResources(projectResources);
    formikRef.current.setFieldValue('projectResourceId', null);
    resetMonthField();
  };

  const getSelectedReportLink = () => {
    if (formikRef.current) {
      const projectResourceId = formikRef.current.state.values.projectResourceId;
      const projectResource = props.projectResources.find(pr => pr.id === projectResourceId);
      const resource = props.resources.find(r => r.id === projectResource.resourceId);
      const month: Moment = moment(formikRef.current.state.values.month);
      if (resource && month) {
        return `/app/company/activity-reports/${resource.id}/${month.format(FORMAT_FIRST_MONTH_SERVER)}`;
      }
    }
    return '/app/company/activity-reports';
  };

  const handleProjectChange = projectId => {
    formikRef.current.setFieldValue('projectId', projectId);
    setProjectResources(projectId);
  };

  const handleProjectResourceChange = projectResourceId => {
    props.getActivityReportsPerProjectResource([projectResourceId]);
    props.getProjectResourceInfosByProjectResources([projectResourceId]);
    formikRef.current.setFieldValue('projectResourceId', projectResourceId);
    resetMonthField();
  };

  const handleMonthChange = (month: Moment) => {
    formikRef.current.setFieldValue('month', month);
    setLastSelectedMonth(month);
  };

  const disabledDate = current =>
    formikRef.current.state.values.projectResourceId === null ||
    props.activityReports.some(report => current.isSame(report.month, 'months')) ||
    !hasProjectContractInMonth(current, props.projectResourceInfos);

  const saveEntity = values => {
    const activityReport = {
      month: moment(values.month)
        .startOf('month')
        .format(FORMAT_DATE_SERVER),
      submitted: false,
      submissionDate: null,
      editable: true,
      comment: '',
      projectResourceId: values.projectResourceId
    };
    props.createActivityReport(activityReport);
  };

  const handleClose = () => props.history.goBack();

  const handleSubmit = () => formikRef.current.submitForm();

  const getCalendarContainer = () => document.getElementById('month-picker-container');

  return (
    <Formik
      ref={formikRef}
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={saveEntity}
      isInitialValid
    >
      {formProps => (
        <Form>
          <PageHead
            title="Crée un rapport des activités"
            onBack={handleClose}
            actions={
              <Button key="submit" onClick={handleSubmit} type="primary" loading={updating} icon="save" className="ant-btn-textual">
                <span>Sauvegarder</span>
              </Button>
            }
          />
          <Row gutter={16} style={{ padding: '0 16px 16px' }}>
            <Col md={{ span: 10 }} lg={{ span: 8 }}>
              {project.id ? (
                <>
                  <TextField label="Projet" name="projectName" readOnly value={project.nom} />
                </>
              ) : (
                <SelectField
                  label="Projet"
                  name="projectId"
                  autoFocus
                  onChange={handleProjectChange}
                  options={projects.map(pr => ({
                    label: pr.nom,
                    value: pr.id
                  }))}
                  helper={!formProps.values.projectId && "Sélectionnez un projet s'il vous plaît"}
                />
              )}
              <SelectField
                label="Ressource"
                name="projectResourceId"
                autoFocus
                disabled={!formProps.values.projectId}
                onChange={handleProjectResourceChange}
                options={currentProjectResources}
                helper={!formProps.values.projectResourceId && "Sélectionnez un employée s'il vous plaît"}
              />
            </Col>
            <Col md={{ span: 14 }} lg={{ span: 8 }}>
              <div style={{ width: 280 }} id="month-picker-container">
                <MonthField
                  label="Mois"
                  name="month"
                  allowClear={false}
                  open
                  onChange={handleMonthChange}
                  disabled={loading || formProps.values.projectResourceId === null}
                  disabledDate={disabledDate}
                  dropdownClassName={`opened-calendar ${loading || formProps.values.projectResourceId === null ? 'disabled-calendar' : ''}`}
                  getCalendarContainer={getCalendarContainer}
                />
              </div>
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

const mapStateToProps = ({ resource, activityReport, project, projectResource, projectResourceInfo }: IRootState) => ({
  projects: project.entities,
  project: project.entity,
  resources: resource.entities,
  projectResources: projectResource.entities,
  projectResourceInfos: projectResourceInfo.entities,
  activityReports: activityReport.entities,
  activityReport: activityReport.entity,
  updating: activityReport.updating,
  updateSuccess: activityReport.updateSuccess,
  loading: activityReport.loading
});

const mapDispatchToProps = {
  getProjects: ProjectExt.getProjects,
  getProjectResourcesByProjectsIn: ProjectResourceExt.getByProjects,
  getProjectResourceInfosByProjectResources: ProjectResourceInfoExt.getByProjectResources,
  getResources: ResourceExt.getAll,
  createActivityReport: ActivityReportExt.create,
  getActivityReportsPerProjectResource: ActivityReportExt.getByProjectResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ActivityReportsCreate);
