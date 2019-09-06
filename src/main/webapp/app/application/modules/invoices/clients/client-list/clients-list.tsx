import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Link, Route, RouteComponentProps, Switch } from 'react-router-dom';
import * as Client_ext from 'app/application/entities/client/client.actions';
import * as Client from 'app/entities/client/client.reducer';
import ClientsModal from 'app/application/modules/invoices/clients/client-form/client-form';
import { Button, Empty, Icon } from 'antd';
import List from 'app/application/components/list/list.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import ClientsDetails from '../client-details/client-details';
import { IClient } from 'app/shared/model/client.model';

interface IClientsListProps extends StateProps, DispatchProps, RouteComponentProps<{ client_id }> {}

const UseSelectedClient = (clientIdParam: string): string => {
  const [selected, setSelected] = useState(null);
  useEffect(
    () => {
      if (!!clientIdParam && clientIdParam.length > 8) {
        setSelected(clientIdParam.substring(8));
      } else {
        setSelected(null);
      }
    },
    [clientIdParam]
  );
  return selected;
};

const ClientsList: FunctionComponent<IClientsListProps> = props => {
  const listRef: RefObject<List> = useRef<List>();
  const [updateEntity, setUpdateEntity] = useState<IClient>(undefined);
  const { totalItems, loading, clientList } = props;
  const selected = UseSelectedClient(props.match.params.client_id);

  useEffect(
    () => {
      if (props.updateSuccess) {
        listRef.current.reload();
      }
    },
    [props.updateSuccess]
  );

  useEffect(
    () => {
      if (props.match.params[0] === 'add') {
        handleAddAction();
      }
    },
    [props.match.params]
  );

  useEffect(
    () => {
      if (clientList.length > 0) {
        listRef.current.pushData(clientList);
      }
    },
    [clientList]
  );

  const getEntities = (activePage, itemsPerPage, sort, order) => {
    props.getClients(activePage - 1, itemsPerPage, `${sort},${order}`);
  };

  const renderRecord = (client: IClient) => (
    <div className="resource-meta">
      <Avatar name={client.name} size={28} />
      <div className="meta-content">
        <span className="meta-title">{client.name}</span>
        <span className="meta-description">{client.email}</span>
      </div>
    </div>
  );

  const handleAddAction = () => setUpdateEntity({ paymentDelay: 30, attachActivityReports: false });

  const handleHideModal = () => {
    if (props.match.params[0] === 'add') {
      setUpdateEntity(undefined);
      props.history.push('/app/company/clients');
    } else {
      setUpdateEntity(undefined);
    }
  };

  const handleDetailsAction = (client: IClient) => props.history.push(`/app/company/clients/details/${client.id}`);

  const handleFilterClients = (dataSource, searchText) => {
    const reg = new RegExp(searchText, 'gi');
    return dataSource.filter(client => {
      const matchName = client.name.match(reg);
      const matchEmail = client.email.match(reg);
      const matchSiren = client.siren.match(reg);
      return matchName || matchEmail || matchSiren;
    });
  };

  const header = (
    <PageHead
      title="Clients"
      margin={false}
      actions={<Button title="Ajouter un client" type="primary" icon="plus" onClick={handleAddAction} />}
    />
  );

  return (
    <>
      <List
        ref={listRef}
        rowKey="id"
        totalItems={totalItems}
        renderItem={renderRecord}
        fetchData={getEntities}
        loading={loading}
        placeholder="Rechercher par nom ..."
        searchHelper={
          <small>
            Filtrer avec: <b>Nom de client</b>, <b>Email</b> ou <b>Numéro SIREN</b>
          </small>
        }
        onClick={handleDetailsAction}
        onFilter={handleFilterClients}
        selectedItem={selected}
        hasSelectedItem={!props.match.isExact || !!selected}
        header={header}
        sort="name"
      >
        <Switch>
          <Route path="/app/company/clients/details/:client_id/:tab?" component={ClientsDetails} />
          <>
            <Empty description="Aucun client trouvé !" style={{ paddingTop: '5rem' }}>
              <Button type="primary">
                <Link to="/app/company/clients/add">
                  <Icon type="plus" /> Ajouter un client
                </Link>
              </Button>
            </Empty>
          </>
        </Switch>
      </List>
      <ClientsModal showModal={!!updateEntity} handleClose={handleHideModal} clientEntity={updateEntity} />
    </>
  );
};

const mapStateToProps = ({ client }: IRootState) => ({
  clientList: client.entities,
  totalItems: client.totalItems,
  loading: client.loading,
  updating: client.updating,
  updateSuccess: client.updateSuccess
});

const mapDispatchToProps = {
  getClients: Client_ext.getClients,
  deleteClient: Client.deleteEntity
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ClientsList);
