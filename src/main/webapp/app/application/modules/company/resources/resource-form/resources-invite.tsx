import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Modal } from 'antd';
import EmailsField from 'app/application/components/zsoft-form/custom-fields/emailsField.component';

interface IResourcesInviteProps extends StateProps, DispatchProps {
  show?: boolean;
  onClose?: Function;
}

/* tslint:disable:no-invalid-template-strings */
const getValidationSchema = (existedEmail: string) =>
  Yup.object().shape({
    emails: Yup.array()
      .of(
        Yup.string()
          .label('Adresse Email')
          .email('"${value}" ce n\'est pas une adresse email correcte ! ')
          .required()
      )
      .label('La liste des Adresse Email')
      .min(1)
      .test('emailexists', `Email "${existedEmail}" déjà utilisé !`, () => Promise.resolve(existedEmail === null))
  });

const ResourcesInvite: FunctionComponent<IResourcesInviteProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>();
  const [inviting, setInviting] = useState(false);
  const [emailExistError, setEmailExistError] = useState(null);
  const [emailsList, setEmailsList] = useState([]);

  useEffect(
    () => {
      if (formikRef.current) {
        if (inviting) {
          setEmailsList(formikRef.current.state.values.emails);
        } else {
          if (!emailExistError) {
            setEmailsList([]);
            handleClose();
          }
        }
      }
    },
    [inviting]
  );

  useEffect(
    () => {
      if (formikRef.current) {
        formikRef.current.setFieldValue('emails', emailsList);
        if (emailsList.length > 0) {
          props.inviteResource(emailsList[0]);
        }
      }
    },
    [emailsList]
  );

  useEffect(
    () => {
      if (formikRef.current) {
        if (props.updateSuccess && inviting) {
          if (emailsList.length > 1) {
            const emails = [...emailsList].slice(1);
            setEmailsList(emails);
          } else {
            setInviting(false);
          }
        }
      }
    },
    [props.updateSuccess]
  );

  useEffect(
    () => {
      if (props.errorMessage && formikRef.current) {
        if (props.errorMessage.response.data.errorKey === 'emailexists') {
          formikRef.current.setFieldTouched('email');
          setEmailExistError(emailsList[0]);
        }
      }
    },
    [props.errorMessage]
  );

  useEffect(
    () => {
      if (!!emailExistError) {
        setInviting(false);
      }
    },
    [emailExistError]
  );

  const handleInvite = () => setInviting(true);

  const handleClose = () => props.onClose();

  const emailChanged = (emails: string[]) => {
    formikRef.current.setFieldValue('emails', emails);
    setEmailExistError(null);
  };

  const handleSubmit = () => formikRef.current.submitForm();

  return (
    <Modal
      title="Inviter des ressources"
      visible={props.show}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose} type="default">
          Annuler
        </Button>,
        <Button key="submit" onClick={handleSubmit} type="primary" loading={inviting}>
          Inviter
        </Button>
      ]}
      bodyStyle={{ padding: '0 24px' }}
      maskClosable={false}
      destroyOnClose
    >
      <Formik
        ref={formikRef}
        initialValues={{ emails: [] }}
        enableReinitialize
        validationSchema={getValidationSchema(emailExistError)}
        onSubmit={handleInvite}
      >
        {formProps => (
          <Form>
            <EmailsField
              label="Liste des adresses e-mail"
              helper="Liste des adresses e-mail séparées par virgule ou point-virgule"
              name="emails"
              onChange={emailChanged}
              autoFocus
              domainNames={[props.company.domainName || window.location.hostname]}
              value={formProps.values.emails}
              loading={inviting}
            />
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

const mapStateToProps = ({ resource, application }: IRootState) => ({
  updating: resource.updating,
  updateSuccess: resource.updateSuccess,
  errorMessage: resource.errorMessage,
  company: application.company.current
});

const mapDispatchToProps = {
  inviteResource: ResourceExt.invite
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourcesInvite);
