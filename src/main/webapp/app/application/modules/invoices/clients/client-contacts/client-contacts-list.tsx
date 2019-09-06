import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
import * as ClientContactExt from 'app/application/entities/client-contact/client-contact.actions';
import { IClientContact } from 'app/shared/model/client-contact.model';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import ClientContactsFormModal from './client-contacts-form-modal';
import { phoneNumberFormatter } from 'app/application/components/zsoft-form/custom-fields/phoneField.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
/* tslint:disable:no-submodule-imports */
import { Button, Icon, Modal, Switch, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';

interface IClientContactsListProps extends StateProps, DispatchProps, RouteComponentProps {}

const ClientContactsList: FunctionComponent<IClientContactsListProps> = props => {
  const tableRef: RefObject<Table<IClientContact>> = useRef<Table<IClientContact>>(null);
  const [updateEntity, setUpdateEntity] = useState(null);
  const { contacts, loading, client } = props;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(
    () => {
      if (props.updateSuccess || !!client.id) {
        loadData();
      }
    },
    [props.updateSuccess, client.id]
  );

  const loadData = (sortBy = 'id', order = 'desc') => props.getClientContactsByClientIds([client.id], `${sortBy},${order}`);

  const rowClassName = (record: IClientContact) => (record.active ? '' : 'ant-table-row-muted');

  const renderFullName = (fullName: string, record: IClientContact) => (
    <div className="resource-meta">
      <Avatar name={fullName} size={28} />
      <div className="meta-content">
        <span className="meta-title">{fullName}</span>
        <span className="meta-description">{record.email}</span>
      </div>
    </div>
  );

  const renderPhoneNumber = (phoneNumber: string) =>
    phoneNumber !== null && phoneNumber !== '' ? (
      <a href={`tel:${phoneNumberFormatter(phoneNumber)}`}>
        <small>{phoneNumberFormatter(phoneNumber)}</small>
      </a>
    ) : (
      <small>-</small>
    );

  const renderActivated = (active: boolean, record: IClientContact) => {
    const handleSwitchChange = () => handleToggleActive(record);
    return (
      <div title={active ? 'Active' : 'Inactive'}>
        <Switch size="small" checked={active} onChange={handleSwitchChange} />
      </div>
    );
  };

  const renderRecordActions = (id: number, record: IClientContact) => {
    const handleDelete = () => handleDeleteAction(record);
    const handleUpdate = () => setUpdateEntity(record);
    return (
      <Button.Group>
        <Button onClick={handleDelete} icon="delete" title="Supprimer" />
        <Button onClick={handleUpdate} icon="edit" title="Modifier" />
      </Button.Group>
    );
  };

  const handleToggleActive = (record: IClientContact) => {
    Modal.confirm({
      title: record.active ? 'Désactivation du contact' : 'Activation du contact',
      content: (
        <>
          Êtes-vous sûr de {record.active ? 'désactiver' : 'activer'} l'envoi des e-mails et notifications à cette contact ?<br />
          <b>
            {record.fullname} ({record.email})
          </b>
        </>
      ),
      okText: record.active ? 'Désactiver' : 'Activer',
      okType: record.active ? 'danger' : 'primary',
      cancelText: 'Annuler',
      onOk: () => props.updateClientContact({ ...record, active: !record.active })
    });
  };

  const handleDeleteAction = (record: IClientContact) => {
    Modal.confirm({
      title: "Suppression d'une contact",
      content: (
        <>
          Êtes-vous sûr de supprimer cette contact ?<br />
          <b>
            {record.fullname} ({record.email})
          </b>
        </>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => props.deleteClientContact(record.id)
    });
  };

  const handleAddAction = () => setUpdateEntity({ clientId: client.id, active: true });

  const handleHideModal = () => setUpdateEntity(null);

  const onChange = (pagination, filters, sorter) => {
    if (sorter.order) {
      loadData(sorter.field, sorter.order === 'descend' ? 'desc' : 'asc');
    } else {
      loadData();
    }
  };

  const handleRefreshAction = () => loadData();

  const columns: Array<ColumnProps<IClientContact>> = [
    { title: 'Nom et Prénom', dataIndex: 'fullname', render: renderFullName, sorter: true },
    { title: 'Numéro de téléphone', dataIndex: 'phoneNumber', render: renderPhoneNumber, sorter: true },
    { title: 'Status', dataIndex: 'active', render: renderActivated, sorter: true },
    { title: <Icon type="setting" title="Actions" />, dataIndex: 'id', width: 96, align: 'center', render: renderRecordActions }
  ];

  return (
    <div className="table-layout-page">
      <div className="table-layout-head">
        <PageHead
          title="La liste des contacts"
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
          dataSource={[...contacts]}
          pagination={false}
          loading={loading}
          rowClassName={rowClassName}
          onChange={onChange}
          size="middle"
        />
      </div>
      <ClientContactsFormModal visible={updateEntity !== null} clientContact={updateEntity} onClose={handleHideModal} />
    </div>
  );
};

const mapStateToProps = ({ client, clientContact }: IRootState) => ({
  client: client.entity,
  contacts: clientContact.entities,
  loading: clientContact.loading,
  updateSuccess: clientContact.updateSuccess
});

const mapDispatchToProps = {
  deleteClientContact: ClientContactExt.deleteClientContact,
  getClientContactsByClientIds: ClientContactExt.getClientContactsByClientIds,
  updateClientContact: ClientContactExt.updateClientContact
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ClientContactsList);
