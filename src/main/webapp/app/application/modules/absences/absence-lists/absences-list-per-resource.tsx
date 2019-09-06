import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as AbsenceExt from 'app/application/entities/absence/absence.actions';
import * as AbsenceType from 'app/entities/absence-type/absence-type.reducer';
import { IAbsence, ValidationStatus } from 'app/shared/model/absence.model';
import { Button, Empty } from 'antd';
import { INTERCONTRACT_CODE } from 'app/application/common/config/constants';
import AbsenceRequestModal from 'app/application/modules/absences/absence-create/absence-create';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import List from 'app/application/components/list/list.component';
import { getAbsenceDates, getAbsenceStatusIcon, getAbsenceType } from 'app/application/common/utils/absence-utils';
import AbsenceDetails from 'app/application/modules/absences/absence-details';

interface IAbsencesListPerResourceProps extends StateProps, DispatchProps, RouteComponentProps<{ absence_id }> {}

const listGroups = [
  { title: 'En Attente', filter: rec => rec.validationStatus === 'PENDING' && rec.submissionDate },
  { title: 'Historique', filter: rec => rec.validationStatus !== 'PENDING' }
];
const listStatus = [
  { text: 'En attente', value: ValidationStatus.PENDING },
  { text: 'Approuvé', value: ValidationStatus.APPROVED },
  { text: 'Rejeté', value: ValidationStatus.REJECTED }
];

const AbsencesListPerResource: FunctionComponent<IAbsencesListPerResourceProps> = props => {
  const listRef: RefObject<List> = useRef<List>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [absencesList, setAbsenceList] = useState<IAbsence[]>([]);
  const { absenceTypes, totalItems, countNotValidated, loading_list, loading_pending } = props;
  const loading = loading_list || loading_pending;

  useEffect(() => {
    props.resetAbsence();
    props.getAbsenceTypes();
  }, []);

  useEffect(
    () => {
      if (props.updateSuccess) {
        if (!!props.absence.id) {
          props.history.push(`/app/resource/absences/${props.absence.id}`);
        } else {
          props.history.push('/app/resource/absences');
        }
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
    props.getMyAbsencesNonValid(activePage - 1, 999, `${sort},${order}`);
    props.getMyAbsences(activePage - 1, itemsPerPage, `${sort},${order}`);
  };

  const handleShowAbsenceRequestModal = () => {
    setShowCreateModal(true);
  };
  const handleHideAbsenceRequestModal = () => {
    setShowCreateModal(false);
  };

  const handleDetailsAction = selectedAbsence => {
    props.history.push(`/app/resource/absences/${selectedAbsence.id}`);
  };
  const handleFilterAbsences = (dataSource, searchText) => {
    const reg = new RegExp(searchText, 'gi');
    const matchedTypes = absenceTypes.filter(at => at.type.match(reg));
    const matchedStatus = listStatus.filter(s => s.text.match(reg));
    return dataSource.filter(absence => {
      const matchType = matchedTypes.some(t => t.id === absence.typeId);
      const matchStatus = matchedStatus.some(
        t => (t.value && t.value === absence.validationStatus) || (t.value === null && absence.submissionDate === null)
      );
      return matchType || matchStatus;
    });
  };

  const renderAbsence = absence => {
    return (
      <div className="absence-row">
        <div className="absence-body">
          <div className="resource-meta">
            <div className="meta-content">
              <span className="meta-title">{getAbsenceType(absence, absenceTypes)}</span>
              <span className="meta-description">{getAbsenceDates(absence)}</span>
            </div>
          </div>
          <div className="absence-status">
            <div className="absence-days">
              <b>{absence.numberDays}</b> j
            </div>
            {getAbsenceStatusIcon(absence)}
          </div>
        </div>
      </div>
    );
  };
  const header = (
    <PageHead
      title="Congés et Absences"
      margin={false}
      actions={<Button title="Nouvelle demande" type="primary" icon="plus" onClick={handleShowAbsenceRequestModal} />}
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
        loading={loading}
        onClick={handleDetailsAction}
        onFilter={handleFilterAbsences}
        placeholder="Recherche par type ..."
        selectedItem={`${props.match.params.absence_id}`}
        hasSelectedItem={!props.match.isExact || !!props.match.params.absence_id}
        groups={listGroups}
        sort="start"
        header={header}
      >
        <Switch>
          <Route path="/app/resource/absences/:absence_id" component={AbsenceDetails} />
          <>
            <Empty description="Aucune sélection !" style={{ paddingTop: '5rem' }} />
          </>
        </Switch>
      </List>
      <AbsenceRequestModal excludeTypes={[INTERCONTRACT_CODE]} show={showCreateModal} onClose={handleHideAbsenceRequestModal} />
    </>
  );
};

const mapStateToProps = ({ application, absence, absenceType }: IRootState) => ({
  absence: absence.entity,
  absences: application.absence.list.entities,
  pending_absences: application.absence.pending.entities,
  totalItems: application.absence.list.totalItems,
  countNotValidated: application.absence.pending.totalItems,
  updateSuccess: absence.updateSuccess,
  loading_list: application.absence.list.loading,
  loading_pending: application.absence.pending.loading,
  absenceTypes: absenceType.entities
});

const mapDispatchToProps = {
  getMyAbsences: AbsenceExt.getByCurrentResource,
  getMyAbsencesNonValid: AbsenceExt.getPendingByCurrentResource,
  getAbsenceTypes: AbsenceType.getEntities,
  resetAbsence: AbsenceExt.reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AbsencesListPerResource);
