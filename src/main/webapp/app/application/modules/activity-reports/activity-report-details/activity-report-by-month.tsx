import React, { FunctionComponent, useEffect, useRef, useState, LegacyRef } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
// Reducers
import * as AbsenceExt from 'app/application/entities/absence/absence.actions';
import * as ActivityReportExt from 'app/application/entities/activity-report/activity-report.actions';
import * as StandardActivityExt from 'app/application/entities/standard-activity/standard-activity.actions';
import * as ExceptionalActivityExt from 'app/application/entities/exceptional-activity/exceptional-activity.actions';
import * as PersistedConfiguration from 'app/application/entities/persisted-configuration/persisted-configuration.actions';
import { IActivityReport } from 'app/shared/model/activity-report.model';
import { IStandardActivity } from 'app/shared/model/standard-activity.model';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';
// components & libraries
import ResourceName from 'app/application/common/entities/resource-name';
import { Alert, Badge, Button, Col, Divider, Icon, Input, message, Modal, Radio, Row, Skeleton, Empty, Comment, Spin } from 'antd';
import moment from 'moment';
import { AUTO_SAVE_DELAY, FORMAT_DATE_SERVER, FORMAT_MONTH } from 'app/application/common/config/constants';
import AbsenceRequestModal from 'app/application/modules/absences/absence-create/absence-create';
import AbsenceDetailsModal from 'app/application/modules/absences/absence-details/absence-details-modal';
import { ActivityReportStatusList } from 'app/application/modules/activity-reports/activity-report-status/status-list';
import { TimesheetTable } from './timesheet/timesheet-activities';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { unionWith } from 'lodash';
import { ExceptionalActivitiesList } from 'app/application/components/exceptional-activities/exceptional-activities-list';
import { getFullName } from 'app/application/common/utils/resource-utils';
import * as ActivityReportTimeSheetReducer from 'app/application/entities/activity-report/activity-report-timesheet.actions';
import { useInterval } from 'app/application/common/utils/useInterval';
import { Refresh } from 'app/application/components/refresh.component';

interface IActivityReportPerMonthProps extends StateProps, DispatchProps, RouteComponentProps<{ month }> {}

