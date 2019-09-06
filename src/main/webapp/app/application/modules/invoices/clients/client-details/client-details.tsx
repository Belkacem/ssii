import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Alert, Button, Divider, Icon, Modal, Skeleton, Tabs } from 'antd';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import ClientsModal from 'app/application/modules/invoices/clients/client-form/client-form';
import * as Client from 'app/entities/client/client.reducer';
import IBAN from 'iban';
import InvoicesList from 'app/application/modules/invoices/invoice-lists/invoices-list-per-client';
import InvoicesDetails from 'app/application/modules/invoices/invoice-details/invoice-details';
import ClientContactsList from 'app/application/modules/invoices/clients/client-contacts/client-contacts-list';
import CreditNoteCreate from 'app/application/modules/invoices/invoice-create/credit-note-create';
import InvoicesUpdate from 'app/application/modules/invoices/invoice-update/invoices-update';
import { sirenFormatter } from 'app/application/components/zsoft-form/custom-fields/sirenField.component';
import { tvaFormatter } from 'app/application/components/zsoft-form/custom-fields/tvaField.component';
import pathToRegexp from 'path-to-regexp';

interface IClientsDetailsProps extends StateProps, DispatchProps, RouteComponentProps<{ client_id; tab }> {}

const ClientsDetails: FunctionComponent<IClientsDetailsProps> = props => {
  const [showUpdate, setShowUpdate] = useState(-1);
  const [activeTab, setActiveTab] = useState('about');
  const [deleteClient, setDeleteClient] = useState(false);
  const { client, loading, errorMessage } = props;

  useEffect(
    () => {
      if (!!props.match.params.client_id) {
        props.getClient(props.match.params.client_id);
      }
    },
    [props.match.params.client_id]
  );

  useEffect(
    () => {
      if (!!props.match.params.tab) {
        setActiveTab(props.match.params.tab);
      }
    },
    [props.match.params.tab]
  );

  useEffect(
    () => {
      if (deleteClient) {
        props.deleteClient(client.id);
      }
    },
    [deleteClient]
  );

  const handleUpdateAction = () => setShowUpdate(0);

  const handleUpdateIbanAction = () => setShowUpdate(3);

  const handleHideModal = () => setShowUpdate(-1);

  const handleChangeTab = (tab: string) => {
    if (tab !== props.match.params.tab) {
      const toPath = pathToRegexp.compile(props.match.path);
      props.history.push(toPath({ tab, client_id: props.match.params.client_id }));
    }
  };

  const handleDeleteAction = () => {
    Modal.confirm({
      title: "Suppression d'un client",
      content: (
        <span>
          Êtes-vous sûr de supprimer ce client ?<br />
          <b>
            {client.form} {client.name}
          </b>
        </span>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        setDeleteClient(true);
      }
    });
  };
  if (loading && !client.id) {
    return (
      <div className="padding-3rem">
        <Skeleton active avatar />
      </div>
    );
  }
  if (!loading && !client.id && errorMessage) {
    return (
      <div className="padding-3rem">
        <Alert message="Erreur" description="Client non trouvé !" type="error" showIcon />
      </div>
    );
  }
  return (
    <div className="page-layout" style={{ height: '100%' }}>
      <PageHead
        title={client.form + ' - ' + client.name}
        onBack="/app/company/clients"
        backOnlyMobile
        actions={
          <>
            <Button onClick={handleUpdateAction} title="Modifier ce client" icon="edit" type="primary" className="ant-btn-textual">
              <span>Modifier</span>
            </Button>
            <Button onClick={handleDeleteAction} title="Supprimer ce client" icon="delete" type="danger" className="ant-btn-textual">
              <span>Supprimer</span>
            </Button>
          </>
        }
        margin={false}
      />
      <div className="page-content">
        <Tabs activeKey={activeTab} onTabClick={handleChangeTab} size="small" tabBarGutter={16} animated={{ inkBar: false, tabPane: true }}>
          <Tabs.TabPane
            key="about"
            tab={
              <small>
                <Icon type="info-circle" /> À propos
              </small>
            }
          >
            <div>
              {(!client.iban || !client.bic) && (
                <a onClick={handleUpdateIbanAction}>
                  <Alert
                    message={
                      <small>
                        le profil de "{client.form} {client.name}" non complété: les coordonnées bancaires manquantes !
                      </small>
                    }
                    type="warning"
                    banner
                    style={{ marginTop: -16 }}
                  />
                </a>
              )}
            </div>
            <div style={{ padding: '0 16px 32px 16px' }}>
              <Divider orientation="left" dashed>
                À propos du client
              </Divider>
              <dl className="jh-entity-details">
                <dt>Nom</dt>
                <dd>
                  {client.form} {client.name}
                </dd>
                <dt>Numéro SIREN</dt>
                <dd>{sirenFormatter(client.siren)}</dd>
                <dt>Numéro de TVA</dt>
                <dd>{tvaFormatter(client.tva)}</dd>
                <dt>E-mail</dt>
                <dd>
                  <a href={`mailto:${client.email}`}>{client.email}</a>
                </dd>
                <dt>Délai de paiement</dt>
                <dd>
                  {client.paymentDelay} <sup>jour</sup>
                </dd>
                {client.reference && (
                  <>
                    <dt>Référence</dt>
                    <dd>{client.reference}</dd>
                  </>
                )}
              </dl>
              <Divider orientation="left" dashed>
                Adresse du client
              </Divider>
              <dl className="jh-entity-details">
                <dt>Adresse Ligne 1</dt>
                <dd>{client.addressLine1}</dd>
                <dt>Adresse Ligne 2</dt>
                <dd>{client.addressLine2}</dd>
                <dt>Ville</dt>
                <dd>{client.city}</dd>
                <dt>Code postal</dt>
                <dd>{client.postalCode}</dd>
                <dt>Pays</dt>
                <dd>{client.country}</dd>
              </dl>
              {client.iban && (
                <>
                  <Divider orientation="left" dashed>
                    Coordonnées bancaires
                  </Divider>
                  <dl className="jh-entity-details">
                    <dt>Titulaire du compte</dt>
                    <dd>
                      {client.form} {client.name}
                    </dd>
                    <dt>RIB</dt>
                    <dd>{IBAN.toBBAN(client.iban)}</dd>
                    <dt>IBAN</dt>
                    <dd>{IBAN.printFormat(client.iban, ' ')}</dd>
                    {client.bic && (
                      <>
                        <dt>BIC</dt>
                        <dd>{client.bic}</dd>
                      </>
                    )}
                  </dl>
                </>
              )}
              {client.attachActivityReports && (
                <>
                  <Divider orientation="left" dashed>
                    E-mails des factures
                  </Divider>
                  <dl className="jh-entity-details">
                    <dt>Rapport d'activité</dt>
                    <dd>joindre le rapport d'activité aux e-mails de factures</dd>
                  </dl>
                </>
              )}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane
            key="contacts"
            tab={
              <small>
                <Icon type="contacts" /> Contacts
              </small>
            }
          >
            <Switch>
              <Route path="/app/company/clients/details/:client_id" component={ClientContactsList} />
            </Switch>
          </Tabs.TabPane>
          <Tabs.TabPane
            key="invoices"
            tab={
              <small>
                <Icon type="file-text" /> Factures
              </small>
            }
          >
            <Switch>
              <Route path="/app/company/clients/details/:client_id/invoices/credit-note/create/:invoice_id" component={CreditNoteCreate} />
              <Route path="/app/company/clients/details/:client_id/invoices/update/:invoice_id" component={InvoicesUpdate} />
              <Route path="/app/company/clients/details/:client_id/invoices/:invoice_id" component={InvoicesDetails} />
              <Route path="/app/company/clients/details/:client_id" component={InvoicesList} />
            </Switch>
          </Tabs.TabPane>
        </Tabs>
      </div>
      <ClientsModal showModal={showUpdate !== -1} step={showUpdate} handleClose={handleHideModal} clientEntity={client} />
    </div>
  );
};

const mapStateToProps = ({ client }: IRootState) => ({
  client: client.entity,
  loading: client.loading,
  updateSuccess: client.updateSuccess,
  errorMessage: client.errorMessage
});

const mapDispatchToProps = {
  deleteClient: Client.deleteEntity,
  getClient: Client.getEntity
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ClientsDetails);
