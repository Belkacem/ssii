import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
import * as ProjectResourceExt from 'app/application/entities/project-resource/project-resource.actions';
import { IProjectResource } from 'app/shared/model/project-resource.model';
import ResourceName from 'app/application/common/entities/resource-name';
import ProjectResourceNewModal from './project-resources-new-modal';
import ProjectResourcesUpdateModal from './project-resources-update';
import { DateFormat } from 'app/application/components/date.format.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
/* tslint:disable:no-submodule-imports */
import { Button, Icon, Modal, Switch, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { Moment } from 'moment';

interface IProjectResourcesListProps extends StateProps, DispatchProps, RouteComponentProps<{ project_id }> {}

const ProjectResourcesList: FunctionComponent<IProjectResourcesListProps> = props => {
  const tableRef: RefObject<Table<IProjectResource>> = useRef<Table<IProjectResource>>(null);
  const [creationModal, setCreationModal] = useState(null);
  const [updateModal, setUpdateModal] = useState(null);
  const { membersList, loading } = props;

  useEffect(
    () => {
      if (props.updateSuccess || !!props.match.params.project_id) {
        loadData();
      }
    },
    [props.updateSuccess, props.match.params.project_id]
  );

  const loadData = (sortBy = 'id', order = 'desc') =>
    props.getProjectResources(props.match.params.project_id, 0, 999, `${sortBy},${order}`);

  const rowClassName = record => (record.active ? '' : 'ant-table-row-muted');

  const renderFullName = (data, row) => (
    <ResourceName resourceId={row.resourceId} isMeta link={`/app/company/projects/${props.match.params.project_id}/members/${row.id}`} />
  );

  const renderPeriod = (startDate: Moment, record: IProjectResource) => (
    <div style={{ whiteSpace: 'nowrap' }}>
      <small>
        <DateFormat value={record.startDate} />
        <br />
        {record.endDate === null ? "Jusqu'à maintenant" : <DateFormat value={record.endDate} />}
      </small>
    </div>
  );

  const renderProjectEmail = email => <small>{email}</small>;

  const renderActivated = (active: boolean, record: IProjectResource) => {
    const handleSwitchChange = () => handleToggleActive(record);
    return (
      <div title={active ? 'Active' : 'Inactive'}>
        <Switch size="small" checked={active} onChange={handleSwitchChange} />
      </div>
    );
  };

  const renderRecordActions = (id: number, record: IProjectResource) => {
    const handleDetails = () => handleDetailsAction(record);
    const handleDelete = () => handleDeleteAction(record);
    const handleUpdate = () => setUpdateModal(record);
    return (
      <Button.Group>
        <Button onClick={handleDetails} icon="eye" title="Détails" />
        <Button onClick={handleDelete} icon="delete" title="Supprimer" />
        <Button onClick={handleUpdate} icon="edit" title="Modifier" />
      </Button.Group>
    );
  };

  const handleToggleActive = (record: IProjectResource) => {
    Modal.confirm({
      title: record.active ? 'Désactivation du membre' : 'Activation du membre',
      content: <>Êtes-vous sûr de {record.active ? 'désactiver' : 'activer'} ce membre ?</>,
      okText: record.active ? 'Désactiver' : 'Activer',
      okType: record.active ? 'danger' : 'primary',
      cancelText: 'Annuler',
      onOk: () => {
        props.updateProjectResource({
          ...record,
          active: !record.active
        });
      }
    });
  };

  const handleDeleteAction = (record: IProjectResource) => {
    Modal.confirm({
      title: "Suppression d'un membre",
      content: <span>Êtes-vous sûr de supprimer ce membre(s) ?</span>,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        props.deleteProjectResource(record.id);
      }
    });
  };

  const handleAddAction = () => setCreationModal({});

  const handleHideCreationModal = () => setCreationModal(null);

  const handleHideUpdateModal = () => setUpdateModal(null);

  const handleDetailsAction = (record: IProjectResource) =>
    props.history.push(`/app/company/projects/${props.match.params.project_id}/members/${record.id}`);

  const onChange = (pagination, filters, sorter) => {
    if (sorter.order) {
      loadData(sorter.field, sorter.order === 'descend' ? 'desc' : 'asc');
    } else {
      loadData();
    }
  };

  const handleRefreshAction = () => loadData();

  const columns: Array<ColumnProps<IProjectResource>> = [
    { title: 'Ressource', dataIndex: 'resourceId', render: renderFullName, sorter: true },
    { title: 'Période', dataIndex: 'startDate', render: renderPeriod },
    { title: 'Projet E-mail', dataIndex: 'projectEmail', render: renderProjectEmail, sorter: true },
    { title: 'Status', dataIndex: 'active', render: renderActivated, sorter: true },
    { title: <Icon type="setting" title="Actions" />, dataIndex: 'id', width: 96, align: 'center', render: renderRecordActions }
  ];

  return (
    <div className="table-layout-page">
      <div className="table-layout-head">
        <PageHead
          title="La liste des membres"
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
          dataSource={[...membersList]}
          pagination={false}
          loading={loading}
          rowClassName={rowClassName}
          onChange={onChange}
          size="middle"
        />
      </div>
      <ProjectResourceNewModal
        visible={creationModal !== null}
        onClose={handleHideCreationModal}
        projectId={props.match.params.project_id}
      />
      <ProjectResourcesUpdateModal visible={updateModal !== null} projectResource={updateModal} handleClose={handleHideUpdateModal} />
    </div>
  );
};

const mapStateToProps = ({ projectResource }: IRootState) => ({
  membersList: projectResource.entities,
  loading: projectResource.loading,
  updating: projectResource.updating,
  updateSuccess: projectResource.updateSuccess
});

const mapDispatchToProps = {
  getProjectResources: ProjectResourceExt.getByProject,
  deleteProjectResource: ProjectResourceExt.deleteProjectResource,
  updateProjectResource: ProjectResourceExt.updateProjectResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ProjectResourcesList);
