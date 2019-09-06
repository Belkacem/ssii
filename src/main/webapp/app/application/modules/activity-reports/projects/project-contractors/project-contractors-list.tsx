import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
import * as ProjectContractorExt from 'app/application/entities/project-contractor/project-contractor.actions';
import { IProjectContractor } from 'app/shared/model/project-contractor.model';
import ProjectContractorModal from './project-contractors-modal';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { Avatar } from 'app/application/components/avatar/avatar.component';
/* tslint:disable:no-submodule-imports */
import { Button, Icon, Modal, Switch, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';

interface IProjectContractorsListProps extends StateProps, DispatchProps, RouteComponentProps<{ project_id }> {}

const ProjectContractorsList: FunctionComponent<IProjectContractorsListProps> = props => {
  const tableRef: RefObject<Table<IProjectContractor>> = useRef<Table<IProjectContractor>>(null);
  const [updateEntity, setUpdateEntity] = useState(null);
  const { contractors, loading } = props;

  useEffect(
    () => {
      if (props.updateSuccess) {
        loadData();
      }
    },
    [props.updateSuccess]
  );

  useEffect(
    () => {
      if (props.match.params.project_id) {
        loadData();
      }
    },
    [props.match.params.project_id]
  );

  useEffect(
    () => {
      if (updateEntity === null) {
        loadData();
      }
    },
    [updateEntity]
  );

  const loadData = (sortBy = 'id', order = 'desc') => {
    const projectId = props.match.params.project_id;
    props.getProjectContractors(projectId, 0, 999, `${sortBy},${order}`);
  };

  const rowClassName = record => (record.active ? '' : 'ant-table-row-muted');

  const renderFullName = (fullName: string, record: IProjectContractor) => (
    <div className="resource-meta">
      <Avatar name={fullName} size={28} />
      <div className="meta-content">
        <span className="meta-title">{fullName}</span>
        <span className="meta-description">{record.email}</span>
      </div>
    </div>
  );

  const renderActivated = (active: boolean, record: IProjectContractor) => {
    const handleSwitchChange = () => handleToggleActive(record);
    return (
      <div title={active ? 'Active' : 'Inactive'}>
        <Switch size="small" checked={active} onChange={handleSwitchChange} />
      </div>
    );
  };

  const renderRecordActions = (id: number, record: IProjectContractor) => {
    const handleDelete = () => handleDeleteAction(record);
    const handleUpdate = () => setUpdateEntity(record);
    const handleResendTicket = () => props.resendTicket(record);
    return (
      <Button.Group>
        <Button onClick={handleDelete} icon="delete" title="Supprimer" />
        <Button onClick={handleUpdate} icon="edit" title="Modifier" />
        {record.userId === null && <Button onClick={handleResendTicket} icon="mail" title="Envoyer une nouvelle invitation" />}
      </Button.Group>
    );
  };

  const handleToggleActive = (record: IProjectContractor) => {
    Modal.confirm({
      title: record.active ? "Désactivation d'intermédiare" : "Activation d'intermédiare",
      content: (
        <>
          Êtes-vous sûr de {record.active ? 'désactiver' : 'activer'} ce intermédiare ?<br />
          <b>{record.fullname}</b>
        </>
      ),
      okText: record.active ? 'Désactiver' : 'Activer',
      okType: record.active ? 'danger' : 'primary',
      cancelText: 'Annuler',
      onOk: () => {
        props.updateProjectContractor({
          ...record,
          active: !record.active
        });
      }
    });
  };

  const handleDeleteAction = (record: IProjectContractor) => {
    Modal.confirm({
      title: "Suppression d'un intermédiare",
      content: (
        <span>
          Êtes-vous sûr de supprimer ce intermédiare ?<br />
          <b>{record.fullname}</b>
        </span>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        props.deleteProjectContractor(record.id);
      }
    });
  };

  const handleAddAction = () => setUpdateEntity({});

  const handleHideModal = () => setUpdateEntity(null);

  const onChange = (pagination, filters, sorter) => {
    if (sorter.order) {
      loadData(sorter.field, sorter.order === 'descend' ? 'desc' : 'asc');
    } else {
      loadData();
    }
  };

  const handleRefreshAction = () => loadData();

  const columns: Array<ColumnProps<IProjectContractor>> = [
    { title: 'Nom et Prénom', dataIndex: 'fullname', render: renderFullName, sorter: true },
    { title: 'Status', dataIndex: 'active', render: renderActivated, sorter: true },
    { title: <Icon type="setting" title="Actions" />, dataIndex: 'id', width: 96, align: 'center', render: renderRecordActions }
  ];

  return (
    <>
      <div className="table-layout-page">
        <div className="table-layout-head">
          <PageHead
            title="La liste des intermédiares"
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
            dataSource={[...contractors]}
            pagination={false}
            loading={loading}
            rowClassName={rowClassName}
            onChange={onChange}
            size="middle"
          />
        </div>
        <ProjectContractorModal
          showModal={updateEntity !== null}
          contractor={updateEntity}
          handleClose={handleHideModal}
          projectId={parseInt(props.match.params.project_id, 10)}
        />
      </div>
    </>
  );
};

const mapStateToProps = ({ projectContractor }: IRootState) => ({
  contractors: projectContractor.entities,
  loading: projectContractor.loading,
  updating: projectContractor.updating,
  updateSuccess: projectContractor.updateSuccess
});

const mapDispatchToProps = {
  getProjectContractors: ProjectContractorExt.getProjectContractors,
  updateProjectContractor: ProjectContractorExt.updateProjectContractor,
  deleteProjectContractor: ProjectContractorExt.deleteProjectContractor,
  resendTicket: ProjectContractorExt.resendTicket
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ProjectContractorsList);
