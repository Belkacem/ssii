import React, { RefObject } from 'react';
import { IInvoice, InvoiceStatus } from 'app/shared/model/invoice.model';
import { Divider, Modal } from 'antd';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import DateField from 'app/application/components/zsoft-form/generic-fields/dateField.component';

interface IInvoiceMarkAsPaidModalProps {
  invoices: IInvoice[];
  onUpdate: (invoice: IInvoice) => void;
}

const validationSchema = Yup.object().shape({
  paymentDate: Yup.date()
    .label('Date de paiement')
    .nullable(true)
    .required()
});

export const markInvoicesAsPaidModal = (props: IInvoiceMarkAsPaidModalProps) => {
  const formikRef: RefObject<Formik> = React.createRef<Formik>();
  const { invoices } = props;
  const initialValues = { paymentDate: null };

  const handleSubmit = () => {
    formikRef.current.submitForm();
    return new Promise(() => false);
  };

  const handleSave = values => {
    invoices.map(invoice =>
      props.onUpdate({
        ...invoice,
        status: InvoiceStatus.PAID,
        paymentDate: values.paymentDate
      })
    );
    modalRef.destroy();
  };

  const modalRef = Modal.confirm({
    title: (
      <>
        Marquer comme <b>payée</b>
      </>
    ),
    content: (
      <>
        {invoices.length > 1 ? (
          <>
            Est que vous êtes sur de Marquer ces factures comme <b>"payée"</b> ?
          </>
        ) : (
          <>
            Est que vous êtes sur de Marquer cette facture comme <b>"payée"</b> ?
          </>
        )}
        <Divider />
        <Formik ref={formikRef} initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={handleSave}>
          <Form>
            <DateField label="Date de paiement" name="paymentDate" layout="horizontal" />
          </Form>
        </Formik>
      </>
    ),
    width: 600,
    okText: 'Payée',
    cancelText: 'Annuler',
    onOk: handleSubmit,
    okButtonProps: { loading: false }
  });
};
