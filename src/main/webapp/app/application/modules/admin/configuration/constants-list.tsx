import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import * as ConstantsReducer from 'app/entities/constant/constant.reducer';
import { IConstant } from 'app/shared/model/constant.model';
import ConstantsFormModal from './constants-form-modal';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { TABLE_PER_PAGE } from 'app/application/common/config/constants';
/* tslint:disable:no-submodule-imports */
import { Button, Icon, Modal, Pagination, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';

export interface IConstantsListProps extends StateProps, DispatchProps, RouteComponentProps {}

const ConstantsList: FunctionComponent<IConstantsListProps> = props => {
  const tableRef: RefObject<Table<IConstant>> = useRef<Table<IConstant>>(null);
  const [updateEntity, setUpdateEntity] = useState(null);
  const { constantsList, loading, updateSuccess, totalItems } = props;
  const [activePage, setActivePage] = useState(1);

  useEffect(
    () => {
      loadData();
    },
    [activePage]
  );

  useEffect(
    () => {
      if (updateSuccess) loadData();
    },
    [updateSuccess]
  );

  const loadData = (sortBy = 'id', order = 'asc') => props.getAllConstants(activePage - 1, TABLE_PER_PAGE, `${sortBy},${order}`);

  const renderKey = (key: string) => (
    <b>
      <small>{key}</small>
    </b>
  );

  const renderValue = (value: string) => <small>{value}</small>;

  const renderRecordActions = (record: IConstant) => {
    const handleDelete = () => handleDeleteAction(record);
    const handleUpdate = () => handleUpdateAction(record);
    return (
      <Button.Group>
        <Button onClick={handleDelete} icon="delete" title="Supprimer" />
        <Button onClick={handleUpdate} icon="edit" title="Modifier" />
      </Button.Group>
    );
  };

  const handleDeleteAction = (record: IConstant) => {
    Modal.confirm({
      title: "Suppression d'un constant",
      content: (
        <>
          Êtes-vous sûr de supprimer ce type(s) ?<br />
          <b>{record.key}</b>
        </>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        props.deleteConstant(record.id);
      }
    });
  };

  const handleAddAction = () => setUpdateEntity({});

  const handleUpdateAction = (record: IConstant) => setUpdateEntity(record);

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

  const columns: Array<ColumnProps<IConstant>> = [
    { title: '#', sorter: true, dataIndex: 'id', render: renderValue, defaultSortOrder: 'ascend' },
    { title: 'Clé', sorter: true, dataIndex: 'key', render: renderKey },
    { title: 'Valeur', sorter: true, dataIndex: 'value', render: renderValue },
    { title: <Icon type="setting" title="Actions" />, width: 96, align: 'center', render: renderRecordActions }
  ];

  return (
    <div className="table-layout-page">
      <div className="table-layout-head">
        <PageHead
          title="Les configuration par défault"
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
          dataSource={[...constantsList]}
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
      <ConstantsFormModal visible={updateEntity !== null} onClose={handleHideModal} entity={updateEntity} />
    </div>
  );
};

const mapStateToProps = ({ constant }: IRootState) => ({
  constantsList: constant.entities,
  totalItems: constant.totalItems,
  loading: constant.loading,
  updating: constant.updating,
  updateSuccess: constant.updateSuccess
});

const mapDispatchToProps = {
  getAllConstants: ConstantsReducer.getEntities,
  deleteConstant: ConstantsReducer.deleteEntity
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ConstantsList));
