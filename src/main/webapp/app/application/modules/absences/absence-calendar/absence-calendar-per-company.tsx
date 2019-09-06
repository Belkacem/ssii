import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as AbsenceType from 'app/entities/absence-type/absence-type.reducer';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import * as AbsenceExt from 'app/application/entities/absence/absence.actions';
import * as Holiday from 'app/entities/holiday/holiday.reducer';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';

import { PageHead } from 'app/application/common/layout/page-head/page-head';
import moment, { Moment } from 'moment';
import { FORMAT_MONTH } from 'app/application/common/config/constants';
import { Button, Icon, Radio } from 'antd';
import { TimesheetAbsence } from './timesheet-absences';
import AbsenceRequestModal from 'app/application/modules/absences/absence-create/absence-create';
import AbsenceDetailsModal from 'app/application/modules/absences/absence-details/absence-details-modal';
import { IResource } from 'app/shared/model/resource.model';
import * as PersistedConfiguration from 'app/application/entities/persisted-configuration/persisted-configuration.actions';
import { MonthFilter } from 'app/application/components/zsoft-form/custom-fields/monthFilter.component';
import * as ResourceConfiguration from 'app/application/entities/resource-configuration/resource-configuration.actions';
import { AbsenceCalendarSettings } from 'app/application/modules/absences/absence-calendar/absence-calendar-settings';

interface IAbsenceCalendarPerCompanyProps extends StateProps, DispatchProps {}