const ActivityReportPerMonth: FunctionComponent<IActivityReportPerMonthProps> = props => {
  const [absenceModalProps, setAbsenceModalProps] = useState(null);
  const [absenceDetailsId, setAbsenceDetailsId] = useState(null);
  const [month, setMonth] = useState(undefined);
  const [submiting, setSubmiting] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [comment, setComment] = useState('');

  const { reports, projects, projectResources, resource, absences } = props;
  const { updating, updatingActivities, updatingExceptionalActivities, loading } = props;
  const { standardActivities, standardActivitiesChanged, exceptionalActivities, exceptionalActivitiesChanged } = props;
  const commentChanged: boolean = reports.length > 0 && reports[0].comment !== comment;
  const changed = standardActivitiesChanged || exceptionalActivitiesChanged || commentChanged;
  const saving = updating || updatingActivities || updatingExceptionalActivities;

  useInterval(() => {
    if (isEditable && changed && !saving) {
      saveActivities();
    }
    if (!standardActivitiesChanged && !exceptionalActivitiesChanged && commentChanged) {
      saveReports();
    }
  }, AUTO_SAVE_DELAY);

  useEffect(
    () => {
      if (!!props.match.params.month && moment(props.match.params.month).isValid()) {
        setMonth(moment(props.match.params.month));
      }
    },
    [props.match.params.month]
  );

  useEffect(
    () => {
      handleReloadContent();
    },
    [month]
  );

  useEffect(
    () => {
      if (props.absencesUpdateSuccess) {
        props.getMyDisabledAbsences();
      }
    },
    [props.absencesUpdateSuccess]
  );

  useEffect(
    () => {
      if (absenceModalProps === null && absenceDetailsId === null && absences.length > 0) {
        props.getMyDisabledAbsences();
      }
    },
    [absenceModalProps, absenceDetailsId]
  );

  useEffect(
    () => {
      if (submiting) {
        reports.map(r => {
          const report = {
            ...r,
            submissionDate: moment(),
            submitted: true
          };
          props.updateActivityReport(report);
        });
      } else {
        handleReloadContent();
      }
    },
    [submiting]
  );

  useEffect(
    () => {
      setCanEdit(false);
      if (reports.length > 0) {
        setComment(reports[0].comment);
      }
    },
    [reports]
  );

  useEffect(
    () => {
      if (props.ActivitiesUpdateSuccess || props.ActivitiesExceptionalUpdateSuccess) {
        saveReports();
      }
    },
    [props.ActivitiesUpdateSuccess, props.ActivitiesExceptionalUpdateSuccess]
  );

  useEffect(
    () => {
      if (props.updateSuccess && submiting) {
        setSubmiting(false);
        props.setUpdatedActivityReport(props.updatedActivityReport);
      }
    },
    [props.updateSuccess]
  );

  const handleReloadContent = () => {
    if (!!month) {
      props.getActivityReportsByMonth(month);
    }
  };

  const handleStandardActivityChanged = (activities: IStandardActivity[]) => {
    const compareStandardActivities = (act1, act2) => act1.date === act2.date && act1.activityReportId === act2.activityReportId;
    const newStandardActivities = unionWith(activities, props.standardActivities, compareStandardActivities);
    props.setStandardActivities(newStandardActivities, false);
  };

  const handleExceptionalActivityChanged = (activities: IExceptionalActivity[]) => {
    props.setExceptionalActivities(activities, false);
  };

  const handleShowAbsenceRequestModal = (code, exclude = [], absence?: any) => {
    setAbsenceModalProps({
      show: true,
      typeCode: code,
      excludeTypes: exclude,
      minDate: month.startOf('months').clone(),
      maxDate: month.endOf('months').clone(),
      reloadData: false,
      ...absence
    });
  };

  const handleHideAbsenceRequestModal = () => {
    setAbsenceModalProps(null);
  };

  const handleShowAbsenceDetailsModal = (absenceId: number) => {
    setAbsenceDetailsId(absenceId);
  };

  const handleHideAbsenceDetailsModal = () => {
    setAbsenceDetailsId(null);
  };

  const handleChangeComment = (ev: React.ChangeEvent<HTMLTextAreaElement>) => setComment(ev.target.value);

  const saveActivities = () => {
    const resourceId = props.currentResource.id;
    const startOfMonth = month
      .clone()
      .startOf('months')
      .format(FORMAT_DATE_SERVER);
    const endOfMonth = month
      .clone()
      .endOf('months')
      .format(FORMAT_DATE_SERVER);
    // update standard activities
    if (standardActivitiesChanged) {
      const deletedSA = standardActivities.filter(act => !!act.id && !act.morning && !act.afternoon);
      const updatedSA = standardActivities.filter(act => !!act.id && (act.morning || act.afternoon));
      const createdSA = standardActivities.filter(act => !act.id && (act.morning || act.afternoon));
      props.updateStandardActivities(updatedSA, createdSA, deletedSA, () =>
        props.getStandardActivitiesByResource(resourceId, startOfMonth, endOfMonth, false)
      );
    }
    // update exceptional activities
    if (exceptionalActivitiesChanged) {
      const deletedEA = props.oldExceptionalActivities.filter(act => !exceptionalActivities.some(act2 => act2.id === act.id));
      const updatedEA = exceptionalActivities.filter(act =>
        props.oldExceptionalActivities.some(act2 => act2.id === act.id && JSON.stringify(act) !== JSON.stringify(act2))
      );
      const createdEA = exceptionalActivities.filter(act => !props.oldExceptionalActivities.some(act2 => act2.id === act.id));
      props.updateExceptionalActivities(updatedEA, createdEA, deletedEA, () =>
        props.getExceptionalActivitiesByResource(resourceId, startOfMonth, endOfMonth, false)
      );
    }
  };

  const saveReports = () => {
    reports.map(r => {
      const report = {
        ...r,
        submissionDate: null,
        submitted: false,
        comment
      };
      props.updateActivityReport(report);
    });
  };

  const submitReport = () => {
    if (validationErrors.length === 0) {
      Modal.confirm({
        title: 'Soumettre Mon Rapport',
        content: "Votre rapport d'activité sera soumis à la validation, continuer ?",
        okText: 'Oui',
        cancelText: 'Annuler',
        onOk: () => {
          setSubmiting(true);
        }
      });
    } else {
      message.destroy();
      validationErrors.map(errorMessage => message.error(errorMessage, 10));
    }
  };

  const handleErrorsChanged = errs => {
    if (JSON.stringify(errs) !== JSON.stringify(validationErrors)) {
      setValidationErrors(errs);
    }
  };

  const handleDownloadReport = (report: IActivityReport) => {
    const projectResource = projectResources.find(pr => pr.id === report.projectResourceId);
    const projectName = projects.find(p => projectResource.projectId === p.id).nom;
    const resourceName = getFullName(resource);
    props.downloadActivityReport(report, resourceName, projectName);
  };

  const hasEditable = () => reports.some(report => report.editable);

  const hasSubmitted = () => reports.some(report => report.submitted);

  const setEditable = () => setCanEdit(true);

  const layoutConf = props.configurations.find(conf => conf.key === 'user.activityReport.layout');

  const toggleMode = ev => {
    if (!layoutConf || layoutConf.value !== ev.target.value) {
      props.saveConfiguration({
        ...layoutConf,
        key: 'user.activityReport.layout',
        value: ev.target.value
      });
    }
  };
  if (reports.length === 0 && !loading) {
    return (
      <div className="padding-3rem">
        <Alert message="Accès refusé" description="Vous n'êtes pas autorisé à accéder à cette page. !" type="error" showIcon />
      </div>
    );
  }
  const verticalMode = layoutConf && layoutConf.value === 'vertical';
  const layout = layoutConf && layoutConf.value ? layoutConf.value : 'horizontal';
  const isEditable = !hasSubmitted() ? hasEditable() : canEdit;
  const isResourceDisabled = !!props.resourceConfig && !props.resourceConfig.active;

  return (
    <div>
      <PageHead
        title={`Rapport D'activité [ ${!!month && month.format(FORMAT_MONTH)} ]`}
        onBack="/app/resource/my-activities"
        backOnlyMobile
        margin={false}
        actions={
          <>
            {saving ? (
              <small>
                <b>Enregistrement en cours ...</b>
              </small>
            ) : (
              <>
                {isEditable
                  ? !changed && (
                      <Button icon="check" type="primary" onClick={submitReport} loading={updating} className="ant-btn-textual">
                        <span>Déclarer</span>
                      </Button>
                    )
                  : hasEditable() && (
                      <Button icon="edit" type="primary" onClick={setEditable} className="ant-btn-textual">
                        <span>Modifier</span>
                      </Button>
                    )}
              </>
            )}{' '}
            {changed && (
              <Button disabled={!isEditable || saving} onClick={saveActivities} className="ant-btn-textual">
                <Badge count={changed ? 1 : 0} dot>
                  <Icon type="save" />
                  <span>Sauvegarder</span>
                </Badge>
              </Button>
            )}
            <Radio.Group
              value={layout}
              buttonStyle="solid"
              onChange={toggleMode}
              style={{ marginTop: 1 }}
              disabled={!isEditable || props.loadingConfiguration}
            >
              <Radio.Button value="vertical" className="ant-btn ant-btn-icon-only">
                <div title="Mode vertical">
                  <Icon type="database" />
                </div>
              </Radio.Button>
              <Radio.Button value="horizontal" className="ant-btn ant-btn-icon-only">
                <div title="Mode horizontal">
                  <Icon type="table" />
                </div>
              </Radio.Button>
            </Radio.Group>
          </>
        }
      />
      {isResourceDisabled && <Alert message={<small>Cette ressource est désactivée</small>} type="error" banner />}
      <Refresh onReload={handleReloadContent} visible={props.loadingError}>
        <Spin spinning={isResourceDisabled && isEditable} indicator={<span />}>
          <Row type="flex" className="info-row">
            <Col lg={6} md={12} sm={12} xs={24}>
              <small>Projets :</small>
              <div>
                <Skeleton loading={loading} active paragraph={false} avatar={false} className="skeleton-title">
                  <b>{projects.map(project => project.nom).join(', ')}</b>
                </Skeleton>
              </div>
            </Col>
            <Col lg={6} md={12} sm={12} xs={24}>
              <small>Ressource :</small>
              <div>
                <Skeleton loading={loading} active paragraph={false} avatar={false} className="skeleton-title">
                  <b>
                    <ResourceName resource={resource} isMeta={false} />
                  </b>
                </Skeleton>
              </div>
            </Col>
            <Col lg={6} md={12} sm={12} xs={24}>
              <small>Période :</small>
              <div>
                <Skeleton loading={loading} active paragraph={false} avatar={false} className="skeleton-title">
                  <b>{!!month && month.format(FORMAT_MONTH)}</b>
                </Skeleton>
              </div>
            </Col>
            <Col lg={6} md={12} sm={12} xs={24}>
              <small>L'état de validation :</small>
              <div>
                <Skeleton loading={loading} active paragraph={false} avatar={false} className="skeleton-title">
                  <ActivityReportStatusList
                    reports={props.reports}
                    standardActivities={props.standardActivities}
                    exceptionalActivities={props.exceptionalActivities}
                    loading={loading}
                  />
                </Skeleton>
              </div>
            </Col>
          </Row>
          <TimesheetTable
            month={month}
            reports={props.reports}
            reportsFiles={props.reportsFiles}
            projects={props.projects}
            projectResources={props.projectResources}
            standardActivities={props.standardActivities}
            exceptionalActivities={props.exceptionalActivities}
            absences={props.absences}
            contracts={props.contracts}
            holidays={props.holidays}
            absenceTypes={props.absenceTypes}
            projectValidators={props.validators}
            absenceValidators={[]}
            loading={loading}
            updating={saving}
            showStatus
            showFill={isEditable}
            showValidation={false}
            onAddAbsence={handleShowAbsenceRequestModal}
            onOpenAbsence={handleShowAbsenceDetailsModal}
            onActivityChanged={handleStandardActivityChanged}
            verticalMode={verticalMode}
            resourceId={resource.id}
            isDownloading={props.downloading}
            onDownload={handleDownloadReport}
            onErrorsChanged={handleErrorsChanged}
          />
          <ExceptionalActivitiesList
            month={month}
            loading={props.loadingExceptionalActivities}
            exceptionalActivities={exceptionalActivities}
            reports={reports}
            projectResources={projectResources}
            projects={projects}
            editable={isEditable}
            visible={isEditable}
            onActivityChanged={handleExceptionalActivityChanged}
          />
          <Divider orientation="left" className="margin-bottom-8" children="Commentaire" />
          <div className="ant-form-item padding-1rem">
            {!isEditable ? (
              reports.length > 0 && !!comment && comment !== '' && reports[0] ? (
                <Comment
                  content={comment}
                  author={getFullName(resource)}
                  avatar={<Avatar name={getFullName(resource)} size={40} />}
                  datetime={!!reports[0].submissionDate && moment(reports[0].submissionDate).fromNow()}
                />
              ) : (
                <Empty
                  className="ant-empty-normal text-muted"
                  image={<Icon type="message" style={{ fontSize: 48 }} />}
                  description={<small>Aucun commentaire !</small>}
                />
              )
            ) : (
              <Input.TextArea
                value={comment}
                placeholder="laisser un commentaire ..."
                autosize={{ minRows: 2, maxRows: 6 }}
                onChange={handleChangeComment}
              />
            )}
          </div>
        </Spin>
      </Refresh>
      <AbsenceRequestModal {...absenceModalProps} onClose={handleHideAbsenceRequestModal} />
      <AbsenceDetailsModal absenceId={absenceDetailsId} onClose={handleHideAbsenceDetailsModal} />
    </div>
  );
};

