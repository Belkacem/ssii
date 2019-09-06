import React, { Component, FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { deleteUser, getUsers, updateUser } from 'app/modules/administration/user-management/user-management.reducer';
import { loginAsUser } from 'app/application/entities/user-management/user-management.actions';
import { IUser } from 'app/shared/model/user.model';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { AUTHORITIES_LABELS, TABLE_PER_PAGE } from 'app/application/common/config/constants';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
/* tslint:disable:no-submodule-imports */
import { Button, Icon, Modal, Pagination, Switch, Table, Tag } from 'antd';
import { ColumnProps } from 'antd/lib/table';

export interface IUsersListProps extends StateProps, DispatchProps, RouteComponentProps {}

const UsersList: FunctionComponent<IUsersListProps> = props => {
  const tableRef: RefObject<Table<IUser>> = useRef<Table<IUser>>(null);
  const { list, totalItems, updateSuccess, loading } = props;
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

  const loadData = (sortBy = 'id', order = 'desc') => props.getUsers(activePage - 1, TABLE_PER_PAGE, `${sortBy},${order}`);

  const renderAuthorities = authorities =>
    authorities.map((role, index) => (
      <Tag color="blue" key={index}>
        {AUTHORITIES_LABELS[role]}
      </Tag>
    ));

  const renderFullName = (firstName: string, user: IUser) => (
    <div className="resource-meta">
      <Avatar name={`${user.firstName} ${user.lastName}`} style={{ float: 'left', marginRight: 5 }} size={28} />
      <div className="meta-content">
        <div className="meta-title">
          <Link to={`/app/admin/users/${user.login}`}>
            <b>{`${user.firstName} ${user.lastName}`}</b>
          </Link>
        </div>
        <span className="meta-description">{user.email}</span>
      </div>
    </div>
  );

  const renderActivated = (active: boolean, user: IUser) => {
    const handleSwitchChange = () => handleToggleActiveAction(user);
    return (
      <div title={active ? 'Active' : 'Inactive'}>
        <Switch size="small" checked={active} onChange={handleSwitchChange} />
      </div>
    );
  };

  const renderRecordActions = (id: number, user: IUser) => {
    const handleDelete = () => handleDeleteAction(user);
    const handleUpdate = () => handleEditAction(user);
    const handleActivation = () => handleToggleActiveAction(user);
    const handleLogin = () => handleLoginAsUser(user);
    const isCurrent = props.currentUser.id === user.id;
    return (
      <Button.Group>
        {!isCurrent && <Button onClick={handleDelete} icon="delete" title="Supprimer" />}
        {!isCurrent && !user.activated && <Button onClick={handleActivation} icon="check" title="Activate" />}
        {!isCurrent && user.activated && <Button onClick={handleActivation} icon="stop" title="Desactivate" />}
        <Button onClick={handleUpdate} icon="edit" title="Modifier" />
        {!isCurrent && <Button onClick={handleLogin} icon="login" title="Login" />}
      </Button.Group>
    );
  };

  const rowClassName = (user: IUser) => (user.activated ? '' : 'ant-table-row-muted');

  const handleDeleteAction = (user: IUser) => {
    Modal.confirm({
      title: "Suppression d'utilisateur",
      content: (
        <span>
          Etes-vous sure de supprimer cette utilisateur ? <br />
          <b>{user.firstName + ' ' + user.lastName}</b>
        </span>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        props.deleteUser(user.login);
      }
    });
  };

  const handleToggleActiveAction = (user: IUser) => {
    Modal.confirm({
      title: user.activated ? "Désactivation d'utilisateur" : "Activation d'utilisateur",
      content: (
        <>
          Êtes-vous sûr de {user.activated ? 'désactiver' : 'activer'} cette utilisateur ?<br />
          <b>{user.firstName + ' ' + user.lastName}</b>
        </>
      ),
      okText: user.activated ? 'Désactiver' : 'Activer',
      okType: user.activated ? 'danger' : 'primary',
      cancelText: 'Annuler',
      onOk: () => {
        props.updateUser({
          ...user,
          activated: !user.activated
        });
      }
    });
  };

  const handleEditAction = (user: IUser) => props.history.push(`/app/admin/users/${user.login}/update`);

  const handleAddAction = () => props.history.push(`/app/admin/users/new`);

  const handleLoginAsUser = (user: IUser) => props.loginAsUser(user.login, props.history.push);

  const handleChangePage = (page: number) => setActivePage(page);

  const onChange = (pagination, filters, sorter) => {
    if (sorter.order) {
      loadData(sorter.field, sorter.order === 'descend' ? 'desc' : 'asc');
    } else {
      loadData();
    }
  };

  const handleRefreshAction = () => loadData();

  const columns: Array<ColumnProps<IUser>> = [
    { title: "Nom d'utilisateur", dataIndex: 'firstName', render: renderFullName, sorter: true },
    { title: 'Activation', dataIndex: 'activated', render: renderActivated, sorter: true },
    { title: 'Les autorités', dataIndex: 'authorities', render: renderAuthorities },
    { title: <Icon type="setting" title="Actions" />, dataIndex: 'id', width: 96, align: 'center', render: renderRecordActions }
  ];

  return (
    <div className="table-layout-page">
      <div className="table-layout-head">
        <PageHead
          title="La liste des utilisateurs"
          margin={false}
          actions={
            <Button.Group>
              <Button onClick={handleRefreshAction} icon="reload" className="ant-btn-textual">
                Actualiser
              </Button>
              <Button onClick={handleAddAction} type="primary" icon="plus" className="ant-btn-textual">
                Crée
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
          dataSource={[...list]}
          pagination={false}
          loading={loading}
          rowClassName={rowClassName}
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
    </div>
  );
};

const mapStateToProps = ({ userManagement, authentication }: IRootState) => ({
  list: userManagement.users,
  totalItems: userManagement.totalItems,
  updateSuccess: userManagement.updateSuccess,
  loading: userManagement.loading,
  currentUser: authentication.account
});

const mapDispatchToProps = { getUsers, deleteUser, updateUser, loginAsUser };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(UsersList));
