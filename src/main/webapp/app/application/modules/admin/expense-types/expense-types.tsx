import React, { Component, FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { deleteExpenseTypes } from 'app/application/entities/expense-type/expense-type.actions';
import * as ExpenseType from 'app/entities/expense-type/expense-type.reducer';
import { IExpenseType } from 'app/shared/model/expense-type.model';
import ExpenseTypeModal from './expense-type-modal';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { TABLE_PER_PAGE } from 'app/application/common/config/constants';
/* tslint:disable:no-submodule-imports */
import { Button, Icon, Modal, Pagination, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';

export interface IExpenseTypesProps extends StateProps, DispatchProps, RouteComponentProps {}

const ExpenseTypes: FunctionComponent<IExpenseTypesProps> = props => {
  const tableRef: RefObject<Table<IExpenseType>> = useRef<Table<IExpenseType>>(null);
  const [updateEntity, setUpdateEntity] = useState(null);
  const { expenseTypesList, loading, updateSuccess, totalItems } = props;
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

  const loadData = (sortBy = 'id', order = 'desc') => props.getExpenseTypes(activePage - 1, TABLE_PER_PAGE, `${sortBy},${order}`);

  const renderCode = (code: string) => (
    <b>
      <small>{code}</small>
    </b>
  );

  const renderType = (type: string) => <small>{type}</small>;

  const renderRecordActions = (id: number, record: IExpenseType) => {
    const handleDelete = () => handleDeleteAction([record]);
    const handleUpdate = () => setUpdateEntity(record);
    return (
      <Button.Group>
        <Button onClick={handleDelete} icon="delete" title="Supprimer" />
        <Button onClick={handleUpdate} icon="edit" title="Modifier" />
      </Button.Group>
    );
  };

  const handleDeleteAction = (records: IExpenseType[]) => {
    Modal.confirm({
      title: "Suppression d'un type",
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
        props.deleteExpenseTypes(records.map(record => record.id));
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

  const columns: Array<ColumnProps<IExpenseType>> = [
    { title: 'Code', sorter: true, dataIndex: 'code', render: renderCode },
    { title: 'Libellé', sorter: true, dataIndex: 'type', render: renderType },
    { title: <Icon type="setting" title="Actions" />, dataIndex: 'id', width: 96, align: 'center', render: renderRecordActions }
  ];

  return (
    <div className="table-layout-page">
      <div className="table-layout-head">
        <PageHead
          title="La liste des types de note de frais"
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
          dataSource={[...expenseTypesList]}
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
      <ExpenseTypeModal showModal={updateEntity !== null} onClose={handleHideModal} entity={updateEntity} />
    </div>
  );
};

const mapStateToProps = ({ expenseType }: IRootState) => ({
  expenseTypesList: expenseType.entities,
  totalItems: expenseType.totalItems,
  loading: expenseType.loading,
  updating: expenseType.updating,
  updateSuccess: expenseType.updateSuccess
});

const mapDispatchToProps = {
  getExpenseTypes: ExpenseType.getEntities,
  deleteExpenseTypes
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ExpenseTypes));
