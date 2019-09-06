import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
// Reducers
import * as ActivityReportExt from 'app/application/entities/activity-report/activity-report.actions';
import * as StandardActivityExt from 'app/application/entities/standard-activity/standard-activity.actions';
import * as ExceptionalActivityExt from 'app/application/entities/exceptional-activity/exceptional-activity.actions';
import * as ProjectValidator from 'app/entities/project-validator/project-validator.reducer';
import * as PersistedConfiguration from 'app/application/entities/persisted-configuration/persisted-configuration.actions';
import * as ActivityReportTimeSheetReducer from 'app/application/entities/activity-report/activity-report-timesheet.actions';
// Models
import { IStandardActivity, ValidationStatus } from 'app/shared/model/standard-activity.model';
import { IActivityReport } from 'app/shared/model/activity-report.model';
// others
import { FORMAT_DATE_SM, FORMAT_MONTH } from 'app/application/common/config/constants';
import { Alert, Badge, Button, Col, Dropdown, Icon, Menu, Modal, Row, Skeleton, Switch, Comment, Empty, Divider, Spin } from 'antd';
import moment from 'moment';
import ResourceName from 'app/application/common/entities/resource-name';
import { TimesheetTable } from './timesheet/timesheet-activities';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { ExceptionalActivitiesList } from 'app/application/components/exceptional-activities/exceptional-activities-list';
import { Refresh } from 'app/application/components/refresh.component';
import { unionWith } from 'lodash';
import { getUrlParameter } from 'app/application/common/utils/url-utils';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { isCurrentProjectValidator, isOwner } from 'app/application/common/utils/user-utils';
import { ActivityReportStatusList } from 'app/application/modules/activity-reports/activity-report-status/status-list';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';
import { nbrToHours } from 'app/application/common/utils/activity-utils';

interface IActivityReportByIdProps extends StateProps, DispatchProps, RouteComponentProps<{ report_id }> {}

