import React, { FunctionComponent, RefObject, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { IClientContact } from 'app/shared/model/client-contact.model';
import * as ClientContactExt from 'app/application/entities/client-contact/client-contact.actions';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import CheckboxField from 'app/application/components/zsoft-form/generic-fields/checkboxField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';
import PhoneNumberField, { isValidPhoneNumber } from 'app/application/components/zsoft-form/custom-fields/phoneField.component';
import { Modal } from 'antd';

interface IClientContactsFormModalProps extends StateProps, DispatchProps {
  visible: boolean;
  onClose: () => void;
  clientContact: IClientContact;
}

const validationSchema = Yup.object().shape({
  fullname: Yup.string()
    .label('Nom et Prénom')
    .matches(/^([a-zA-Z'-.]+ ([a-zA-Z'-.]+)+(?: [a-zA-Z'-.]+)?)$/, "Le nom complet n'est pas valide !")
    .required(),
  email: Yup.string()
    .label('E-mail')
    .email()
    .required(),
  phoneNumber: Yup.string()
    .label('Numéro de téléphone')
    .test(
      'valid-phone',
      'Le numéro Téléphone composé de 9 chiffres, ex: +33 1 23 45 67 89',
      value => !value || value === '' || (value && isValidPhoneNumber(value))
    )
    .nullable(true),
  active: Yup.boolean().label('Active')
});

const ClientContactsFormModal: FunctionComponent<IClientContactsFormModalProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { updating, clientContact, visible = false } = props;
  const isNew = !clientContact || !clientContact.id;

  useEffect(() => {
    if (isNew) {
      props.resetClientContact();
    }
  }, []);

  useEffect(
    () => {
      if (props.updateSuccess) {
        props.onClose();
      }
    },
    [props.updateSuccess]
  );

  const handleSave = values => {
    if (isNew) {
      const payload = {
        ...clientContact,
        fullname: values.fullname,
        email: values.email,
        phoneNumber: values.phoneNumber
      };
      props.createClientContact(payload);
    } else {
      const payload = {
        ...clientContact,
        active: values.active,
        fullname: values.fullname,
        email: values.email,
        phoneNumber: values.phoneNumber
      };
      props.updateClientContact(payload);
    }
  };

  const handleSubmit = () => formikRef.current.submitForm();

  return (
    <Modal
      visible={visible}
      onCancel={props.onClose}
      onOk={handleSubmit}
      okButtonProps={{ loading: updating }}
      cancelText="Annuler"
      okText="Sauvegarder"
      title={isNew ? 'Ajouter une contact' : 'Modifier une contact'}
      maskClosable={false}
      destroyOnClose
    >
      <Formik ref={formikRef} initialValues={clientContact} enableReinitialize validationSchema={validationSchema} onSubmit={handleSave}>
        <Form>
          <TextField label="Nom et Prénom" name="fullname" layout="horizontal" autoFocus />
          <TextField label="Adresse Email" name="email" layout="horizontal" />
          <PhoneNumberField name="phoneNumber" label="N° Téléphone" layout="horizontal" />
          {!isNew && (
            <CheckboxField
              label="Active"
              helper="Activation d'envoi des e-mails et notifications"
              name="active"
              optionLabel="Oui"
              layout="horizontal"
            />
          )}
        </Form>
      </Formik>
    </Modal>
  );
};

const mapStateToProps = ({ clientContact }: IRootState) => ({
  updating: clientContact.updating,
  updateSuccess: clientContact.updateSuccess
});

const mapDispatchToProps = {
  createClientContact: ClientContactExt.createClientContact,
  updateClientContact: ClientContactExt.updateClientContact,
  resetClientContact: ClientContactExt.resetClientContact
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ClientContactsFormModal);
