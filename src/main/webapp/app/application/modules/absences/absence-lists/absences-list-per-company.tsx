import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as AbsenceExt from 'app/application/entities/absence/absence.actions';
import * as AbsenceType from 'app/entities/absence-type/absence-type.reducer';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import { Button, Empty } from 'antd';
import CreateAbsenceModal from '../absence-create/absence-create';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { getAbsenceDates, getAbsenceStatusIcon, getAbsenceType, getValidatorResources } from 'app/application/common/utils/absence-utils';
import List from 'app/application/components/list/list.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import AbsenceDetails from '../absence-details/index';
import { IAbsence } from 'app/shared/model/absence.model';
import { isOwner } from 'app/application/common/utils/user-utils';

interface IAbsencesListPerCompanyProps extends StateProps, DispatchProps, RouteComponentProps<{ absence_id }> {}

const listGroups = [
  { title: 'En Attente', filter: rec => rec.validationStatus === 'PENDING' },
  { title: 'Historique', filter: rec => rec.validationStatus !== 'PENDING' }
];

const AbsencesListPerCompany: FunctionComponent<IAbsencesListPerCompanyProps> = props => {
  const listRef: RefObject<List> = useRef<List>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [absencesList, setAbsenceList] = useState<IAbsence[]>([]);
  const isCompanyOwner = isOwner(props.account, props.currentCompany);
  const { absenceTypes, totalItems, countNotValidated, loading_list, loading_pending } = props;
  const loading = loading_list || loading_pending;

  useEffect(() => {
    props.resetAbsence();
    props.getAbsenceTypes();
    if (isCompanyOwner) {
      props.getAllResources();
    }
  }, []);

  useEffect(
    () => {
      if (props.updateSuccess) {
        handleDetailsAction(props.absence);
        listRef.current.reload();
      }
    },
    [props.updateSuccess]
  );

  useEffect(
    () => {
      setAbsenceList([...props.pending_absences, ...props.absences]);
    },
    [props.pending_absences, props.absences]
  );

  useEffect(
    () => {
      if (absencesList.length > 0) {
        listRef.current.pushData(absencesList);
      }
    },
    [absencesList]
  );

  const getEntities = (activePage, itemsPerPage, sort, order) => {
    props.getAbsencesNonValid(activePage - 1, 999, `${sort},${order}`);
    props.getAbsences(activePage - 1, itemsPerPage, `${sort},${order}`);
  };

  const handleShowAbsenceRequestModal = () => {
    setShowCreateModal(true);
  };
  const handleHideAbsenceRequestModal = () => {
    setShowCreateModal(false);
  };

  const getResourceFullName = resourceId => {
    const resources = isCompanyOwner ? props.employees : getValidatorResources(props.currentAbsenceValidator);
    const resource = resources.find(emp => emp.id === resourceId);
    if (resource) {
      return getFullName(resource);
    }
    return '';
  };

  const renderAbsence = absence => {
    const resourceName = getResourceFullName(absence.resourceId);
    return (
      <div className="absence-row">
        <div className="absence-head">
          <div className="absence-type">{getAbsenceType(absence, absenceTypes)}</div>
          <div className="absence-days">
            <b>{absence.numberDays}</b> j
          </div>
        </div>
        <div className="absence-body">
          <div className="resource-meta">
            <Avatar name={resourceName} size={28} />
            <div className="meta-content">
              <span className="meta-title">{resourceName}</span>
              <span className="meta-description">{getAbsenceDates(absence)}</span>
            </div>
          </div>
          <div className="absence-status">{getAbsenceStatusIcon(absence)}</div>
        </div>
      </div>
    );
  };

  const handleDetailsAction = absence => {
    if (isCompanyOwner) {
      props.history.push(`/app/company/absences/${absence.id}`);
    } else {
      props.history.push(`/app/absences/${absence.id}`);
    }
  };

  const handleFilterAbsences = (dataSource, searchText) => {
    const reg = new RegExp(searchText, 'gi');
    const resources = isCompanyOwner ? props.employees : getValidatorResources(props.currentAbsenceValidator);
    return dataSource.filter(absence => {
      const resource = resources.find(res => res.id === absence.resourceId);
      return resource && getFullName(resource).match(reg);
    });
  };

  const header = (
    <PageHead
      title="Congés et Absences"
      margin={false}
      actions={isCompanyOwner && <Button title="Nouvelle demande" type="primary" icon="plus" onClick={handleShowAbsenceRequestModal} />}
    />
  );
  return (
    <>
      <List
        ref={listRef}
        rowKey="id"
        totalItems={totalItems + countNotValidated}
        renderItem={renderAbsence}
        fetchData={getEntities}
        onClick={handleDetailsAction}
        onFilter={handleFilterAbsences}
        placeholder="Recherche par ressource ..."
        selectedItem={`${props.match.params.absence_id}`}
        hasSelectedItem={!props.match.isExact || !!props.match.params.absence_id}
        groups={listGroups}
        sort="start"
        header={header}
        loading={loading}
      >
        <Switch>
          {isCompanyOwner ? (
            <Route path="/app/company/absences/:absence_id" component={AbsenceDetails} />
          ) : (
            <Route path="/app/absences/:absence_id" component={AbsenceDetails} />
          )}
          <>
            <Empty description="Aucune sélection !" style={{ paddingTop: '5rem' }} />
          </>
        </Switch>
      </List>
      <CreateAbsenceModal show={showCreateModal} onClose={handleHideAbsenceRequestModal} />
    </>
  );
};

const mapStateToProps = ({ application, resource, authentication, absence, absenceType }: IRootState) => ({
  account: authentication.account,
  currentCompany: application.company.current,
  employees: resource.entities,
  absence: absence.entity,
  absences: application.absence.list.entities,
  pending_absences: application.absence.pending.entities,
  totalItems: application.absence.list.totalItems,
  updating: absence.updating,
  countNotValidated: application.absence.pending.totalItems,
  updateSuccess: absence.updateSuccess,
  loading_list: application.absence.list.loading,
  loading_pending: application.absence.pending.loading,
  absenceTypes: absenceType.entities,
  currentAbsenceValidator: application.absenceValidator.current
});

const mapDispatchToProps = {
  getAbsences: AbsenceExt.getAbsences,
  getAbsencesNonValid: AbsenceExt.getPending,
  resetAbsence: AbsenceExt.reset,
  getAbsenceTypes: AbsenceType.getEntities,
  getAllResources: ResourceExt.getAll
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(AbsencesListPerCompany);
