import React, { FunctionComponent, lazy, Suspense, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import moment from 'moment';
import { getAbsenceBalancesByResource } from 'app/application/entities/absence-balance/absence-balance.actions';
import { getAbsenceBalanceAdjustmentsByBalanceIn } from 'app/application/entities/absence-balance-adjustment/absence-balance-adjustment.actions';
import * as AbsenceType from 'app/entities/absence-type/absence-type.reducer';
import * as ResourceConfiguration from 'app/application/entities/resource-configuration/resource-configuration.actions';
import { CP_CODE, FORMAT_DATE_PICKER, RTT_CODE } from 'app/application/common/config/constants';
import { Button, Divider, Modal, Skeleton, Table } from 'antd';
import AddAbsenceAdjustment from './add-absence-adjustment';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { isOwner } from 'app/application/common/utils/user-utils';
import { LoadingDiv } from 'app/application/common/config/ui-constants';

const CalendarPerResource = lazy(() => import('app/application/modules/absences/absence-calendar/absence-calendar-per-resource'));

interface IAbsenceCountersProps extends StateProps, DispatchProps {
  resource: any;
}

const getAbsenceBalances = (absenceBalances, absenceTypes, date) => {
  if (absenceBalances.length > 0 && absenceTypes.length > 0) {
    const types = absenceBalances.map(balance => {
      const type = absenceTypes.find(at => at.id === balance.typeId);
      return {
        id: balance.id,
        title: `${type.type} - ${moment(balance.date).format('YYYY')}`,
        typeCode: type.code,
        balance
      };
    });

    let maxDate = date;
    const rttYear = maxDate.clone();
    if (maxDate.month() > 4) {
      maxDate = maxDate.add(1, 'years');
    }
    const nYear = maxDate.month(4).endOf('month');
    const n1Year = nYear.clone().add(-1, 'years');

    const cp = [
      {
        key: 0,
        title: `${nYear
          .clone()
          .add(-1, 'years')
          .format('YYYY')} - ${nYear.format('YYYY')}`,
        acquired: 0,
        taken: 0,
        total: 0,
        balance: null
      },
      {
        key: 1,
        title: `${n1Year
          .clone()
          .add(-1, 'years')
          .format('YYYY')} - ${n1Year.format('YYYY')}`,
        acquired: 0,
        taken: 0,
        total: 0,
        balance: null
      }
    ];
    const rtt = [
      {
        key: 0,
        title: `${rttYear.format('YYYY')} - ${rttYear
          .clone()
          .add(1, 'years')
          .format('YYYY')}`,
        acquired: 0,
        taken: 0,
        total: 0,
        balance: null
      }
    ];
    types.map(row => {
      if (row.typeCode === RTT_CODE && moment(row.balance.date).isSame(rttYear, 'year')) {
        rtt[0].acquired = row.balance.balance - row.balance.taken;
        rtt[0].taken = row.balance.taken;
        rtt[0].total = row.balance.balance;
        rtt[0].balance = row.balance;
      } else if (row.typeCode === CP_CODE && moment(row.balance.date).isSame(nYear, 'year')) {
        cp[0].acquired = row.balance.balance - row.balance.taken;
        cp[0].taken = row.balance.taken;
        cp[0].total = row.balance.balance;
        cp[0].balance = row.balance;
      } else if (row.typeCode === CP_CODE && moment(row.balance.date).isSame(n1Year, 'year')) {
        cp[1].acquired = row.balance.balance - row.balance.taken;
        cp[1].taken = row.balance.taken;
        cp[1].total = row.balance.balance;
        cp[1].balance = row.balance;
      }
    });
    return { balances: types, cpData: cp, rttData: rtt };
  }
  return { balances: [], cpData: [], rttData: [] };
};

const AbsenceCounters: FunctionComponent<IAbsenceCountersProps> = props => {
  const [showHistoryModal, setShowHistoryModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(null);
  const isCompanyOwner = isOwner(props.account, props.currentCompany);
  const { resource, loading, loadingAdjustments, resourceConfig } = props;
  const [absenceCounterData, setAbsenceCounterData] = useState({ balances: [], cpData: [], rttData: [] });

  useEffect(() => {
    props.getAbsenceTypes();
  }, []);

  useEffect(
    () => {
      if (props.resource && !!props.resource.id) {
        props.getAbsenceBalancesByResource(props.resource.id);
        props.getResourceConfiguration(props.resource.id);
      }
    },
    [props.resource]
  );

  useEffect(
    () => {
      if (props.absenceBalances && props.absenceTypes) {
        const data = getAbsenceBalances(props.absenceBalances, props.absenceTypes, getMaxDate());
        setAbsenceCounterData(data);
      }
    },
    [props.absenceBalances, props.absenceTypes]
  );

  useEffect(
    () => {
      if (props.adjustmentUpdateSuccess || props.absenceUpdateSuccess) {
        props.getAbsenceBalancesByResource(props.resource.id);
      }
    },
    [props.adjustmentUpdateSuccess, props.absenceUpdateSuccess]
  );

  const getMaxDate = () =>
    props.adjustments.reduce((max, adj) => (max.isAfter(adj.date) ? max : moment(adj.date)), moment().endOf('months'));

  const handleShowHistoryModal = record => {
    if (record.balance !== null) {
      props.getAbsenceBalanceAdjustmentsByBalanceIn([record.balance.id]);
      setShowHistoryModal(record);
    }
  };

  const handleHideHistoryModal = () => setShowHistoryModal(null);

  const getHistoryAdjustments = () => {
    if (showHistoryModal === null) {
      return [];
    }
    const totalRow = {
      id: -1,
      date: null,
      comment: 'Solde',
      balance: showHistoryModal.balance.balance,
      manualAdjustment: false
    };
    return [...props.adjustments, totalRow];
  };

  const handleShowAddModal = () => setShowAddModal({});

  const handleHideAddModal = () => setShowAddModal(null);

  const renderBalance = days => (
    <>
      {days < 0 ? <span style={{ color: '#F44336' }}>-</span> : days > 0 && <span style={{ color: '#4CAF50' }}>+</span>}
      {` ${Math.abs(days).toFixed(2)} `}
      <small>jours</small>
    </>
  );

  const renderDebit = (data, record) =>
    record.date === null ? <b>{record.comment}</b> : record.balance > 0 ? renderBalance(0) : renderBalance(record.balance);

  const renderCredit = (data, record) =>
    record.date === null ? <b>{renderBalance(record.balance)}</b> : record.balance > 0 ? renderBalance(record.balance) : renderBalance(0);

  const renderClickableBalance = (days, record, index) => {
    if (!isCompanyOwner || record.balance === null) {
      return renderBalance(days);
    }
    return <a onClick={handleShowHistoryModal.bind(null, record, index)}>{renderBalance(days)}</a>;
  };

  const renderDate = date => (date !== null ? moment(date).format(FORMAT_DATE_PICKER) : '');

  const renderComment = (comment, record) => (record.date !== null ? <small>{comment}</small> : '');

  if (!resource || !resource.id) {
    return <Skeleton loading />;
  }
  const columns = [
    { title: 'Année', dataIndex: 'title', width: 25 },
    { title: 'Acquis', dataIndex: 'acquired', render: renderClickableBalance, width: 25 },
    { title: 'Pris', dataIndex: 'taken', render: renderClickableBalance, width: 25 },
    { title: `Solde au ${getMaxDate().format('DD MMMM YYYY')}`, dataIndex: 'total', render: renderClickableBalance, width: 25 }
  ];
  const columnsADJ = [
    { title: 'Date', dataIndex: 'date', render: renderDate },
    { title: 'Commentaire', dataIndex: 'comment', render: renderComment },
    { title: 'Débit', dataIndex: 'balance', render: renderDebit },
    { title: 'Crédit', dataIndex: 'manualAdjustment', render: renderCredit }
  ];
  return (
    <>
      {isCompanyOwner && (
        <PageHead
          title="Les compteurs d'absence"
          margin={false}
          actions={
            <Button icon="plus" type="primary" onClick={handleShowAddModal} className="ant-btn-textual">
              <span>Ajouter un ajustement</span>
            </Button>
          }
        />
      )}
      <div style={{ padding: '0 16px' }}>
        <Divider style={{ marginBottom: 16 }} dashed>
          <h3>Congés payés</h3>
        </Divider>
        <Table rowKey="title" columns={columns} dataSource={absenceCounterData.cpData} pagination={false} size="small" loading={loading} />
        {!!resourceConfig.id &&
          resourceConfig.hasRTT && (
            <>
              <Divider style={{ marginBottom: 16 }} dashed>
                <h3>Réduction du temps de travail (RTT)</h3>
              </Divider>
              <Table columns={columns} dataSource={absenceCounterData.rttData} pagination={false} size="small" loading={loading} />
            </>
          )}
        {isCompanyOwner && (
          <Modal
            title="Historique des compteurs"
            visible={showHistoryModal !== null}
            onCancel={handleHideHistoryModal}
            destroyOnClose
            footer={false}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              rowKey="id"
              columns={columnsADJ}
              dataSource={getHistoryAdjustments()}
              pagination={false}
              size="middle"
              loading={loadingAdjustments}
            />
          </Modal>
        )}
        {isCompanyOwner && (
          <AddAbsenceAdjustment adjustment={showAddModal} balances={absenceCounterData.balances} onClose={handleHideAddModal} />
        )}
        <br />
        <Divider style={{ marginBottom: 16 }} dashed>
          <h3>Historiques des absences</h3>
        </Divider>
        <Suspense fallback={<LoadingDiv />}>
          <CalendarPerResource resourceId={resource.id} />
        </Suspense>
        <br />
      </div>
    </>
  );
};

const mapStateToProps = ({
  authentication,
  application,
  absence,
  absenceBalance,
  absenceBalanceAdjustment,
  absenceType,
  resourceConfiguration
}: IRootState) => ({
  account: authentication.account,
  currentCompany: application.company.current,
  absenceBalances: absenceBalance.entities,
  loading: absenceBalance.loading,
  adjustments: absenceBalanceAdjustment.entities,
  loadingAdjustments: absenceBalanceAdjustment.loading,
  absenceTypes: absenceType.entities,
  adjustmentUpdateSuccess: absenceBalanceAdjustment.updateSuccess,
  absenceUpdateSuccess: absence.updateSuccess,
  resourceConfig: resourceConfiguration.entity
});

const mapDispatchToProps = {
  getAbsenceBalancesByResource,
  getAbsenceBalanceAdjustmentsByBalanceIn,
  getAbsenceTypes: AbsenceType.getEntities,
  getResourceConfiguration: ResourceConfiguration.getByResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(AbsenceCounters);
