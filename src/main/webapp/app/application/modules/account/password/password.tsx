import React, { ChangeEvent, RefObject, useEffect, useRef, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { reset, savePassword } from 'app/modules/account/password/password.reducer';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Button, Col, message, Row } from 'antd';
import { IRootState } from 'app/shared/reducers';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import PasswordField from 'app/application/components/zsoft-form/generic-fields/passwordField.component';

interface IPasswordPage extends DispatchProps, StateProps {}

export const PasswordPage: FunctionComponent<IPasswordPage> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { loading, updateSuccess, updateFailure } = props;
  const saveEntity = values => {
    if (!loading) {
      props.savePassword(values.currentPassword, values.newPassword);
    }
  };

  useEffect(
    () => {
      if (updateSuccess && formikRef) {
        message.success('Félicitations!, Vous avez changé votre mot de passe avec succès.');
        formikRef.current.resetForm();
        props.reset();
      }
    },
    [updateSuccess]
  );

  useEffect(
    () => {
      if (updateFailure && formikRef) {
        document.getElementById('currentPassword').focus();
        formikRef.current.setFieldTouched('currentPassword');
      }
    },
    [updateFailure]
  );

  const handleUpdatePassword = (currentPassword: string) => {
    formikRef.current.setFieldValue('currentPassword', currentPassword);
    if (updateFailure || updateSuccess) {
      props.reset();
    }
  };

  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string()
      .label('Mot de passe actuel')
      .required()
      .test('wrong-password', 'Désolé, Le mot de passe que vous avez entré est incorrect !', () => !updateFailure),
    newPassword: Yup.string()
      .label('Nouveau mot de passe')
      .min(4)
      .max(50)
      .required(),
    confirmPassword: Yup.string()
      .label('Confirmation du nouveau mot de passe')
      .min(4)
      .max(50)
      .required()
      .oneOf([Yup.ref('newPassword')], 'Le nouveau mot de passe et sa confirmation ne sont pas égaux !')
  });

  return (
    <Formik ref={formikRef} initialValues={{}} enableReinitialize validationSchema={validationSchema} onSubmit={saveEntity}>
      <Form>
        <PageHead
          title="Changer votre mot de passe"
          actions={
            <Button type="primary" htmlType="submit" loading={loading} icon="save" className="ant-btn-textual">
              <span>Sauvegarder</span>
            </Button>
          }
        />
        <div style={{ padding: '0 16px' }}>
          <Row>
            <Col sm={24} md={12} lg={8}>
              <PasswordField
                name="currentPassword"
                label="Mot de passe actuel"
                placeholder="Votre mot de passe actuel"
                onChange={handleUpdatePassword}
                autoFocus
              />
              <PasswordField name="newPassword" label="Nouveau mot de passe" placeholder="Votre nouveau mot de passe" strengthBar />
              <PasswordField
                name="confirmPassword"
                label="Confirmation du nouveau mot de passe"
                placeholder="Votre confirmation du nouveau mot de passe"
              />
            </Col>
          </Row>
        </div>
      </Form>
    </Formik>
  );
};

const mapStateToProps = ({ authentication, password }: IRootState) => ({
  isAuthenticated: authentication.isAuthenticated,
  updateSuccess: password.updateSuccess,
  updateFailure: password.updateFailure,
  loading: password.loading
});

const mapDispatchToProps = { savePassword, reset };

type DispatchProps = typeof mapDispatchToProps;
type StateProps = ReturnType<typeof mapStateToProps>;

export default connect<any, any>(
  mapStateToProps,
  mapDispatchToProps
)(PasswordPage);