const mapStateToProps = ({
  application,
  absence,
  activityReport,
  holiday,
  absenceType,
  project,
  projectResource,
  projectValidator,
  persistedConfiguration,
  resourceContract,
  activityReportFile,
  resourceConfiguration
}: IRootState) => ({
  // current resource
  resource: application.resource.current.entity,
  loading: application.forms.activityReport.loading,
  loadingError: application.forms.activityReport.hasError,
  standardActivities: application.forms.activityReport.standardActivities,
  standardActivitiesChanged: application.forms.activityReport.standardActivitiesChanged,
  exceptionalActivities: application.forms.activityReport.exceptionalActivities,
  exceptionalActivitiesChanged: application.forms.activityReport.exceptionalActivitiesChanged,
  // activity report
  reports: activityReport.entities,
  updatedActivityReport: activityReport.entity,
  updating: activityReport.updating,
  updateSuccess: activityReport.updateSuccess,
  downloading: application.activityReport.downloading,
  // report Standard Actvities
  updatingActivities: application.standardActivity.updating,
  ActivitiesUpdateSuccess: application.standardActivity.updateSuccess,
  // report Exceptional Actvities
  loadingExceptionalActivities: application.exceptionalActivity.loading,
  updatingExceptionalActivities: application.exceptionalActivity.updating,
  oldExceptionalActivities: application.exceptionalActivity.entities,
  ActivitiesExceptionalUpdateSuccess: application.exceptionalActivity.updateSuccess,
  // Holidays
  holidays: holiday.entities,
  // Absence Types
  absenceTypes: absenceType.entities,
  // Valid Absences
  absences: application.absence.disabled.entities,
  absencesUpdateSuccess: absence.updateSuccess,
  // Projects
  projects: project.entities,
  // Project Resource
  projectResources: projectResource.entities,
  // current Resource
  currentResource: application.resource.current.entity,
  // Resource contracts
  contracts: resourceContract.entities,
  // validators
  validators: projectValidator.entities,
  // Configurations
  configurations: persistedConfiguration.entities,
  loadingConfiguration: persistedConfiguration.loading,
  reportsFiles: activityReportFile.entities,
  resourceConfig: resourceConfiguration.entity
});

const mapDispatchToProps = {
  getActivityReportsByMonth: ActivityReportTimeSheetReducer.getActivityReportsByMonth,
  setUpdatedActivityReport: ActivityReportTimeSheetReducer.setUpdatedActivityReport,
  getMyDisabledAbsences: AbsenceExt.getDisabledByCurrentResource,
  getStandardActivitiesByResource: StandardActivityExt.getByResourceAndDateBetween,
  getExceptionalActivitiesByResource: ExceptionalActivityExt.getByResourceAndDateBetween,
  setStandardActivities: ActivityReportTimeSheetReducer.setStandardActivities,
  setExceptionalActivities: ActivityReportTimeSheetReducer.setExceptionalActivities,
  updateActivityReport: ActivityReportExt.update,
  updateStandardActivities: StandardActivityExt.update,
  updateExceptionalActivities: ExceptionalActivityExt.update,
  saveConfiguration: PersistedConfiguration.save,
  downloadActivityReport: ActivityReportExt.download
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ActivityReportPerMonth);
