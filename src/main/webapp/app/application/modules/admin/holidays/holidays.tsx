import React, { Component, FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IRootState } from 'app/shared/reducers';
import * as Holiday from 'app/entities/holiday/holiday.reducer';
import * as HolidayExt from 'app/application/entities/holiday/holiday.actions';
import { IHoliday } from 'app/shared/model/holiday.model';
import HolidaysModal from './holidays-modal';
import { DateFormat } from 'app/application/components/date.format.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { TABLE_PER_PAGE } from 'app/application/common/config/constants';
import { Moment } from 'moment';
/* tslint:disable:no-submodule-imports */
import { Button, Icon, Modal, Pagination, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';

export interface IHolidaysProps extends StateProps, DispatchProps, RouteComponentProps {}

const Holidays: FunctionComponent<IHolidaysProps> = props => {
  const tableRef: RefObject<Table<IHoliday>> = useRef<Table<IHoliday>>(null);
  const { listHolidays, totalItems, loading, updateSuccess } = props;
  const [updateEntity, setUpdateEntity] = useState(null);
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

  const loadData = (sortBy = 'id', order = 'desc') => {
    props.getHolidays(activePage - 1, TABLE_PER_PAGE, `${sortBy},${order}`);
  };

  const renderName = (name: string) => <small>{name}</small>;

  const renderDate = (date: Moment) =>
    date && (
      <small>
        <DateFormat value={date} />
      </small>
    );

  const renderDescription = (description: string) => <small>{description}</small>;

  const renderRecordActions = (id: number, record: IHoliday) => {
    const handleDelete = () => handleDeleteAction([record]);
    const handleUpdate = () => setUpdateEntity(record);
    return (
      <Button.Group>
        <Button onClick={handleDelete} icon="delete" title="Supprimer" />
        <Button onClick={handleUpdate} icon="edit" title="Modifier" />
      </Button.Group>
    );
  };

  const handleDeleteAction = (records: IHoliday[]) => {
    Modal.confirm({
      title: "Suppression d'une férié",
      content: (
        <>
          Êtes-vous sûr de supprimer cette férié(s) ? <br />
          <b>{records.map(record => `"${record.name}"`).join(', ')}</b>
        </>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        props.deleteHolidays(records.map(record => record.id));
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

  const columns: Array<ColumnProps<IHoliday>> = [
    { title: 'Nom de férié', dataIndex: 'name', render: renderName, sorter: true },
    { title: 'Date', dataIndex: 'date', render: renderDate, sorter: true },
    { title: 'Description', dataIndex: 'description', render: renderDescription },
    { title: <Icon type="setting" title="Actions" />, dataIndex: 'id', width: 96, align: 'center', render: renderRecordActions }
  ];

  return (
    <div className="table-layout-page">
      <div className="table-layout-head">
        <PageHead
          title="La liste des fériés"
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
          dataSource={[...listHolidays]}
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
      <HolidaysModal showModal={updateEntity !== null} onClose={handleHideModal} entity={updateEntity} />
    </div>
  );
};

const mapStateToProps = ({ holiday }: IRootState) => ({
  listHolidays: holiday.entities,
  totalItems: holiday.totalItems,
  loading: holiday.loading,
  updating: holiday.updating,
  updateSuccess: holiday.updateSuccess
});

const mapDispatchToProps = {
  getHolidays: Holiday.getEntities,
  deleteHolidays: HolidayExt.deleteHolidays
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Holidays));
