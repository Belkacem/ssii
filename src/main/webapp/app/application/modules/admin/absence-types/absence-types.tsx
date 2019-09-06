import React, { Component, FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { deleteAbsenceTypes } from 'app/application/entities/absence-type/absence-type.actions';
import * as AbsenceType from 'app/entities/absence-type/absence-type.reducer';
import { Gender, IAbsenceType } from 'app/shared/model/absence-type.model';
import AbsenceTypeModal from './absence-type-modal';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { TABLE_PER_PAGE } from 'app/application/common/config/constants';
/* tslint:disable:no-submodule-imports */
import { Button, Icon, Modal, Pagination, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';

export interface IAbsenceTypesProps extends StateProps, DispatchProps, RouteComponentProps {}

const AbsenceTypes: FunctionComponent<IAbsenceTypesProps> = props => {
  const tableRef: RefObject<Table<IAbsenceType>> = useRef<Table<IAbsenceType>>(null);
  const [updateEntity, setUpdateEntity] = useState(null);
  const { absenceTypesList, loading, updateSuccess, totalItems } = props;
  const [activePage, setActivePage] = useState(1);

  useEffect(
    () => {
      loadData();
    },
    [activePage]
  );

  useEffect(
    () => {
      if (updateSuccess) {
        loadData();
      }
    },
    [updateSuccess]
  );

  const loadData = (sortBy = 'id', order = 'desc') => props.getAbsenceTypes(activePage - 1, TABLE_PER_PAGE, `${sortBy},${order}`);

  const renderCode = (code: string) => (
    <b>
      <small>{code}</small>
    </b>
  );

  const renderType = (type: string) => <small>{type}</small>;

  const renderHasBalance = (hasBalance: boolean) => hasBalance && <Icon type="check" />;

  const renderGender = (gender: Gender) => {
    switch (gender) {
      case Gender.MALE:
        return (
          <small>
            <Icon type="man" /> Masculin
          </small>
        );
      case Gender.FEMALE:
        return (
          <small>
            <Icon type="woman" /> Féminin
          </small>
        );
      case Gender.OTHER:
        return <small>Autre</small>;
      default:
        return <small>Tous</small>;
    }
  };

  const renderRecordActions = (id: number, record: IAbsenceType) => {
    const handleDelete = () => handleDeleteAction([record]);
    const handleUpdate = () => setUpdateEntity(record);
    return (
      <Button.Group>
        <Button onClick={handleDelete} icon="delete" title="Supprimer" />
        <Button onClick={handleUpdate} icon="edit" title="Modifier" />
      </Button.Group>
    );
  };

  const handleDeleteAction = (records: IAbsenceType[]) => {
    Modal.confirm({
      title: "Suppression d'un type de congé",
      content: (
        <>
          Êtes-vous sûr de supprimer ce type(s) ?<br />
          <b>{records.map(record => `"${record.type}"`).join(', ')}</b>
        </>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        props.deleteAbsenceTypes(records.map(record => record.id));
      }
    });
  };

  const handleAddAction = () => setUpdateEntity({});

  const handleHideModal = () => setUpdateEntity(null);

  const handleChangePage = (page: number) => setActivePage(page);

  const onChange = (pagination, filters, sorter) => {
    if (sorter.order) {
      loadData(sorter.field, sorter.order === 'descend' ? 'desc' : 'asc');
    } else {
      loadData();
    }
  };

  const handleRefreshAction = () => loadData();

  const columns: Array<ColumnProps<IAbsenceType>> = [
    { title: 'Code', sorter: true, dataIndex: 'code', render: renderCode },
    { title: 'Type', sorter: true, dataIndex: 'type', render: renderType },
    { title: 'Sexe', sorter: true, dataIndex: 'gender', render: renderGender },
    { title: 'Compteur', sorter: true, dataIndex: 'hasBalance', render: renderHasBalance },
    { title: <Icon type="setting" title="Actions" />, dataIndex: 'id', width: 96, align: 'center', render: renderRecordActions }
  ];

  return (
    <div className="table-layout-page">
      <div className="table-layout-head">
        <PageHead
          title="La liste des types de congé & absence"
          margin={false}
          actions={
            <Button.Group>
              <Button onClick={handleRefreshAction} icon="reload" className="ant-btn-textual">
                Actualiser
              </Button>
              <Button onClick={handleAddAction} type="primary" icon="plus" className="ant-btn-textual">
                Ajouter
              </Button>
            </Button.Group>
          }
        />
      </div>
      <div className="table-layout-body">
        <Table
          ref={tableRef}
          rowKey="id"
          columns={columns}
          dataSource={[...absenceTypesList]}
          pagination={false}
          loading={loading}
          onChange={onChange}
          size="middle"
        />
      </div>
      <div className="table-layout-footer">
        <Pagination
          total={loading ? 0 : parseInt(totalItems + '', 10)}
          defaultCurrent={activePage}
          defaultPageSize={TABLE_PER_PAGE}
          onChange={handleChangePage}
          size="small"
        />
      </div>
      <AbsenceTypeModal showModal={updateEntity !== null} onClose={handleHideModal} entity={updateEntity} />
    </div>
  );
};

const mapStateToProps = ({ absenceType }: IRootState) => ({
  absenceTypesList: absenceType.entities,
  totalItems: absenceType.totalItems,
  loading: absenceType.loading,
  updating: absenceType.updating,
  updateSuccess: absenceType.updateSuccess
});

const mapDispatchToProps = {
  getAbsenceTypes: AbsenceType.getEntities,
  deleteAbsenceTypes
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(AbsenceTypes));
