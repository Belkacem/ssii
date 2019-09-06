import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
import * as ProjectValidatorExt from 'app/application/entities/project-validator/project-validator.actions';
import { IProjectValidator } from 'app/shared/model/project-validator.model';
import ProjectValidatorNewModal from './project-validator-new-modal';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
/* tslint:disable:no-submodule-imports */
import { Button, Icon, Modal, Switch, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';

interface IProjectValidatorsListProps extends StateProps, DispatchProps, RouteComponentProps<{ project_id }> {}

const ProjectValidatorsList: FunctionComponent<IProjectValidatorsListProps> = props => {
  const tableRef: RefObject<Table<IProjectValidator>> = useRef<Table<IProjectValidator>>(null);
  const [updateEntity, setUpdateEntity] = useState(null);
  const { validators, loading } = props;

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

  const loadData = (sortBy = 'id', order = 'desc') =>
    props.getProjectValidators(props.match.params.project_id, 0, 999, `${sortBy},${order}`);

  const rowClassName = record => (record.active ? '' : 'ant-table-row-muted');

  const renderFullName = (fullName: string, record: IProjectValidator) => (
    <div className="resource-meta">
      <Avatar name={fullName} size={28} />
      <div className="meta-content">
        <span className="meta-title">{fullName}</span>
        <span className="meta-description">{record.email}</span>
      </div>
    </div>
  );

  const renderActivated = (active: boolean, record: IProjectValidator) => {
    const handleSwitchChange = () => handleToggleActive(record);
    return (
      <div title={active ? 'Active' : 'Inactive'}>
        <Switch size="small" checked={active} onChange={handleSwitchChange} />
      </div>
    );
  };

  const renderRecordActions = (id: number, record: IProjectValidator) => {
    const handleDelete = () => handleDeleteAction(record);
    const handleUpdate = () => setUpdateEntity(record);
    const handleResendTicket = () => props.resendTicket(record);
    return (
      <Button.Group>
        {record.userId !== props.currentUser.id && <Button onClick={handleDelete} icon="delete" title="Supprimer" />}
        <Button onClick={handleUpdate} icon="edit" title="Modifier" />
        {record.userId === null && <Button onClick={handleResendTicket} icon="mail" title="Envoyer une nouvelle invitation" />}
      </Button.Group>
    );
  };

  const handleToggleActive = (record: IProjectValidator) => {
    Modal.confirm({
      title: record.active ? 'Désactivation du validateur' : 'Activation du validateur',
      content: (
        <>
          Êtes-vous sûr de {record.active ? 'désactiver' : 'activer'} ce validateur ?<br />
          <b>{record.fullname}</b>
        </>
      ),
      okText: record.active ? 'Désactiver' : 'Activer',
      okType: record.active ? 'danger' : 'primary',
      cancelText: 'Annuler',
      onOk: () => {
        props.updateProjectValidator({
          ...record,
          active: !record.active
        });
      }
    });
  };

  const handleDeleteAction = (record: IProjectValidator) => {
    Modal.confirm({
      title: "Suppression d'un validateur",
      content: (
        <span>
          Êtes-vous sûr de supprimer ce validateur ?<br />
          <b>{record.fullname}</b>
        </span>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        props.deleteProjectValidator(record.id);
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

  const columns: Array<ColumnProps<IProjectValidator>> = [
    { title: 'Validateur', dataIndex: 'fullname', render: renderFullName, sorter: true },
    { title: 'Status', dataIndex: 'active', render: renderActivated, sorter: true },
    { title: <Icon type="setting" title="Actions" />, dataIndex: 'id', width: 96, align: 'center', render: renderRecordActions }
  ];

  return (
    <div className="table-layout-page">
      <div className="table-layout-head">
        <PageHead
          title="La liste des validateur"
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
          dataSource={[...validators]}
          pagination={false}
          loading={loading}
          rowClassName={rowClassName}
          onChange={onChange}
          size="middle"
        />
      </div>
      <ProjectValidatorNewModal
        showModal={updateEntity !== null}
        validator={updateEntity}
        handleClose={handleHideModal}
        projectId={parseInt(props.match.params.project_id, 10)}
      />
    </div>
  );
};

const mapStateToProps = ({ authentication, projectValidator }: IRootState) => ({
  validators: projectValidator.entities,
  loading: projectValidator.loading,
  updating: projectValidator.updating,
  updateSuccess: projectValidator.updateSuccess,
  currentUser: authentication.account
});

const mapDispatchToProps = {
  getProjectValidators: ProjectValidatorExt.getByProject,
  updateProjectValidator: ProjectValidatorExt.updateProjectValidator,
  deleteProjectValidator: ProjectValidatorExt.deleteProjectValidator,
  resendTicket: ProjectValidatorExt.resendTicket
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ProjectValidatorsList);
