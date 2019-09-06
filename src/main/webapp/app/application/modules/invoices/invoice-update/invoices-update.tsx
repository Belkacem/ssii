import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import * as Invoice from 'app/entities/invoice/invoice.reducer';
import * as InvoiceItem from 'app/entities/invoice-item/invoice-item.reducer';
import * as InvoiceExt from 'app/application/entities/invoice/invoice.actions';
import { getInvoiceName } from 'app/application/common/utils/invoice-utils';
import moment from 'moment';
import { Alert, Button, Col, Row } from 'antd';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { InvoiceStatus } from 'app/shared/model/invoice.model';
import { DEFAULT_TVA_KEY, FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import * as Client from 'app/application/entities/client/client.actions';
import * as ProjectExt from 'app/application/entities/project/project.actions';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import { InvoiceItemsForm } from 'app/application/modules/invoices/invoice-create/invoice-items-form';
import { CreditNoteHead } from 'app/application/modules/invoices/invoice-details/credit.note.head';

interface IInvoicesUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ invoice_id }> {}

const validationSchema = Yup.object().shape({
  items: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .label('Désignation')
          .required(),
        description: Yup.string()
          .label('Description')
          .nullable(true),
        date: Yup.date()
          .label('Date')
          .required(),
        quantity: Yup.number()
          .label('Quantité')
          .required(),
        unitPrice: Yup.number()
          .label('Prix Unitaire (HT)')
          .required(),
        tax: Yup.number()
          .label('TVA')
          .required()
          .min(0)
          .max(100)
      })
    )
    .label('Les éléments de la facture')
    .min(1, "S'il vous plaît ajouter au moins un élément à la facture")
    .required(),
  clientId: Yup.number()
    .label('Client')
    .required()
    .nullable(true),
  projectId: Yup.number()
    .label('Projet')
    .nullable(true),
  issueDate: Yup.date()
    .label("Date d'émission")
    .required()
    .nullable(true),
  dueDate: Yup.date()
    .label('Due date')
    .required()
    .nullable(true),
  paymentDate: Yup.date()
    .label('Date de paiement')
    .nullable(true)
});

