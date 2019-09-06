import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { TABLE_PER_PAGE } from 'app/application/common/config/constants';
import { Button, Icon, Modal, Pagination, Skeleton, Table } from 'antd';
import { EntityManagerDetails } from './entity-manager-details';
import { EntityManagerForm } from 'app/application/modules/admin/entity-manager/entity-manager-form';
import { renderSmallFieldData } from 'app/application/modules/admin/entity-manager/entity-manager-utils';

interface IEntityManagerListProps {
  apiUrl: string;
  fields: any[];
}

export const EntityManagerList: FunctionComponent<IEntityManagerListProps> = props => {
  const [activePage, setActivePage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState('0');
  const [detailsEntity, setDetailsEntity] = useState(null);
  const [formEntity, setFormEntity] = useState(null);
  const { fields, apiUrl } = props;

  useEffect(
    () => {
      if (activePage && apiUrl && formEntity === null) loadData();
    },
    [activePage, apiUrl, formEntity]
  );

  const renderRecordActions = record => {
    const handleDelete = () => handleDeleteAction(record);
    const handleUpdate = () => handleUpdateAction(record);
    const handleDetails = () => handleDetailsAction(record);
    return (
      <Button.Group>
        <Button onClick={handleDetails} icon="more" title="Détails" />
        <Button onClick={handleUpdate} icon="edit" title="Modifier" />
        <Button onClick={handleDelete} icon="delete" title="Supprimer" />
      </Button.Group>
    );
  };

  const handleAddAction = () => {
    setFormEntity({});
  };

  const handleDetailsAction = record => {
    setDetailsEntity(record);
  };

  const handleUpdateAction = record => {
    setFormEntity(record);
  };

  const handleDeleteAction = record => {
    Modal.confirm({
      title: `Suppression`,
      content: <>Êtes-vous sûr de supprimer cette entity ?</>,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        axios.delete(`${apiUrl}/${record.id}`).then(handleRefreshAction);
      }
    });
  };

  const loadData = async (sortBy = 'id', order = 'desc') => {
    const requestUrl = `${apiUrl}?page=${activePage - 1}&size=${TABLE_PER_PAGE}&sort=${sortBy},${order}`;
    setLoading(true);
    const response = await axios.get(`${requestUrl}&cacheBuster=${new Date().getTime()}`);
    if (response) {
      setData(response.data);
      setTotalItems(response.headers['x-total-count'] || '0');
    }
    setLoading(false);
  };

  const handleRefreshAction = () => loadData();

  const handleChangePage = (page: number) => setActivePage(page);

  const onChange = (pagination, filters, sorter) => {
    if (sorter.order) {
      loadData(sorter.field, sorter.order === 'descend' ? 'desc' : 'asc');
    } else {
      loadData();
    }
  };

  let content = (
    <div className="table-layout-body">
      <Skeleton active />
    </div>
  );

  if (fields.length > 0) {
    const columns: any[] = fields.map(field => ({
      title: field.name,
      dataIndex: field.name,
      sorter: true,
      render: renderSmallFieldData.bind(null, field.name, field.type)
    }));
    if (fields[0].name === 'id') {
      columns[0].title = <Icon type="number" title="ID" />;
      columns[0].fixed = 'left';
      columns[0].width = 90;
    }
    columns.push({
      title: <Icon type="setting" title="Actions" />,
      width: 96,
      align: 'center',
      render: renderRecordActions,
      fixed: 'right'
    });
    content = (
      <>
        <div className="table-layout-body">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            pagination={false}
            loading={loading}
            onChange={onChange}
            size="middle"
            scroll={{ x: 'max-content' }}
          />
        </div>
        <div className="table-layout-footer">
          <Pagination
            total={parseInt(totalItems, 10)}
            defaultCurrent={activePage}
            defaultPageSize={TABLE_PER_PAGE}
            onChange={handleChangePage}
          />
        </div>
      </>
    );
  }

  return (
    <div className="table-layout-page">
      <div className="table-layout-head">
        <PageHead
          title="Liste des données"
          margin={false}
          actions={
            <Button.Group>
              <Button onClick={handleRefreshAction} icon="reload" className="ant-btn-textual">
                Actualiser
              </Button>
              {data.length > 0 && (
                <Button onClick={handleAddAction} type="primary" icon="plus" className="ant-btn-textual">
                  Ajouter
                </Button>
              )}
            </Button.Group>
          }
        />
      </div>
      {content}
      <EntityManagerDetails fields={fields} onClose={setDetailsEntity} entity={detailsEntity} />
      <EntityManagerForm fields={fields} onClose={setFormEntity} entity={formEntity} apiUrl={apiUrl} />
    </div>
  );
};
