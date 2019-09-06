import React, { CSSProperties, FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import * as Invoice from 'app/application/entities/invoice/invoice.actions';
import * as InvoiceFile from 'app/application/entities/invoice-file/invoice-file.actions';
import { IInvoice } from 'app/shared/model/invoice.model';
import { formatMoney, getInvoiceHtml, getInvoiceName, getInvoiceTotal } from 'app/application/common/utils/invoice-utils';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { InvoiceDetailsStatus } from 'app/application/modules/invoices/invoice-details/invoice-details-status';
import { InvoiceDetailsOverDue } from 'app/application/modules/invoices/invoice-details/invoice-details-overdue';
import { markInvoicesAsPaidModal } from 'app/application/modules/invoices/invoice-update/invoice-mark-as-paid-modal';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { Alert, Button, Col, Icon, Modal, Row, Spin } from 'antd';
import moment from 'moment';
import { FORMAT_DATE_SM, FORMAT_MONTH } from 'app/application/common/config/constants';
import { Printable } from 'app/application/components/printable/printable.component';
import { DateFormat } from 'app/application/components/date.format.component';

interface IInvoiceDetailsProps extends StateProps, DispatchProps, RouteComponentProps<{ invoice_id }> {}

const InvoiceDetails: FunctionComponent<IInvoiceDetailsProps> = props => {
  const printableRef: RefObject<Printable> = useRef<Printable>(null);

  useEffect(
    () => {
      const invoiceId = props.match.params.invoice_id;
      if (!!invoiceId) {
        props.getInvoice(invoiceId);
        props.getInvoiceFile(invoiceId);
      }
    },
    [props.match.params.invoice_id]
  );

  const handleGoBack = () => props.history.goBack();

  const handlePrint = () => printableRef.current.print();

  const handleSendAction = () => {
    Modal.confirm({
      title: 'Envoyer la facture',
      content: 'Est que vous êtes sur de envoyer cette facture au client ?',
      okText: 'Envoyer',
      cancelText: 'Annuler',
      onOk: () => {
        props.sendInvoiceEmail(invoice);
      }
    });
  };

  const handleMarkAsSentAction = () => {
    Modal.confirm({
      title: (
        <>
          Marquer comme <b>Envoyée</b>
        </>
      ),
      content: (
        <>
          Est que vous êtes sur de marquer cette facture comme <b>"Envoyée"</b> ?
        </>
      ),
      okText: 'Confirmer',
      cancelText: 'Annuler',
      onOk: () => {
        props.markAsSent(invoice);
      }
    });
  };

  const handleMarkAsPaidAction = () => {
    markInvoicesAsPaidModal({
      invoices: [invoice],
      onUpdate: (inv: IInvoice) => {
        props.markInvoiceAsPaid(inv);
      }
    });
  };

  const handleDownloadAction = () => props.downloadInvoice(invoice);

  const handleSendReminderAction = () => {
    Modal.confirm({
      title: 'Envoyer un rappel',
      content: 'Est que vous êtes sur de envoyer un rappel au client de cette facture ?',
      okText: 'Envoyer',
      cancelText: 'Annuler',
      onOk: () => {
        props.sendInvoiceReminderEmail(invoice.id);
      }
    });
  };

  const handleDeleteInvoice = () => {
    Modal.confirm({
      title: "Suppression d'un facture",
      content: 'Est que vous êtes sur de supprimer cette facture ?',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        props.deleteInvoice(invoice.id);
      }
    });
  };

  const handleCreateCreditNote = () => props.history.push(`/app/company/invoices/credit-note/create/${invoice.id}?sidebar=menu`);

  const handleUpdateInvoice = () => props.history.push(`/app/company/invoices/update/${invoice.id}?sidebar=menu`);

  const handleOpenActivityReport = () => props.history.push(`/app/company/projects/${project.id}/activity-reports/${activityReport.id}`);

  const handleOpenNettingInvoice = () => props.history.push(`/app/company/invoices/${invoice.nettingId}`);

  const {
    invoice,
    invoiceItems,
    invoiceFile,
    loadingFile,
    sending,
    resource,
    project,
    activityReport,
    company,
    client,
    loading,
    downloading
  } = props;
  const { nettingInvoice, loadingNetting } = props;
  return (
    <div className="fullwidth invoice-details">
      <PageHead
        title={getInvoiceName(invoice)}
        onBack={handleGoBack}
        backOnlyMobile={props.match.path.startsWith('/app/company/invoices')}
        actions={
          <>
            {invoiceFile.file &&
              invoice.status === 'DRAFT' && (
                <Button icon="mail" title="Envoyer la facture" onClick={handleSendAction} className="ant-btn-textual">
                  <span>Envoyer</span>
                </Button>
              )}
            {invoiceFile.file &&
              invoice.status === 'DRAFT' && (
                <Button icon="audit" title="Marquer comme envoyée" onClick={handleMarkAsSentAction} className="ant-btn-textual">
                  <span>Marquer comme envoyée</span>
                </Button>
              )}
            {invoice.status === 'SENT' && (
              <Button icon="euro" title="Marquer comme payée" onClick={handleMarkAsPaidAction} className="ant-btn-textual">
                <span>Payé</span>
              </Button>
            )}
            {invoice.status === 'SENT' && (
              <Button
                icon="bell"
                title="Envoyer un rappel de paiement"
                onClick={handleSendReminderAction}
                className="ant-btn-textual"
                loading={sending}
              >
                <span>Rappel</span>
              </Button>
            )}
            {invoice.status === 'DRAFT' && (
              <Button icon="edit" onClick={handleUpdateInvoice} className="ant-btn-textual">
                <span>Modifier</span>
              </Button>
            )}
            {invoice.status === 'DRAFT' && (
              <Button icon="delete" type="danger" onClick={handleDeleteInvoice} className="ant-btn-textual">
                <span>Supprimer</span>
              </Button>
            )}
            {invoice.status !== 'DRAFT' &&
              !invoice.nettingId && (
                <Button icon="undo" title="Créer une facture d'avoir" onClick={handleCreateCreditNote} className="ant-btn-textual">
                  <span>Facture d'avoir</span>
                </Button>
              )}
          </>
        }
        margin={false}
      />
      <div>
        <Row type="flex" className="info-row">
          <Col lg={8} md={8} sm={12} xs={24}>
            <small>Date d'émission:</small>
            <div>
              <b>
                <DateFormat value={invoice.issueDate} format={FORMAT_DATE_SM} />
              </b>
            </div>
          </Col>
          <Col lg={8} md={8} sm={12} xs={24}>
            <small>L'état de facture :</small>
            <div>
              <b>
                <InvoiceDetailsStatus invoice={invoice} />
                <small>
                  <InvoiceDetailsOverDue invoice={invoice} />
                </small>
              </b>
            </div>
          </Col>
          <Col lg={8} md={8} sm={24} xs={24}>
            <small>Total :</small>
            <div>
              <b>{formatMoney(getInvoiceTotal([...invoiceItems]))}</b>
              <small>€</small>
            </div>
          </Col>
        </Row>
        {resource.id &&
          activityReport.id &&
          project.id && (
            <Alert
              type="warning"
              className="ant-alert-with-open-link"
              closeText={
                <>
                  <Icon type="folder-open" /> Ouvrir
                </>
              }
              onClose={handleOpenActivityReport}
              message={
                <>
                  Facture pour le consultant <b>{getFullName(resource)}</b> rapport d'activité du mois{' '}
                  <b>{moment(activityReport.month).format(FORMAT_MONTH)}</b> pour le projet <b>{project.nom}</b>
                </>
              }
              banner
            />
          )}
        {invoice.nettingId && (
          <Spin spinning={loadingNetting} size="small">
            <Alert
              type="info"
              className="ant-alert-with-open-link"
              closeText={
                <>
                  <Icon type="folder-open" /> Ouvrir
                </>
              }
              onClose={handleOpenNettingInvoice}
              message={<>Facture d'avoir pour la {!!nettingInvoice && getInvoiceName(nettingInvoice)}</>}
              banner
            />
          </Spin>
        )}
        <PageHead
          title={false}
          actions={
            <>
              <Button icon="printer" onClick={handlePrint} className="ant-btn-textual">
                <span>Imprimer</span>
              </Button>
              {invoiceFile.file && (
                <Button icon="download" loading={downloading} onClick={handleDownloadAction} className="ant-btn-textual">
                  <span>Télécharger</span>
                </Button>
              )}
            </>
          }
          margin={false}
          bordered
        />
      </div>
      <div>
        <Printable
          ref={printableRef}
          loading={loading || loadingFile || !invoice.id || !invoiceFile.file || !client.id || !company.id}
          margin="0cm"
          loadStyle={false}
        >
          <div dangerouslySetInnerHTML={{ __html: getInvoiceHtml(invoiceFile) }} style={{ height: '100%' }} />
        </Printable>
      </div>
    </div>
  );
};

const mapStateToProps = ({ application, activityReport, client, invoice, invoiceItem, invoiceFile, resource, project }: IRootState) => ({
  invoice: invoice.entity,
  loading: invoice.loading,
  nettingInvoice: application.invoice.netting,
  loadingNetting: application.invoice.loadingNetting,
  sending: application.invoice.sending,
  downloading: application.invoice.downloading,
  invoiceItems: invoiceItem.entities,
  resource: resource.entity,
  project: project.entity,
  activityReport: activityReport.entity,
  company: application.company.current,
  client: client.entity,
  invoiceFile: invoiceFile.entity,
  loadingFile: invoiceFile.loading
});

const mapDispatchToProps = {
  getInvoice: Invoice.getInvoice,
  getInvoiceFile: InvoiceFile.getByInvoiceId,
  markInvoiceAsPaid: Invoice.markAsPaid,
  sendInvoiceEmail: Invoice.sendEmail,
  sendInvoiceReminderEmail: Invoice.sendReminderEmail,
  downloadInvoice: Invoice.download,
  deleteInvoice: Invoice.deleteInvoice,
  markAsSent: Invoice.markAsSent
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(InvoiceDetails));