const ActivityReportById: FunctionComponent<IActivityReportByIdProps> = props => {
  const [month, setMonth] = useState(null);
  const [printMode, setPrintMode] = useState(true);
  const { report, project, projectResource, validator, resource, loading } = props;
  const { standardActivities, standardActivitiesChanged, exceptionalActivities, exceptionalActivitiesChanged } = props;
  const changed = standardActivitiesChanged || exceptionalActivitiesChanged;
  const isCompanyOwner = isOwner(props.account, props.currentCompany);
  const isValidator = props.currentProjectValidators.some(pv => isCurrentProjectValidator(pv, project));

  useEffect(
    () => {
      handleReloadContent();
    },
    [props.match.params.report_id]
  );

  useEffect(
    () => {
      if (!!month) {
        if (isValidator) {
          const mode = getUrlParameter('mode', props.location.search);
          setPrintMode(mode === 'print');
        } else {
          setPrintMode(true);
        }
      }
    },
    [month]
  );

  useEffect(
    () => {
      if (!!report.id) {
        setMonth(moment(report.month));
      }
    },
    [report]
  );

  useEffect(
    () => {
      const activityWithValidator = props.standardActivities.find(act => !!act.validatorId);
      if (isValidator && !!activityWithValidator && (!validator.id || validator.id !== activityWithValidator.validatorId)) {
        props.getProjectValidator(activityWithValidator.validatorId);
      }
    },
    [props.standardActivities]
  );

  useEffect(
    () => {
      if (props.ActivitiesUpdateSuccess || props.ActivitiesExceptionalUpdateSuccess) {
        saveReports();
      }
    },
    [props.ActivitiesExceptionalUpdateSuccess, props.ActivitiesUpdateSuccess]
  );

  const handleReloadContent = () => {
    if (!!props.match.params.report_id) {
      props.getActivityReportsById(props.match.params.report_id);
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

  const handleToggleEditable = (activityReport: IActivityReport) => {
    Modal.confirm({
      title: activityReport.editable ? 'Désactivater la modification' : 'Activer la modification',
      content: (
        <>
          Ce rapport d'activité est marqué comme <b>{activityReport.editable ? 'modifiable' : 'non modifiable'}</b>,<br />
          {activityReport.editable ? (
            <>
              Cliquez sur <b>Désactiver la modification</b> pour assurer que l'employé n'effectue aucune modification sur ce rapport.
            </>
          ) : (
            <>
              Cliquez sur <b>Activer la modification</b> pour permettre à l'employé d'apporter des modifications à ce rapport.
            </>
          )}
        </>
      ),
      okText: activityReport.editable ? 'Désactiver la modification' : 'Activer la modification',
      okType: activityReport.editable ? 'danger' : 'primary',
      cancelText: 'Annuler',
      width: 516,
      onOk: () => {
        props.updateActivityReport({ ...activityReport, editable: !activityReport.editable });
      }
    });
  };

  const validateReport = status => {
    const validationDate = moment();
    const _standardActivities = standardActivities
      .filter(activity => activity.morning || activity.afternoon)
      .map(activity => ({ ...activity, validationStatus: status, validationDate }))
      .filter(activity => !!activity);
    props.setStandardActivities(_standardActivities);
    const _exceptionalActivities = exceptionalActivities
      .map(activity => ({ ...activity, validationStatus: status, validationDate }))
      .filter(activity => !!activity);
    props.setExceptionalActivities(_exceptionalActivities);
    saveValidation(_standardActivities, _exceptionalActivities);
  };

  const handleValidateReport = () => {
    Modal.confirm({
      title: "Validation de rapport d'activité",
      content: "Est que vous êtes sur de sauvegarder la validation cette rapport d'activité ?",
      okText: 'Sauvegarder',
      cancelText: 'Annuler',
      onOk: () => {
        saveActivities();
      }
    });
  };

  const saveValidation = (activities: IStandardActivity[], exceptionals: IExceptionalActivity[]) => {
    const acts = activities.filter(act => act.morning || act.afternoon);
    if (acts.length > 0 || exceptionals.length > 0) {
      const missedActs = acts.filter(act => !act.validationStatus || act.validationStatus === 'PENDING');
      const missedExActs = exceptionals.filter(act => !act.validationStatus || act.validationStatus === 'PENDING');
      if ((acts.length > 0 && missedActs.length === 0) || (exceptionals.length > 0 && missedExActs.length === 0)) {
        handleValidateReport();
      } else {
        Modal.error({
          title: 'Validations manquées',
          content: (
            <>
              <p>Manque la validation des activités aux dates suivantes:</p>
              <ul>
                {missedActs.map((act, i) => (
                  <li key={i}>{moment(act.date).format(FORMAT_DATE_SM)}</li>
                ))}
                {missedExActs.map((act, i) => (
                  <li key={i}>{moment(act.date).format(FORMAT_DATE_SM) + ' ' + nbrToHours(act.start).format('HH:mm')}</li>
                ))}
              </ul>
            </>
          )
        });
      }
    }
  };

  const saveActivities = () => {
    // update standard activities
    if (standardActivitiesChanged) {
      props.updateStandardActivities([...standardActivities], [], [], async () => {
        props.getStandardActivities(report.id, false);
      });
    }
    // update exceptional activities
    if (exceptionalActivitiesChanged) {
      props.updateExceptionalActivities([...exceptionalActivities], [], [], async () => {
        props.getExceptionalActivities(report.id, false);
      });
    }
  };

  const saveReports = () => {
    // update activity report
    if (isCompanyOwner) {
      props.updateActivityReport({
        ...report,
        submissionDate: report.submissionDate === null ? moment() : report.submissionDate,
        submitted: true
      });
    } else {
      props.sendValidationEmail(report.id);
    }
  };

  const handleDownloadReport = (activityReport: IActivityReport) => {
    const projectName = project.nom;
    const resourceName = getFullName(resource);
    props.downloadActivityReport(activityReport, resourceName, projectName);
  };

  const layoutConf = props.configurations.find(conf => conf.key === 'user.activityReport.layout');

  const handleModeViewMenu = ({ key }) => {
    if (['vertical', 'horizontal'].includes(key)) {
      if (!layoutConf || layoutConf.value !== key) {
        props.saveConfiguration({
          ...layoutConf,
          key: 'user.activityReport.layout',
          value: key
        });
      }
    } else {
      setPrintMode(key === 'print');
    }
  };

  const renderModeViewMenu = () => {
    const layout = layoutConf && layoutConf.value ? layoutConf.value : 'horizontal';
    const mode = printMode ? 'print' : 'validate';
    return (
      <Menu mode="vertical" selectedKeys={[layout, mode]} onClick={handleModeViewMenu}>
        <Menu.Item key="validate">
          <Icon type="check" />
          <small>Mode Validation</small>
        </Menu.Item>
        <Menu.Item key="print">
          <Icon type="printer" />
          <small>Mode Impression</small>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="vertical" disabled={printMode}>
          <Icon type="database" />
          <small>Verticale</small>
        </Menu.Item>
        <Menu.Item key="horizontal" disabled={printMode}>
          <Icon type="table" />
          <small>Horizontale</small>
        </Menu.Item>
      </Menu>
    );
  };

  const { updating, updatingActivities, errorMessage } = props;
  const saving = updating || updatingActivities;
  if (report && errorMessage) {
    return (
      <div className="padding-3rem">
        <Alert message="Accès refusé" description="Vous n'êtes pas autorisé à accéder à cette page. !" type="error" showIcon />
      </div>
    );
  }
  const backLink = !isCompanyOwner
    ? `/app/activities/p/${project.id}?month=${report.month}`
    : `/app/company/projects/${project.id}/activity-reports?month=${report.month}`;
  const disabledBtn =
    !report.submitted ||
    (standardActivities.filter(act => act.morning || act.afternoon).length === 0 && exceptionalActivities.length === 0);
  const verticalMode = layoutConf && layoutConf.value === 'vertical';
  const isResourceDisabled = !!props.resourceConfig && !props.resourceConfig.active;
  return (
    <div style={{ maxWidth: '100%' }}>
      <PageHead
        title={isValidator ? "Validation de Rapport D'activité" : "Impression de Rapport D'activité"}
        onBack={backLink}
        margin={false}
        actions={
          <>
            {saving && (
              <small>
                <b>Enregistrement en cours ...</b>
              </small>
            )}{' '}
            <>
              {isValidator && (
                <>
                  <Dropdown overlay={renderModeViewMenu()} placement="bottomRight">
                    <Button className="ant-btn-textual" loading={props.loadingConfiguration}>
                      <Icon type="eye" />
                      <span>Mode d'affichage</span>
                    </Button>
                  </Dropdown>
                  <Button
                    onClick={saveValidation.bind(null, standardActivities, exceptionalActivities)}
                    className="ant-btn-textual"
                    disabled={disabledBtn}
                  >
                    <Badge count={changed ? 1 : 0} dot>
                      <Icon type="save" />
                      <span>Sauvegarder</span>
                    </Badge>
                  </Button>
                  {!printMode && (
                    <>
                      <Button
                        className="ant-btn-textual"
                        type="danger"
                        onClick={validateReport.bind(null, ValidationStatus.REJECTED)}
                        disabled={disabledBtn}
                      >
                        <Icon type="close" />
                        <span>Reject tous</span>
                      </Button>
                      <Button
                        className="ant-btn-textual"
                        type="primary"
                        onClick={validateReport.bind(null, ValidationStatus.APPROVED)}
                        disabled={disabledBtn}
                      >
                        <Icon type="check" />
                        <span>Valider tous</span>
                      </Button>
                    </>
                  )}
                </>
              )}
            </>
          </>
        }
      />
      {isResourceDisabled && <Alert message={<small>Cette ressource est désactivée</small>} type="error" banner />}
      <Refresh onReload={handleReloadContent} visible={props.loadingError}>
        <Spin spinning={isResourceDisabled && !printMode} indicator={<span />}>
          {isCompanyOwner && (
            <Alert
              type="info"
              banner
              message={
                <>
                  <div style={{ float: 'right' }}>
                    <Switch size="small" checked={report.editable} onChange={handleToggleEditable.bind(null, report)} />
                    <small>{report.editable ? ' Modifiable' : ' Non Modifiable'}</small>
                  </div>
                  <small>Changer l'état de modification pour ce projet</small>
                </>
              }
            />
          )}
          <Row type="flex" className="info-row">
            <Col lg={6} md={12} sm={12} xs={24}>
              <small>Projet :</small>
              <div>
                <Skeleton loading={loading} active paragraph={false} avatar={false} className="skeleton-title">
                  <b>{!!project.id && project.nom}</b>
                </Skeleton>
              </div>
            </Col>
            <Col lg={6} md={12} sm={12} xs={24}>
              <small>Ressource :</small>
              <div>
                <Skeleton loading={loading} active paragraph={false} avatar={false} className="skeleton-title">
                  <b>
                    <ResourceName resourceId={projectResource.resourceId} isMeta={false} />
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
              <small>Status :</small>
              <div>
                <Skeleton loading={loading} active paragraph={false} avatar={false} className="skeleton-title">
                  <ActivityReportStatusList
                    reports={[props.report]}
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
            reports={[props.report]}
            reportsFiles={props.reportsFiles}
            projects={[props.project]}
            projectResources={[props.projectResource]}
            standardActivities={props.standardActivities}
            exceptionalActivities={props.exceptionalActivities}
            contracts={props.contracts}
            holidays={props.holidays}
            projectValidators={[props.validator]}
            loading={loading}
            updating={saving}
            showStatus={false}
            showFill={false}
            showValidation={!printMode}
            onActivityChanged={handleStandardActivityChanged}
            verticalMode={verticalMode}
            resourceId={projectResource.resourceId}
            printMode={printMode}
            isDownloading={props.downloading}
            onDownload={handleDownloadReport}
          />
          <ExceptionalActivitiesList
            month={month}
            loading={props.loadingExceptionalActivities}
            exceptionalActivities={exceptionalActivities}
            reports={[report]}
            projectResources={[projectResource]}
            projects={[project]}
            editable={false}
            validation={!printMode}
            visible={!printMode}
            onActivityChanged={handleExceptionalActivityChanged}
          />
          <Divider orientation="left" className="margin-bottom-8" children="Commentaire" />
          <div className="ant-form-item padding-1rem">
            {!!report && !!report.comment && report.comment !== '' ? (
              <Comment
                content={report.comment}
                author={getFullName(resource)}
                avatar={<Avatar name={getFullName(resource)} size={40} />}
                datetime={!!report.submissionDate && moment(report.submissionDate).fromNow()}
              />
            ) : (
              <Empty
                className="ant-empty-normal text-muted"
                image={<Icon type="message" style={{ fontSize: 48 }} />}
                description={<small>Aucun commentaire !</small>}
              />
            )}
          </div>
        </Spin>
      </Refresh>
    </div>
  );
};

const mapStateToProps = ({
  application,
  authentication,
  activityReport,
  holiday,
  project,
  projectResource,
  projectValidator,
  resource,
  resourceContract,
  persistedConfiguration,
  activityReportFile,
  resourceConfiguration
}: IRootState) => ({
  account: authentication.account,
  currentCompany: application.company.current,

  loading: application.forms.activityReport.loading,
  loadingError: application.forms.activityReport.hasError,
  standardActivities: application.forms.activityReport.standardActivities,
  standardActivitiesChanged: application.forms.activityReport.standardActivitiesChanged,
  exceptionalActivities: application.forms.activityReport.exceptionalActivities,
  exceptionalActivitiesChanged: application.forms.activityReport.exceptionalActivitiesChanged,

  report: activityReport.entity,
  updating: activityReport.updating,
  updateSuccess: activityReport.updateSuccess,
  errorMessage: activityReport.errorMessage,
  downloading: application.activityReport.downloading,
  // report Standard Actvities
  updatingActivities: application.standardActivity.updating,
  ActivitiesUpdateSuccess: application.standardActivity.updateSuccess,
  // report Exceptional Actvities
  loadingExceptionalActivities: application.exceptionalActivity.loading,
  updatingExceptionalActivities: application.exceptionalActivity.updating,
  ActivitiesExceptionalUpdateSuccess: application.exceptionalActivity.updateSuccess,
  // Holidays
  holidays: holiday.entities,
  // Projects
  project: project.entity,
  // Project Resource
  projectResource: projectResource.entity,
  // Resource
  resource: resource.entity,
  // current validators
  currentProjectValidators: application.projectValidator.currents,
  validator: projectValidator.entity,
  // Resource contracts
  contracts: resourceContract.entities,
  // Configurations
  configurations: persistedConfiguration.entities,
  loadingConfiguration: persistedConfiguration.loading,
  reportsFiles: activityReportFile.entities,
  resourceConfig: resourceConfiguration.entity
});

const mapDispatchToProps = {
  getActivityReportsById: ActivityReportTimeSheetReducer.getActivityReportsById,
  getStandardActivities: StandardActivityExt.getByActivityReport,
  getExceptionalActivities: ExceptionalActivityExt.getByActivityReport,
  getProjectValidator: ProjectValidator.getEntity,
  setStandardActivities: ActivityReportTimeSheetReducer.setStandardActivities,
  setExceptionalActivities: ActivityReportTimeSheetReducer.setExceptionalActivities,
  updateActivityReport: ActivityReportExt.update,
  updateStandardActivities: StandardActivityExt.update,
  sendValidationEmail: ActivityReportExt.sendValidationEmail,
  downloadActivityReport: ActivityReportExt.download,
  updateExceptionalActivities: ExceptionalActivityExt.update,
  saveConfiguration: PersistedConfiguration.save
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivityReportById);