const InvoicesUpdate: FunctionComponent<IInvoicesUpdateProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { invoice, invoiceItems, clients, projects, updating, itemsLoading, loading } = props;
  const default_tva = props.constants.find(constant => constant.key === DEFAULT_TVA_KEY);

  useEffect(
    () => {
      props.resetInvoice();
      props.resetInvoiceItems();
      props.getClients(0, 999, 'name,asc');
      props.getProjects(0, 999, 'nom,asc');
      props.getInvoice(props.match.params.invoice_id);
    },
    [props.match.params.invoice_id]
  );

  useEffect(
    () => {
      if (props.updateSuccess) {
        props.history.push(`/app/company/invoices/${props.invoice.id}`);
      }
    },
    [props.updateSuccess]
  );

  const handleGoBack = () => props.history.goBack();

  const handleSave = values => {
    const deletedItems = props.invoiceItems.map(item => item.id);
    values.items.map(item => {
      item.date = typeof item.date === 'string' ? item.date : item.date.format(FORMAT_DATE_SERVER);
    });
    props.updateInvoice(values, deletedItems);
  };

  const handleProjectChange = projectId => {
    formikRef.current.setFieldValue('projectId', projectId);
    if (!!projectId) {
      const selectedProject = props.projects.find(p => p.id === projectId);
      handleClientChange(selectedProject.clientId);
    } else {
      handleClientChange(null);
    }
  };

  const handleClientChange = clientId => {
    formikRef.current.setFieldValue('clientId', clientId);
    if (!!clientId) {
      const selectedClient = props.clients.find(c => c.id === clientId);
      if (selectedClient && formikRef.current.state.values.issueDate && selectedClient.paymentDelay) {
        const dueDate = moment(formikRef.current.state.values.issueDate).add(selectedClient.paymentDelay, 'days');
        formikRef.current.setFieldValue('dueDate', dueDate);
      }
    }
  };

  if (invoice.id && invoice.status !== InvoiceStatus.DRAFT) {
    return (
      <div className="padding-3rem">
        <Alert message="Erreur" description="Vous n'êtes pas autorisé à accéder à cette page. !" type="error" showIcon />
      </div>
    );
  }
  return (
    <Formik
      ref={formikRef}
      initialValues={{ ...invoice, items: invoiceItems }}
      validationSchema={validationSchema}
      onSubmit={handleSave}
      enableReinitialize
    >
      {formProps => (
        <Form className="fullwidth">
          <PageHead
            title={`Modification du ${invoice.id ? getInvoiceName(invoice) : 'facture'}`}
            onBack={handleGoBack}
            margin={false}
            actions={
              <>
                <Button type="primary" htmlType="submit" icon="save" className="ant-btn-textual" loading={updating}>
                  <span>Sauvegarder</span>
                </Button>
              </>
            }
          />
          <CreditNoteHead
            invoice={props.invoice}
            loading={props.loadingInvoice}
            client={props.client}
            loadingClient={props.loadingClient}
            project={props.project}
            loadingProject={props.loadingProject}
            activityReport={props.activityReport}
            loadingActivityReport={props.loadingActivityReport}
            resource={props.resource}
            loadingResource={props.loadingResource}
            projectResourceInfos={props.projectResourceInfos}
            loadingProjectResourceInfo={props.loadingProjectResourceInfo}
          />
          <Row style={{ padding: '0 16px' }}>
            {!invoice.activityReportId && (
              <>
                <Col md={12}>
                  <SelectField
                    label="Projet"
                    name="projectId"
                    onChange={handleProjectChange}
                    options={projects.map(p => ({
                      label: p.nom,
                      value: p.id
                    }))}
                    layout="horizontal"
                    allowClear
                  />
                </Col>
                <Col md={12}>
                  <SelectField
                    label="Client"
                    name="clientId"
                    onChange={handleClientChange}
                    options={clients.map(c => ({
                      label: c.name,
                      value: c.id
                    }))}
                    layout="horizontal"
                    disabled={!!formProps.values.projectId}
                  />
                </Col>
              </>
            )}
            <Col md={12}>
              <DateField label="Date" name="issueDate" layout="horizontal" />
            </Col>
            <Col md={12}>
              <DateField label="Due date" name="dueDate" layout="horizontal" />
            </Col>
          </Row>
          {invoice.status === InvoiceStatus.PAID && (
            <Row style={{ padding: '0 16px' }}>
              <Col md={12}>
                <DateField label="Date de paiement" name="paymentDate" layout="horizontal" />
              </Col>
            </Row>
          )}
          <InvoiceItemsForm formProps={formProps} defaultTax={parseInt(default_tva.value, 10)} loading={itemsLoading || loading} />
        </Form>
      )}
    </Formik>
  );
};

const mapStateToProps = ({
  resource,
  client,
  invoice,
  invoiceItem,
  project,
  activityReport,
  projectResourceInfo,
  constant
}: IRootState) => ({
  invoice: invoice.entity,
  updating: invoice.updating,
  loadingInvoice: invoice.loading,
  updateSuccess: invoiceItem.updateSuccess,
  loading: invoice.loading,
  itemsLoading: invoiceItem.loading,
  invoiceItems: invoiceItem.entities,
  resource: resource.entity,
  loadingResource: resource.loading,
  project: project.entity,
  projects: project.entities,
  loadingProject: project.loading,
  client: client.entity,
  clients: client.entities,
  loadingClient: client.loading,
  activityReport: activityReport.entity,
  loadingActivityReport: activityReport.loading,
  projectResourceInfos: projectResourceInfo.entities,
  loadingProjectResourceInfo: projectResourceInfo.loading,
  constants: constant.entities
});

const mapDispatchToProps = {
  resetInvoice: Invoice.reset,
  resetInvoiceItems: InvoiceItem.reset,
  getInvoice: InvoiceExt.getInvoice,
  updateInvoice: InvoiceExt.update,
  getClients: Client.getClients,
  getProjects: ProjectExt.getProjects
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(InvoicesUpdate);
