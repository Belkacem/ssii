import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps } from 'react-router-dom';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import * as Invoice from 'app/application/entities/invoice/invoice.actions';
import moment from 'moment';
import { Button, Col, Row } from 'antd';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { IInvoice, InvoiceStatus, InvoiceType } from 'app/shared/model/invoice.model';
import { DEFAULT_TVA_KEY, FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import * as Client from 'app/application/entities/client/client.actions';
import * as ProjectExt from 'app/application/entities/project/project.actions';
import SelectField from 'app/application/components/zsoft-form/generic-fields/selectField.component';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import { InvoiceItemsForm } from 'app/application/modules/invoices/invoice-create/invoice-items-form';

interface IInvoicesCreateProps extends StateProps, DispatchProps, RouteComponentProps {}

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
    .nullable(true)
});

const InvoicesCreate: FunctionComponent<IInvoicesCreateProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const initValues: IInvoice = {
    number: '1',
    nettingId: null,
    projectId: null,
    companyId: null,
    activityReportId: null,
    clientId: null,
    dueDate: null,
    issueDate: moment(),
    status: InvoiceStatus.DRAFT,
    type: InvoiceType.INVOICE,
    items: []
  };
  const default_tva = props.constants.find(constant => constant.key === DEFAULT_TVA_KEY);

  useEffect(() => {
    props.getClients(0, 999, 'name,asc');
    props.getProjects(0, 999, 'nom,asc');
  }, []);

  useEffect(
    () => {
      if (props.updateSuccess) {
        props.history.push(`/app/company/invoices/${props.invoice.id}`);
      }
    },
    [props.updateSuccess]
  );

  const handleSave = values => {
    const today: any = moment(values.issueDate).format(FORMAT_DATE_SERVER);
    values.items.map(item => {
      item.date = item.date ? item.date : today;
    });
    values.companyId = props.company.id;
    props.createInvoice(values);
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
      const client = props.clients.find(c => c.id === clientId);
      if (client && formikRef.current.state.values.issueDate && client.paymentDelay) {
        const dueDate = moment(formikRef.current.state.values.issueDate).add(client.paymentDelay, 'days');
        formikRef.current.setFieldValue('dueDate', dueDate);
      }
    }
  };

  const { clients, projects, updating } = props;
  return (
    <Formik ref={formikRef} initialValues={initValues} validationSchema={validationSchema} onSubmit={handleSave}>
      {formProps => (
        <Form className="fullwidth">
          <PageHead
            title="Nouvelle facture"
            onBack="/app/company/invoices"
            backOnlyMobile
            actions={
              <>
                <Button type="primary" htmlType="submit" icon="save" className="ant-btn-textual" loading={updating}>
                  <span>Sauvegarder</span>
                </Button>
              </>
            }
          />
          <Row style={{ padding: '0 16px' }}>
            <Col md={12}>
              <SelectField
                label="Projet"
                name="projectId"
                onChange={handleProjectChange}
                options={projects.map(project => ({
                  label: project.nom,
                  value: project.id
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
                options={clients.map(client => ({
                  label: client.name,
                  value: client.id
                }))}
                layout="horizontal"
                disabled={!!formProps.values.projectId}
              />
            </Col>
            <Col md={12}>
              <DateField label="Date" name="issueDate" layout="horizontal" />
            </Col>
            <Col md={12}>
              <DateField label="Due date" name="dueDate" layout="horizontal" />
            </Col>
          </Row>
          <InvoiceItemsForm formProps={formProps} defaultTax={parseInt(default_tva.value, 10)} loading={false} />
        </Form>
      )}
    </Formik>
  );
};

const mapStateToProps = ({ application, client, invoice, invoiceItem, project, constant }: IRootState) => ({
  company: application.company.current,
  invoice: invoice.entity,
  updating: invoice.updating,
  updateSuccess: invoiceItem.updateSuccess,
  projects: project.entities,
  clients: client.entities,
  constants: constant.entities
});

const mapDispatchToProps = {
  createInvoice: Invoice.create,
  getClients: Client.getClients,
  getProjects: ProjectExt.getProjects
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(InvoicesCreate);
