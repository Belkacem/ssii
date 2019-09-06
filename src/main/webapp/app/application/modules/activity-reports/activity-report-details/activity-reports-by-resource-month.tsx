import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
import moment from 'moment';
import { AUTO_SAVE_DELAY, FORMAT_DATE_SM, FORMAT_MONTH } from 'app/application/common/config/constants';
import { TimesheetTable } from './timesheet/timesheet-activities';
import AbsenceRequestModal from 'app/application/modules/absences/absence-create/absence-create';
import AbsenceDetailsModal from 'app/application/modules/absences/absence-details/absence-details-modal';
import ResourceName from 'app/application/common/entities/resource-name';
import { Alert, Badge, Button, Col, Dropdown, Icon, Menu, Modal, Row, Skeleton, Input, Empty, Divider, Comment, Spin } from 'antd';
import { ActivityReportStatusList } from 'app/application/modules/activity-reports/activity-report-status/status-list';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { Refresh } from 'app/application/components/refresh.component';
import { unionWith } from 'lodash';
import InvoicesGenerateButton from 'app/application/modules/invoices/invoice-create/invoices-generate-button';
import { ExceptionalActivitiesList } from 'app/application/components/exceptional-activities/exceptional-activities-list';
import { getUrlParameter } from 'app/application/common/utils/url-utils';
import { IActivityReport } from 'app/shared/model/activity-report.model';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { nbrToHours } from 'app/application/common/utils/activity-utils';
import { useInterval } from 'app/application/common/utils/useInterval';
// Reducers
import * as ActivityReportExt from 'app/application/entities/activity-report/activity-report.actions';
import * as StandardActivityExt from 'app/application/entities/standard-activity/standard-activity.actions';
import * as ExceptionalActivityExt from 'app/application/entities/exceptional-activity/exceptional-activity.actions';
import * as ProjectValidatorExt from 'app/application/entities/project-validator/project-validator.actions';
import * as AbsenceExt from 'app/application/entities/absence/absence.actions';
import * as PersistedConfiguration from 'app/application/entities/persisted-configuration/persisted-configuration.actions';
import * as ActivityReportTimeSheetReducer from 'app/application/entities/activity-report/activity-report-timesheet.actions';
import { IStandardActivity } from 'app/shared/model/standard-activity.model';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';

interface IActivityReportsValidationProps extends StateProps, DispatchProps, RouteComponentProps<{ resource_id; month }> {}

