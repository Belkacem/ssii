import React, { FunctionComponent, ChangeEvent, RefObject, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { getUrlParameter } from 'app/application/common/utils/url-utils';
import { handlePasswordResetFinish, reset } from 'app/modules/account/password-reset/password-reset.reducer';
import { FlexPage } from 'app/application/common/layout/flex-page/flex-page';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Button, Divider, message } from 'antd';
import { IRootState } from 'app/shared/reducers';
import Brand from 'app/application/common/layout/header/brand';
import { Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import PasswordField from 'app/application/components/zsoft-form/generic-fields/passwordField.component';

interface IPasswordResetFinishPageProps extends StateProps, DispatchProps, RouteComponentProps<{}> {}

export const PasswordResetFinishPage: FunctionComponent<IPasswordResetFinishPageProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { loading, failure, success } = props;
  const resetKey = getUrlParameter('key', props.location.search);

  useEffect(
    () => {
      if (failure && formikRef) {
        formikRef.current.setFieldTouched('newPassword');
      }
      if (success) {
        handleClose();
        message.success('Félicitations!, Votre mot de passe a été réinitialisé.');
        props.reset();
      }
    },
    [success, failure]
  );

  const handleClose = () => {
    props.history.push('/login');
  };

  const saveEntity = values => {
    props.handlePasswordResetFinish(resetKey, values.newPassword);
  };

  const validationSchema = Yup.object().shape({
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

  return resetKey ? (
    <FlexPage open onClose={handleClose}>
      <div className="login-form">
        <div className="login-header">
          <Brand theme="dark" size="medium" isLink={false} />
          <Divider>
            Réinitialisation du <b>mot de passe</b>
          </Divider>
        </div>
        <Formik ref={formikRef} initialValues={{}} enableReinitialize validationSchema={validationSchema} onSubmit={saveEntity}>
          <Form>
            <PasswordField autoFocus name="newPassword" placeholder="Nouveau mot de passe" size="large" strengthBar />
            <PasswordField name="confirmPassword" placeholder="Confirmation du nouveau mot de passe" size="large" />
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Réinitialiser le mot de passe
            </Button>
          </Form>
        </Formik>
      </div>
    </FlexPage>
  ) : (
    <Redirect to="/password-forget" />
  );
};

const mapStateToProps = ({ passwordReset }: IRootState) => ({
  success: passwordReset.resetPasswordSuccess,
  failure: passwordReset.resetPasswordFailure,
  loading: passwordReset.loading
});

const mapDispatchToProps = { handlePasswordResetFinish, reset };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(PasswordResetFinishPage));