export const AbsenceCalendarPerCompany: FunctionComponent<IAbsenceCalendarPerCompanyProps> = props => {
  const [month, setMonth] = useState<Moment>(moment().startOf('months'));
  const [absenceModalProps, setAbsenceModalProps] = useState(null);
  const [absenceDetailsId, setAbsenceDetailsId] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const layoutConf = props.configurations.find(conf => conf.key === 'user.activityReport.layout');
  const verticalMode = layoutConf && layoutConf.value === 'vertical';
  const layout = verticalMode ? 'vertical' : 'horizontal';

  const getBooleanConfiguration = (key_name: string): boolean => {
    const key = `user.absence.calendar.${key_name}`;
    const conf = props.configurations.find(c => c.key === key);
    return !!conf && conf.value === 'true';
  };
  const confShowInactive = getBooleanConfiguration('show_inactive');
  const confShowDraft = getBooleanConfiguration('show_draft');
  const confShowZeroAbsence = getBooleanConfiguration('show_zero_absences');
  const confShowMultiColor = getBooleanConfiguration('show_multi_color');
  const confShowDualColor = getBooleanConfiguration('show_dual_color');

  useEffect(
    () => {
      if (!isMounted) {
        setIsMounted(true);
      } else {
        props.resetAbsence();
        props.getAllResources();
        props.getContracts();
        props.getAbsenceTypes();
        props.getHolidays(0, 999, 'date,asc');
        props.getMyConfigurations();
      }
    },
    [isMounted]
  );

  useEffect(
    () => {
      reloadAbsences();
    },
    [month, props.resources]
  );

  useEffect(
    () => {
      if (absenceModalProps === null && absenceDetailsId === null) {
        reloadAbsences();
      }
    },
    [absenceModalProps, absenceDetailsId]
  );

  const reloadAbsences = () => {
    const resourceIds = props.resources.map(resource => resource.id);
    if (resourceIds.length > 0) {
      props.getAbsencesByMonth(resourceIds, month);
      props.getResourceConfigurations(resourceIds);
    }
  };

  const handleShowAbsenceRequestModal = (selection?: any, resource?: IResource) => {
    setAbsenceModalProps({
      show: true,
      selectedResource: resource,
      minDate: month.startOf('months').clone(),
      maxDate: month.endOf('months').clone(),
      reloadData: false,
      ...selection
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

  const handleConfigChange = (name: string, value: boolean) => {
    const key = `user.absence.calendar.${name}`;
    const conf = props.configurations.find(c => c.key === key);
    props.saveConfiguration({
      ...conf,
      key,
      value: `${value}`
    });
  };

  const toggleLayout = ev => {
    if (!layoutConf || layoutConf.value !== ev.target.value) {
      props.saveConfiguration({
        ...layoutConf,
        key: 'user.activityReport.layout',
        value: ev.target.value
      });
    }
  };

  const openTimesheetConfiguration = () => setShowConfiguration(true);
  const closeTimesheetConfiguration = () => setShowConfiguration(false);

  const filteredResources = props.resources.filter(resource => {
    let filter = true;
    const resourceConf = props.resourceConfigs.find(rc => rc.resourceId === resource.id);
    const absencesLength = props.absences.filter(ab => ab.resourceId === resource.id).length;
    if (!!resourceConf && !confShowInactive && !resourceConf.active) {
      filter = false;
    }
    if (!confShowDraft && resource.draft) {
      filter = false;
    }
    if (!confShowZeroAbsence && !props.loading && absencesLength === 0) {
      filter = false;
    }
    return filter;
  });

  return (
    <div className="page-layout-max-content">
      <PageHead
        title="Calendrier"
        subTitle={month.format(FORMAT_MONTH)}
        margin={false}
        actions={
          <>
            <Button.Group className="actions-bar" style={{ flex: 3 }}>
              <MonthFilter value={month} setValue={setMonth} maxWidth />
            </Button.Group>{' '}
            <Radio.Group
              value={layout}
              buttonStyle="solid"
              onChange={toggleLayout}
              style={{ marginTop: 1 }}
              disabled={props.loadingConfiguration}
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
            </Radio.Group>{' '}
            <Button icon="setting" className="ant-btn-icon-only" onClick={openTimesheetConfiguration} title="Configuration" />
          </>
        }
      />
      <TimesheetAbsence
        month={month}
        absences={props.absences}
        resources={filteredResources}
        contracts={props.contracts}
        holidays={props.holidays}
        absenceTypes={props.absenceTypes}
        absenceValidators={props.absenceValidators}
        loading={props.loading || !isMounted}
        verticalMode={verticalMode}
        showFill
        onAddAbsence={handleShowAbsenceRequestModal}
        onOpenAbsence={handleShowAbsenceDetailsModal}
        showMultiColor={confShowMultiColor}
        showDualColor={confShowDualColor}
      />
      <AbsenceRequestModal {...absenceModalProps} onClose={handleHideAbsenceRequestModal} />
      <AbsenceDetailsModal absenceId={absenceDetailsId} onClose={handleHideAbsenceDetailsModal} />
      <AbsenceCalendarSettings
        visible={showConfiguration}
        loading={props.loadingConfiguration}
        configurations={props.configurations}
        onClose={closeTimesheetConfiguration}
        onSave={handleConfigChange}
      />
    </div>
  );
};

const mapStateToProps = ({
  application,
  absenceType,
  absenceValidator,
  holiday,
  resource,
  persistedConfiguration,
  resourceConfiguration
}: IRootState) => ({
  absences: application.absence.calendar.entities,
  loading: application.absence.calendar.loading,
  resources: resource.entities,
  contracts: application.resourceContract.resourcesContracts,
  holidays: holiday.entities,
  absenceTypes: absenceType.entities,
  absenceValidators: absenceValidator.entities,
  configurations: persistedConfiguration.entities,
  loadingConfiguration: persistedConfiguration.loading,
  resourceConfigs: resourceConfiguration.entities
});

const mapDispatchToProps = {
  getAbsencesByMonth: AbsenceExt.getAbsencesByMonth,
  resetAbsence: AbsenceExt.resetCalendar,
  getHolidays: Holiday.getEntities,
  getAbsenceTypes: AbsenceType.getEntities,
  getAllResources: ResourceExt.getAll,
  getContracts: ResourceContract.getAllContracts,
  getMyConfigurations: PersistedConfiguration.getMyConfigurations,
  saveConfiguration: PersistedConfiguration.save,
  getResourceConfigurations: ResourceConfiguration.getAllByResources
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(AbsenceCalendarPerCompany);
