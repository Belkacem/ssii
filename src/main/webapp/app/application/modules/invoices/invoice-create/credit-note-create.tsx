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
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';
import { CreditNoteHead } from 'app/application/modules/invoices/invoice-details/credit.note.head';
import { InvoiceItemsForm } from 'app/application/modules/invoices/invoice-create/invoice-items-form';

interface ICreditNoteCreateProps extends StateProps, DispatchProps, RouteComponentProps<{ invoice_id }> {}

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
  issueDate: Yup.date()
    .label("Date d'émission")
    .required()
    .nullable(true),
  dueDate: Yup.date()
    .label('Due date')
    .required()
    .nullable(true)
});

const CreditNoteCreate: FunctionComponent<ICreditNoteCreateProps> = props => {
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
    type: InvoiceType.CREDIT_NOTE,
    items: []
  };
  const default_tva = props.constants.find(constant => constant.key === DEFAULT_TVA_KEY);

  useEffect(
    () => {
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

  useEffect(
    () => {
      if (props.invoice) {
        if (formikRef.current) {
          const { invoice } = props;
          const values = {
            ...formikRef.current.state.values,
            nettingId: invoice.id,
            projectId: invoice.projectId,
            companyId: invoice.companyId,
            activityReportId: invoice.activityReportId,
            clientId: invoice.clientId,
            issueDate: moment(invoice.issueDate),
            dueDate: moment(invoice.dueDate)
          };
          formikRef.current.setValues(values);
          // formikRef.current.state.values = values;
        }
      }
    },
    [props.invoice]
  );

  const handleGoBack = () => props.history.goBack();

  const handleSave = values => {
    const today: any = moment(values.issueDate).format(FORMAT_DATE_SERVER);
    values.items.map(item => {
      item.date = item.date ? item.date : today;
    });
    props.createInvoice(values);
  };

  return (
    <Formik ref={formikRef} initialValues={initValues} validationSchema={validationSchema} onSubmit={handleSave}>
      {formProps => (
        <Form className="fullwidth">
          <PageHead
            title="Création d'une facture d'avoir"
            onBack={handleGoBack}
            margin={false}
            actions={
              <>
                <Button type="primary" htmlType="submit" icon="save" className="ant-btn-textual" loading={props.updating}>
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
            <Col md={12}>
              <DateField label="Date" name="issueDate" layout="horizontal" />
            </Col>
            <Col md={12}>{formProps.values.issueDate && <DateField label="Due date" name="dueDate" layout="horizontal" />}</Col>
          </Row>
          <InvoiceItemsForm formProps={formProps} defaultTax={parseInt(default_tva.value, 10)} loading={false} />
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
  loadingInvoice: invoice.loading,
  updating: invoice.updating,
  updateSuccess: invoiceItem.updateSuccess,
  resource: resource.entity,
  loadingResource: resource.loading,
  project: project.entity,
  loadingProject: project.loading,
  client: client.entity,
  loadingClient: client.loading,
  activityReport: activityReport.entity,
  loadingActivityReport: activityReport.loading,
  projectResourceInfos: projectResourceInfo.entities,
  loadingProjectResourceInfo: projectResourceInfo.loading,
  constants: constant.entities
});

const mapDispatchToProps = {
  getInvoice: Invoice.getInvoice,
  createInvoice: Invoice.create
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(CreditNoteCreate);
