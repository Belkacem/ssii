import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
import * as ExpenseValidatorsExt from 'app/application/entities/expense-validator/expense-validator.actions';
import { IExpenseValidator } from 'app/shared/model/expense-validator.model';
import ExpenseValidatorNewModal from './expense-validator-new-modal';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
/* tslint:disable:no-submodule-imports */
import { Button, Icon, Modal, Switch, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';

interface IExpenseValidatorsListProps extends StateProps, DispatchProps, RouteComponentProps {}

const ExpenseValidatorsList: FunctionComponent<IExpenseValidatorsListProps> = props => {
  const tableRef: RefObject<Table<IExpenseValidator>> = useRef<Table<IExpenseValidator>>(null);
  const [updateEntity, setUpdateEntity] = useState(null);
  const { validators, loading } = props;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(
    () => {
      if (props.updateSuccess) {
        loadData();
      }
    },
    [props.updateSuccess]
  );

  const loadData = (sortBy = 'id', order = 'desc') => props.getExpenseValidators(0, 999, `${sortBy},${order}`);

  const rowClassName = record => (record.active ? '' : 'ant-table-row-muted');

  const renderFullName = (fullName: string, record: IExpenseValidator) => (
    <div className="resource-meta">
      <Avatar name={fullName} size={28} />
      <div className="meta-content">
        <span className="meta-title">{fullName}</span>
        <span className="meta-description">{record.email}</span>
      </div>
    </div>
  );

  const renderActivated = (active: boolean, record: IExpenseValidator) => {
    const handleSwitchChange = () => handleToggleActive(record);
    return (
      <div title={active ? 'Active' : 'Inactive'}>
        <Switch size="small" checked={active} onChange={handleSwitchChange} />
      </div>
    );
  };

  const renderRecordActions = (id: number, record: IExpenseValidator) => {
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

  const handleToggleActive = (record: IExpenseValidator) => {
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
        props.updateExpenseValidator({
          ...record,
          active: !record.active
        });
      }
    });
  };

  const handleDeleteAction = (record: IExpenseValidator) => {
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
        props.deleteExpenseValidator(record.id);
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

  const columns: Array<ColumnProps<IExpenseValidator>> = [
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
      <ExpenseValidatorNewModal showModal={updateEntity !== null} validator={updateEntity} handleClose={handleHideModal} />
    </div>
  );
};

const mapStateToProps = ({ authentication, expenseValidator }: IRootState) => ({
  currentUser: authentication.account,
  validators: expenseValidator.entities,
  loading: expenseValidator.loading,
  updating: expenseValidator.updating,
  updateSuccess: expenseValidator.updateSuccess
});

const mapDispatchToProps = {
  deleteExpenseValidator: ExpenseValidatorsExt.deleteEntity,
  getExpenseValidators: ExpenseValidatorsExt.getEntities,
  updateExpenseValidator: ExpenseValidatorsExt.updateEntity,
  resendTicket: ExpenseValidatorsExt.resendTicket
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ExpenseValidatorsList);
