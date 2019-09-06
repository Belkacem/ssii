import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as AbsenceType from 'app/entities/absence-type/absence-type.reducer';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import * as AbsenceExt from 'app/application/entities/absence/absence.actions';
import * as Holiday from 'app/entities/holiday/holiday.reducer';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';
import * as PersistedConfiguration from 'app/application/entities/persisted-configuration/persisted-configuration.actions';
import * as ResourceConfiguration from 'app/application/entities/resource-configuration/resource-configuration.actions';
import { IResource } from 'app/shared/model/resource.model';
import { IAbsenceType } from 'app/shared/model/absence-type.model';
import { FORMAT_MONTH, INTERCONTRACT_CODE, RTT_CODE } from 'app/application/common/config/constants';
import moment, { Moment } from 'moment';
import { Button, Icon, Radio } from 'antd';
import { TimesheetAbsencePerResource } from './timesheet-absences-per-resource';
import AbsenceRequestModal from 'app/application/modules/absences/absence-create/absence-create';
import AbsenceDetailsModal from 'app/application/modules/absences/absence-details/absence-details-modal';
import { MonthFilter } from 'app/application/components/zsoft-form/custom-fields/monthFilter.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';

interface IAbsenceCalendarPerCompanyProps extends StateProps, DispatchProps {
  resourceId: number;
}

export const AbsenceCalendarPerCompany: FunctionComponent<IAbsenceCalendarPerCompanyProps> = props => {
  const [month, setMonth] = useState<Moment>(moment().startOf('months'));
  const [absenceModalProps, setAbsenceModalProps] = useState(null);
  const [absenceDetailsId, setAbsenceDetailsId] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const layoutConf = props.configurations.find(conf => conf.key === 'user.activityReport.layout');
  const verticalMode = layoutConf && layoutConf.value === 'vertical';
  const layout = verticalMode ? 'vertical' : 'horizontal';
  const { resourceId } = props;

  if (!resourceId) return null;

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    } else {
      props.resetAbsence();
      props.getResourceById(resourceId);
      props.getContractsByResource(resourceId);
      props.getAbsenceTypes();
      props.getHolidays(0, 999, 'date,asc');
      props.getMyConfigurations();
    }
  }, []);

  useEffect(
    () => {
      reloadAbsences();
    },
    [month, resourceId]
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
    props.getAbsencesByMonth([resourceId], month);
  };

  const getFilteredAbsenceTypes = () => {
    const resource = !!props.currentResource.id ? props.currentResource : props.resource;
    const excludeTypes = [];
    const config = props.resourceConfig;
    if (!!resource && !!resource.gender) {
      props.absenceTypes
        .filter(absenceType => absenceType.gender !== null)
        .filter(absenceType => absenceType.gender.valueOf() !== resource.gender.valueOf())
        .map(absenceType => absenceType.code)
        .forEach(code => excludeTypes.push(code));
    }
    if (!!config.id && !config.hasRTT) {
      excludeTypes.push(RTT_CODE);
    }
    if (props.currentResource && props.currentResource.id === resource.id) {
      excludeTypes.push(INTERCONTRACT_CODE);
    }
    return props.absenceTypes.filter(type => excludeTypes.indexOf(type.code) === -1);
  };

  const handleShowAbsenceRequestModal = (selection: any, resource: IResource, absenceType: IAbsenceType) => {
    setAbsenceModalProps({
      show: true,
      selectedResource: resource,
      minDate: month.startOf('months').clone(),
      maxDate: month.endOf('months').clone(),
      reloadData: false,
      typeCode: !!absenceType ? absenceType.code : undefined,
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

  const toggleLayout = ev => {
    if (!layoutConf || layoutConf.value !== ev.target.value) {
      props.saveConfiguration({
        ...layoutConf,
        key: 'user.activityReport.layout',
        value: ev.target.value
      });
    }
  };

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
            </Radio.Group>
          </>
        }
      />
      <TimesheetAbsencePerResource
        month={month}
        resource={!!props.currentResource.id ? props.currentResource : props.resource}
        absences={props.absences}
        contracts={props.contracts}
        holidays={props.holidays}
        absenceTypes={getFilteredAbsenceTypes()}
        absenceValidators={props.absenceValidators}
        loading={props.loading || !isMounted}
        verticalMode={verticalMode}
        showFill
        onAddAbsence={handleShowAbsenceRequestModal}
        onOpenAbsence={handleShowAbsenceDetailsModal}
      />
      <AbsenceRequestModal {...absenceModalProps} onClose={handleHideAbsenceRequestModal} />
      <AbsenceDetailsModal absenceId={absenceDetailsId} onClose={handleHideAbsenceDetailsModal} />
    </div>
  );
};

const mapStateToProps = ({
  application,
  absenceType,
  absenceValidator,
  holiday,
  resource,
  resourceContract,
  resourceConfiguration,
  persistedConfiguration
}: IRootState) => ({
  absences: application.absence.calendar.entities,
  loading: application.absence.calendar.loading,
  currentResource: application.resource.current.entity,
  resource: resource.entity,
  contracts: resourceContract.entities,
  holidays: holiday.entities,
  absenceTypes: absenceType.entities,
  absenceValidators: absenceValidator.entities,
  configurations: persistedConfiguration.entities,
  loadingConfiguration: persistedConfiguration.loading,
  resourceConfig: resourceConfiguration.entity
});

const mapDispatchToProps = {
  getAbsencesByMonth: AbsenceExt.getAbsencesByMonth,
  resetAbsence: AbsenceExt.resetCalendar,
  getHolidays: Holiday.getEntities,
  getAbsenceTypes: AbsenceType.getEntities,
  getResourceById: ResourceExt.getById,
  getContractsByResource: ResourceContract.getByResource,
  getMyConfigurations: PersistedConfiguration.getMyConfigurations,
  saveConfiguration: PersistedConfiguration.save,
  getResourceConfiguration: ResourceConfiguration.getByResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(AbsenceCalendarPerCompany);
