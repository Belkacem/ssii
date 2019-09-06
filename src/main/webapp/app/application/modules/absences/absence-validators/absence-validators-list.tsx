import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import * as AbsenceValidatorsExt from 'app/application/entities/absence-validator/absence-validator.actions';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import { IAbsenceValidator } from 'app/shared/model/absence-validator.model';
import { IResource } from 'app/shared/model/resource.model';
import AbsenceValidatorNewModal from './absence-validator-new-modal';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
/* tslint:disable:no-submodule-imports */
import { Button, Divider, Icon, List, Modal, Popover, Switch, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';

interface IAbsenceValidatorsListProps extends StateProps, DispatchProps, RouteComponentProps {}

const AbsenceValidatorsList: FunctionComponent<IAbsenceValidatorsListProps> = props => {
  const tableRef: RefObject<Table<IAbsenceValidator>> = useRef<Table<IAbsenceValidator>>(null);
  const [updateEntity, setUpdateEntity] = useState(null);
  const { validators, loading } = props;

  useEffect(() => {
    props.getAllResources();
    handleRefreshAction();
  }, []);

  useEffect(
    () => {
      if (props.updateSuccess) {
        handleRefreshAction();
      }
    },
    [props.updateSuccess]
  );

  const loadData = (sortBy = 'id', order = 'desc') => props.getAbsenceValidators(0, 999, `${sortBy},${order}`);

  const rowClassName = (record: IAbsenceValidator) => (record.active ? '' : 'ant-table-row-muted');

  const renderFullName = (fullName: string, record: IAbsenceValidator) => (
    <div className="resource-meta">
      <Avatar name={fullName} size={28} />
      <div className="meta-content">
        <span className="meta-title">{fullName}</span>
        <span className="meta-description">{record.email}</span>
      </div>
    </div>
  );

  const renderResource = (resource: IResource) => (
    <List.Item key={resource.id}>
      <small>
        <b>{getFullName(resource)}</b>
        {!resource.draft && <Divider type="vertical" />}
        {!resource.draft && <span>{resource.email}</span>}
      </small>
    </List.Item>
  );

  const renderResources = (resources: IResource[]) => {
    const list = <List dataSource={resources} renderItem={renderResource} size="small" rowKey="id" split={false} />;
    return (
      <Popover content={list} placement="bottom" trigger="hover">
        {
          <small>
            <b>
              {resources.length} / {props.resources.length}
            </b>{' '}
            ressource
            {resources.length > 1 && 's'}
          </small>
        }
      </Popover>
    );
  };

  const renderActivated = (active: boolean, record: IAbsenceValidator) => (
    <div title={active ? 'Active' : 'Inactive'}>
      <Switch size="small" checked={active} onChange={handleToggleActive.bind(null, record)} />
    </div>
  );

  const renderRecordActions = (id: number, record: IAbsenceValidator) => {
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

  const handleToggleActive = (record: IAbsenceValidator) => {
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
        props.updateAbsenceValidator({
          ...record,
          active: !record.active
        });
      }
    });
  };

  const handleAddAction = () => setUpdateEntity({});

  const handleHideModal = () => setUpdateEntity(null);

  const handleDeleteAction = (record: IAbsenceValidator) => {
    Modal.confirm({
      title: "Suppression d'un validateur",
      content: (
        <>
          Êtes-vous sûr de supprimer ce validateur ?<br />
          <b>{record.fullname}</b>
        </>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        props.deleteAbsenceValidator(record.id);
      }
    });
  };

  const onChange = (pagination, filters, sorter) => {
    if (sorter.order) {
      loadData(sorter.field, sorter.order === 'descend' ? 'desc' : 'asc');
    } else {
      loadData();
    }
  };

  const handleRefreshAction = () => loadData();

  const columns: Array<ColumnProps<IAbsenceValidator>> = [
    { title: 'Validateur', dataIndex: 'fullname', render: renderFullName, sorter: true },
    { title: 'Ressources', dataIndex: 'resources', render: renderResources },
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
      <AbsenceValidatorNewModal showModal={updateEntity !== null} validator={updateEntity} handleClose={handleHideModal} />
    </div>
  );
};

const mapStateToProps = ({ authentication, absenceValidator, resource }: IRootState) => ({
  resources: resource.entities,
  currentUser: authentication.account,
  validators: absenceValidator.entities,
  totalItems: absenceValidator.totalItems,
  loading: absenceValidator.loading,
  updating: absenceValidator.updating,
  updateSuccess: absenceValidator.updateSuccess
});

const mapDispatchToProps = {
  deleteAbsenceValidator: AbsenceValidatorsExt.deleteEntity,
  getAbsenceValidators: AbsenceValidatorsExt.getEntities,
  updateAbsenceValidator: AbsenceValidatorsExt.updateEntity,
  resendTicket: AbsenceValidatorsExt.resendTicket,
  getAllResources: ResourceExt.getAll
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(AbsenceValidatorsList));
