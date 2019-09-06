import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Alert, Button, Form as antdForm, Icon, Input } from 'antd';
import { Link } from 'react-router-dom';
import PasswordField from 'app/application/components/zsoft-form/generic-fields/passwordField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

export interface ILoginFormProps {
  onLogin: (username: string, password: string, rememberMe: boolean) => void;
  loginError: boolean;
  errorMessage: any;
}

const initialValues = {
  username: '',
  password: '',
  rememberMe: true
};
export const LoginForm: FunctionComponent<ILoginFormProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>();
  const usernamerRef: RefObject<Input> = useRef<Input>();
  const [showErrors, setShowErrors] = useState(false);
  const badCredentials = showErrors && props.loginError && props.errorMessage.response.data.detail === 'Bad credentials';
  const inactiveAccount = showErrors && props.loginError && props.errorMessage.response.data.detail !== 'Bad credentials';

  const onSubmit = ({ username, password, rememberMe = true }) => {
    props.onLogin(username, password, rememberMe);
  };

  useEffect(() => {
    if (!!usernamerRef.current && !!formikRef.current) {
      formikRef.current.resetForm();
      usernamerRef.current.focus();
    }
  }, []);

  useEffect(
    () => {
      setShowErrors(props.loginError);
      if (props.loginError) {
        if (props.errorMessage.response.data.detail === 'Bad credentials') {
          formikRef.current.setFieldTouched('password');
        } else {
          formikRef.current.setFieldTouched('username');
        }
      }
    },
    [props.loginError]
  );

  const handleUsernameChange = (username: string) => {
    formikRef.current.setFieldValue('username', username);
    setShowErrors(false);
  };

  const handlePasswordChange = (password: string) => {
    formikRef.current.setFieldValue('password', password);
    setShowErrors(false);
  };

  const getValidationSchema = () =>
    Yup.object().shape({
      username: Yup.string()
        .label('Adresse e-mail ou Pseudo')
        .required()
        .test('inactive-account', 'Votre compte a été désactivé', () => Promise.resolve(!inactiveAccount)),
      password: Yup.string()
        .label('Mot de passe')
        .required()
        .test(
          'bad-credentials',
          'Mot de passe incorrect. Mot de passe incorrect. Réessayez ou cliquez sur "Mot de passe oublié" pour le réinitialiser.',
          () => Promise.resolve(!badCredentials)
        )
    });

  return (
    <>
      <Formik
        ref={formikRef}
        initialValues={initialValues}
        enableReinitialize={false}
        validationSchema={getValidationSchema()}
        onSubmit={onSubmit}
      >
        <Form>
          {props.loginError &&
            inactiveAccount && (
              <antdForm.Item>
                <Alert
                  message={<small>Votre compte est désactivé</small>}
                  description={<small>Si vous avez des questions ou des problèmes, contacter l'administration</small>}
                  type="warning"
                  showIcon
                />
              </antdForm.Item>
            )}
          <TextField
            inputRef={usernamerRef}
            name="username"
            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Adresse e-mail ou Pseudo"
            size="large"
            onChange={handleUsernameChange}
            autoComplete="username"
          />
          <PasswordField
            name="password"
            placeholder="Mot de passe"
            size="large"
            onChange={handlePasswordChange}
            autoComplete="current-password"
          />
          <antdForm.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Connexion
            </Button>
          </antdForm.Item>
          <Link className="login-form-forgot" to="/password-forget">
            <small>Mot de passe oublié?</small>
          </Link>
        </Form>
      </Formik>
    </>
  );
};
