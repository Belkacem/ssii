import React, { FunctionComponent, ChangeEvent, RefObject, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { handlePasswordResetInit, reset } from 'app/modules/account/password-reset/password-reset.reducer';
import { FlexPage } from 'app/application/common/layout/flex-page/flex-page';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Button, Divider, Icon, message } from 'antd';
import { IRootState } from 'app/shared/reducers';
import Brand from 'app/application/common/layout/header/brand';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

interface IPasswordResetInitProps extends StateProps, DispatchProps, RouteComponentProps<{}> {}

export const PasswordResetInit: FunctionComponent<IPasswordResetInitProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const { loading, failure, success } = props;
  message.destroy();

  const handleClose = () => {
    props.history.goBack();
  };

  const saveEntity = values => {
    if (!loading) {
      props.handlePasswordResetInit(values.email);
    }
  };

  const handleEmailChange = (email: string) => {
    formikRef.current.setFieldValue('email', email);
    if (failure || success) {
      props.reset();
    }
  };

  useEffect(
    () => {
      if (failure && formikRef) {
        formikRef.current.setFieldTouched('email');
      }
      if (success) {
        handleClose();
        message.success('Consultez vos courriels pour savoir comment réinitialiser votre mot de passe.');
        props.reset();
      }
    },
    [failure, success]
  );

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .label('Adresse Email')
      .email()
      .required()
      .test('failure', "L'adresse email n'est pas enregistrée! S'il vous plaît, vérifiez et essayez à nouveau !", () => !failure)
  });

  const initialValues = !!props.savedUsername ? { email: props.savedUsername } : {};
  return (
    <FlexPage open onClose={handleClose}>
      <div className="login-form">
        <div className="login-header">
          <Brand theme="dark" size="medium" isLink={false} />
          <Divider>
            Récupération de <b>compte</b>
          </Divider>
          <p>
            <small>
              <i>Veuillez saisir votre adresse e-mail associée à votre compte</i>
            </small>
          </p>
        </div>
        <Formik ref={formikRef} initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={saveEntity}>
          <Form>
            <TextField
              autoFocus
              name="email"
              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Votre Adresse Email"
              onChange={handleEmailChange}
              size="large"
              helper="votre adresse e-mail associée à votre compte"
            />
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Continue
            </Button>
            <Divider>
              <small className="text-muted">OR</small>
            </Divider>
            <Button size="large" block>
              <Link to="/login">Retour au Connexion</Link>
            </Button>
          </Form>
        </Formik>
      </div>
    </FlexPage>
  );
};

const mapStateToProps = ({ application, passwordReset }: IRootState) => ({
  savedUsername: application.forms.login.username,
  success: passwordReset.resetPasswordSuccess,
  failure: passwordReset.resetPasswordFailure,
  loading: passwordReset.loading
});

const mapDispatchToProps = { handlePasswordResetInit, reset };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(PasswordResetInit));