const ActivityReportsByResourceAndMonth: FunctionComponent<IActivityReportsValidationProps> = props => {
  const [absenceModalProps, setAbsenceModalProps] = useState(null);
  const [absenceDetailsId, setAbsenceDetailsId] = useState(null);
  const [month, setMonth] = useState(undefined);
  const [submiting, setSubmiting] = useState(false);
  const [submittingMode, setSubmittingMode] = useState(false);
  const [mode, setMode] = useState(getUrlParameter('mode', props.location.search));
  const canEdit = mode === 'edit' || !mode;
  const printMode = mode === 'print';
  const { reports, resource, absences } = props;
  const { updating, updatingActivities, updatingExceptionalActivities, sending, loading } = props;
  const [comment, setComment] = useState('');

  const { standardActivities, standardActivitiesChanged, exceptionalActivities, exceptionalActivitiesChanged } = props;
  const commentChanged: boolean = reports.length > 0 && reports[0].comment !== comment;
  const changed = standardActivitiesChanged || exceptionalActivitiesChanged || commentChanged;
  const saving = updating || updatingActivities || updatingExceptionalActivities;

  const projectResources = reports
    .map(r => props.projectResources && props.projectResources.find(pr => r.projectResourceId === pr.id))
    .filter(pr => !!pr);
  const projects = projectResources.map(pr => props.projects && props.projects.find(p => p.id === pr.projectId)).filter(p => !!p);

  useInterval(() => {
    if (canEdit && changed && !saving) {
      saveActivities();
    }
    if (!standardActivitiesChanged && !exceptionalActivitiesChanged && commentChanged) {
      saveReports();
    }
  }, AUTO_SAVE_DELAY);

  useEffect(
    () => {
      if (!!props.location.search) {
        setMode(getUrlParameter('mode', props.location.search));
      }
    },
    [props.location.search]
  );

  useEffect(
    () => {
      if (!!props.match.params.month && moment(props.match.params.month).isValid()) {
        setMonth(moment(props.match.params.month));
      }
    },
    [props.match.params.month, props.match.params.resource_id]
  );

  useEffect(
    () => {
      handleReloadContent();
    },
    [month]
  );

  useEffect(
    () => {
      if (standardActivities.length > 0) {
        const validatorIds = props.standardActivities
          .map(activity => activity.validatorId)
          .filter(validatorId => !props.validators.find(validator => validator.id === validatorId))
          .filter(validatorId => !!validatorId)
          .filter((id, index, self) => self.indexOf(id) === index);
        if (validatorIds.length > 0) {
          props.getProjectValidatorsByIdIn(validatorIds);
        }
      }
    },
    [props.standardActivities]
  );

  useEffect(
    () => {
      if (props.absencesUpdateSuccess) {
        props.getDisabledAbsences(props.match.params.resource_id);
      }
    },
    [props.absencesUpdateSuccess]
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
      if (absenceModalProps === null && absenceDetailsId === null && absences.length > 0) {
        props.getDisabledAbsences(props.match.params.resource_id);
      }
    },
    [absenceModalProps, absenceDetailsId]
  );

  useEffect(
    () => {
      setSubmittingMode(!reports.some(report => report.submitted));
      if (reports.length > 0) {
        setComment(reports[0].comment);
      }
    },
    [reports]
  );

  useEffect(
    () => {
      if (props.updateSuccess) {
        setSubmiting(false);
        props.setUpdatedActivityReport(props.updatedActivityReport);
      }
    },
    [props.updateSuccess]
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
      }
    },
    [submiting]
  );

  const handleReloadContent = () => {
    if (!!props.match.params.resource_id && !!month) {
      const resourceId = props.match.params.resource_id;
      props.getActivityReportsByResourceIdAndMonth(resourceId, month);
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
      selectedResource: props.resource.id ? props.resource : undefined,
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

  const handleValidateReport = (callback: Function = undefined, cancelCallback: Function = undefined) => {
    Modal.confirm({
      title: "Validation de rapport d'activité",
      content: "Est que vous êtes sur de sauvegarder la validation cette rapport d'activité ?",
      okText: 'Sauvegarder',
      cancelText: 'Annuler',
      onOk: () => {
        saveActivities();
        if (!!callback) {
          callback();
        }
      },
      onCancel: () => {
        if (!!cancelCallback) {
          cancelCallback();
        }
      }
    });
  };

  const validateReport = (callback: Function = undefined, cancelCallback: Function = undefined) => {
    const acts = standardActivities.filter(act => act.morning || act.afternoon);
    if (acts.length > 0 || exceptionalActivities.length > 0) {
      const missedActs = acts.filter(act => !act.validationStatus || act.validationStatus === 'PENDING');
      const missedExActs = exceptionalActivities.filter(act => !act.validationStatus || act.validationStatus === 'PENDING');
      if ((acts.length > 0 && missedActs.length === 0) || (exceptionalActivities.length > 0 && missedExActs.length === 0)) {
        handleValidateReport(callback, cancelCallback);
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
          ),
          onOk: () => {
            if (!!cancelCallback) {
              cancelCallback();
            }
          }
        });
      }
    }
  };

  const validateAbsences = (entities, approve = true, isIntercontracts = false) => {
    if (entities.length === 0) {
      return false;
    }
    const pending_absences = entities.filter(act => act.validationStatus === 'PENDING');
    Modal.confirm({
      title: isIntercontracts ? 'Validation des intercontrats' : 'Validation des Absences',
      content: approve
        ? `Est que vous êtes sur de valider ces ${isIntercontracts ? 'intercontrats' : 'absences'} ?`
        : `Est que vous êtes sur de rejeter ces ${isIntercontracts ? 'intercontrats' : 'absences'} ?`,
      okText: approve ? 'Approver' : 'Rejeter',
      okType: approve ? 'primary' : 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        pending_absences.map(absence => {
          if (approve) {
            props.approveAbsence(absence);
          } else {
            props.rejectAbsence(absence);
          }
        });
      }
    });
  };

  const saveActivities = () => {
    const reportIds = props.reports.map(report => report.id);
    // update standard activities
    if (standardActivitiesChanged) {
      const deletedSA = standardActivities.filter(act => !!act.id && !act.morning && !act.afternoon);
      const updatedSA = standardActivities.filter(act => !!act.id && (act.morning || act.afternoon));
      const createdSA = standardActivities.filter(act => !act.id && (act.morning || act.afternoon));
      props.updateStandardActivities(updatedSA, createdSA, deletedSA, () => props.getStandardActivitiesByReports(reportIds, false));
    }
    // update exceptional activities
    if (exceptionalActivitiesChanged) {
      const deletedEA = props.oldExceptionalActivities.filter(act => !exceptionalActivities.some(act2 => act2.id === act.id));
      const updatedEA = exceptionalActivities.filter(act =>
        props.oldExceptionalActivities.some(act2 => act2.id === act.id && JSON.stringify(act) !== JSON.stringify(act2))
      );
      const createdEA = exceptionalActivities.filter(act => !props.oldExceptionalActivities.some(act2 => act2.id === act.id));
      props.updateExceptionalActivities(updatedEA, createdEA, deletedEA, () => props.getExceptionalActivitiesByReports(reportIds, false));
    }
  };

  const saveReports = () => {
    // update activity report
    props.reports.map(r => {
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
    Modal.confirm({
      title: 'Soumettre Mon Rapport',
      content: "Votre rapport d'activité sera soumis à la validation, continuer ?",
      okText: 'Oui',
      cancelText: 'Annuler',
      onOk: () => {
        setSubmiting(true);
      }
    });
  };

  const handleSave = () => handleSaveReport();

  const handleSaveReport = (callback: Function = undefined, cancelCallback: Function = undefined) => {
    if (canEdit) {
      saveActivities();
      if (!!callback) {
        callback();
      }
    } else {
      validateReport(callback, cancelCallback);
    }
  };

  const setViewMode = value => {
    setMode(value);
    if (value === 'print') {
      handleReloadContent();
    }
  };

  const toggleViewMode = value => {
    if (changed) {
      Modal.confirm({
        title: 'Il y a quelques modifications',
        content: (
          <p>
            voulez-vous les sauvegarder avant de basculer en <b>mode {canEdit ? 'validation' : 'modification'}</b> ?
          </p>
        ),
        okText: 'Sauvegarder',
        cancelText: 'Annuler',
        onOk: () => {
          handleSaveReport(
            () => {
              setViewMode(value);
            },
            () => {
              props.setStandardActivities([], true);
              props.setExceptionalActivities([], true);
              setViewMode(value);
            }
          );
        },
        onCancel: () => {
          props.setStandardActivities([], true);
          props.setExceptionalActivities([], true);
          setViewMode(value);
        }
      });
    } else {
      setViewMode(value);
    }
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
      toggleViewMode(key);
    }
  };

  const handleSendReminder = () => {
    const submittedReports = props.reports.filter(report => !report.submitted);
    if (submittedReports.length > 0) {
      props.sendActivityReportReminder(reports.map(report => report.id));
    }
  };

  const handleDownloadReport = (report: IActivityReport) => {
    const projectResource = projectResources.find(pr => pr.id === report.projectResourceId);
    const projectName = projects.find(p => projectResource.projectId === p.id).nom;
    const resourceName = getFullName(resource);
    props.downloadActivityReport(report, resourceName, projectName);
  };

  const renderModeViewMenu = () => {
    const layout = layoutConf && layoutConf.value ? layoutConf.value : 'horizontal';
    const layoutMode = printMode ? 'print' : canEdit ? 'edit' : 'validate';
    return (
      <Menu mode="vertical" selectedKeys={[layout, layoutMode]} onClick={handleModeViewMenu}>
        <Menu.Item key="edit">
          <Icon type="highlight" />
          <small>Mode Modification</small>
        </Menu.Item>
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

  const verticalMode = layoutConf && layoutConf.value === 'vertical';
  const isResourceDisabled = !!props.resourceConfig && !props.resourceConfig.active;
  return (
    <div>
      <PageHead
        title={
          printMode
            ? "Impression du Rapports D'activités"
            : canEdit
              ? "Modification du Rapports D'activités"
              : "Validation du Rapports D'activités"
        }
        onBack="/app/company/activity-reports"
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
                {canEdit &&
                  !printMode &&
                  !changed &&
                  submittingMode && (
                    <Button icon="check" type="primary" onClick={submitReport} loading={updating} className="ant-btn-textual">
                      <span>Déclarer</span>
                    </Button>
                  )}
              </>
            )}{' '}
            <>
              <Button disabled={printMode || saving} onClick={handleSave} className="ant-btn-textual">
                <Badge count={changed ? 1 : 0} dot>
                  <Icon type="save" />
                  <span>Sauvegarder</span>
                </Badge>
              </Button>
              <Dropdown overlay={renderModeViewMenu()} placement="bottomRight">
                <Button icon="eye" className="ant-btn-textual" loading={props.loadingConfiguration}>
                  <span>Mode d'affichage</span>
                </Button>
              </Dropdown>
              {reports.some(report => !report.submitted) && (
                <Button icon="mail" title="Envoyer un rappel" onClick={handleSendReminder} loading={sending} className="ant-btn-textual">
                  <span>Rappel</span>
                </Button>
              )}
              {projects.length > 0 && <InvoicesGenerateButton title="Facture" reports={reports} />}
            </>
          </>
        }
      />
      {isResourceDisabled && <Alert message={<small>Cette ressource est désactivée</small>} type="error" banner />}
      <Refresh onReload={handleReloadContent} visible={props.loadingError}>
        <Spin spinning={isResourceDisabled && !printMode} indicator={<span />}>
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
                    <ResourceName resource={props.resource} isMeta={false} />
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
          <div>
            {reports.some(report => !report.editable) &&
              canEdit && <Alert type="warning" banner message={<small>Ce rapport d'activité est en lecture seule.</small>} />}
          </div>
          <TimesheetTable
            month={month}
            reports={props.reports}
            reportsFiles={props.reportsFiles}
            projects={projects}
            projectResources={projectResources}
            standardActivities={props.standardActivities}
            exceptionalActivities={props.exceptionalActivities}
            absences={props.absences}
            contracts={props.contracts}
            holidays={props.holidays}
            absenceTypes={props.absenceTypes}
            projectValidators={[...props.validators, ...props.currentProjectValidators]}
            absenceValidators={[]}
            loading={loading}
            updating={saving}
            showStatus
            showFill={!printMode && canEdit}
            showValidation={!printMode && !canEdit}
            onAbsenceValidate={validateAbsences}
            onAddAbsence={handleShowAbsenceRequestModal}
            onOpenAbsence={handleShowAbsenceDetailsModal}
            onActivityChanged={handleStandardActivityChanged}
            verticalMode={verticalMode}
            resourceId={props.match.params.resource_id}
            printMode={printMode}
            isDownloading={props.downloading}
            onDownload={handleDownloadReport}
          />
          <ExceptionalActivitiesList
            month={month}
            loading={props.loadingExceptionalActivities}
            exceptionalActivities={exceptionalActivities}
            reports={reports}
            projectResources={projectResources}
            projects={projects}
            editable={canEdit}
            validation={!printMode && !canEdit}
            visible={!printMode}
            onActivityChanged={handleExceptionalActivityChanged}
          />
          <Divider orientation="left" className="margin-bottom-8" children="Commentaire" />
          <div className="ant-form-item padding-1rem">
            {!canEdit ? (
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
  authentication,
  application,
  holiday,
  absence,
  absenceType,
  activityReport,
  project,
  projectResource,
  projectValidator,
  resource,
  resourceConfiguration,
  resourceContract,
  persistedConfiguration,
  activityReportFile
}: IRootState) => ({
  account: authentication.account,
  currentCompany: application.company.current,
  loading: application.forms.activityReport.loading,
  loadingError: application.forms.activityReport.hasError,
  reports: activityReport.entities,
  updatedActivityReport: activityReport.entity,
  updating: activityReport.updating,
  updateSuccess: activityReport.updateSuccess,
  sending: application.activityReport.sending,
  downloading: application.activityReport.downloading,
  // report Standard Actvities
  standardActivities: application.forms.activityReport.standardActivities,
  standardActivitiesChanged: application.forms.activityReport.standardActivitiesChanged,
  updatingActivities: application.standardActivity.updating,
  ActivitiesUpdateSuccess: application.standardActivity.updateSuccess,
  // report Exceptional Actvities
  exceptionalActivities: application.forms.activityReport.exceptionalActivities,
  oldExceptionalActivities: application.exceptionalActivity.entities,
  exceptionalActivitiesChanged: application.forms.activityReport.exceptionalActivitiesChanged,
  loadingExceptionalActivities: application.exceptionalActivity.loading,
  updatingExceptionalActivities: application.exceptionalActivity.updating,
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
  // Resource
  resource: resource.entity,
  // validators
  currentProjectValidators: application.projectValidator.currents,
  validators: projectValidator.entities,
  // Resource contracts
  contracts: resourceContract.entities,
  // Configurations
  configurations: persistedConfiguration.entities,
  loadingConfiguration: persistedConfiguration.loading,
  reportsFiles: activityReportFile.entities,
  resourceConfig: resourceConfiguration.entity
});

const mapDispatchToProps = {
  getActivityReportsByResourceIdAndMonth: ActivityReportTimeSheetReducer.getActivityReportsByResourceIdAndMonth,
  setUpdatedActivityReport: ActivityReportTimeSheetReducer.setUpdatedActivityReport,
  getStandardActivitiesByReports: StandardActivityExt.getByActivityReports,
  getExceptionalActivitiesByReports: ExceptionalActivityExt.getByActivityReports,
  getProjectValidatorsByIdIn: ProjectValidatorExt.getByIdIn,
  getDisabledAbsences: AbsenceExt.getDisabledByResource,
  setStandardActivities: ActivityReportTimeSheetReducer.setStandardActivities,
  setExceptionalActivities: ActivityReportTimeSheetReducer.setExceptionalActivities,
  updateActivityReport: ActivityReportExt.update,
  updateStandardActivities: StandardActivityExt.update,
  updateExceptionalActivities: ExceptionalActivityExt.update,
  saveConfiguration: PersistedConfiguration.save,
  approveAbsence: AbsenceExt.approve,
  rejectAbsence: AbsenceExt.reject,
  sendActivityReportReminder: ActivityReportExt.sendReminder,
  downloadActivityReport: ActivityReportExt.download
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivityReportsByResourceAndMonth);
