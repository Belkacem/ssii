import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { Alert, Button, Card, Col, Icon, message, Row } from 'antd';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { LoadingDiv } from 'app/application/common/config/ui-constants';
import { FlexPage } from 'app/application/common/layout/flex-page/flex-page';
import * as Register from 'app/modules/account/register/register.reducer';
import { handleSignup } from 'app/application/common/reducers/account/signup.actions';
import {
  ABSENCE_VALIDATOR_TICKET,
  PROJECT_VALIDATOR_TICKET,
  RESOURCE_TICKET,
  EXPENSE_VALIDATOR_TICKET,
  PROJECT_CONTRACTOR_TICKET,
  TICKET,
  storeTicket,
  checkTicket,
  cleanTicket,
  resetTicket
} from 'app/application/common/reducers/ticket/ticket.actions';
import PasswordField from 'app/application/components/zsoft-form/generic-fields/passwordField.component';
import TextField from 'app/application/components/zsoft-form/generic-fields/textField.component';

interface ISignupProps extends StateProps, DispatchProps, RouteComponentProps<{ ticket; account_type }> {}

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .label('Prénom')
    .required(),
  lastName: Yup.string()
    .label('Nom')
    .required(),
  email: Yup.string()
    .label('Adresse E-mail')
    .email(),
  password: Yup.string()
    .label('Mot de passe')
    .min(4)
    .max(50)
    .required(),
  confirmPassword: Yup.string()
    .label('Confirmation du mot de passe')
    .min(4)
    .max(50)
    .required()
    .oneOf([Yup.ref('password')], 'Le mot de passe et sa confirmation ne sont pas égaux !')
});

const Signup: FunctionComponent<ISignupProps> = props => {
  const formikRef: RefObject<Formik> = useRef<Formik>(null);
  const [startFetching, setStartFetching] = useState(false);

  const setTicket = () => {
    const matches = /ticket\/([^]+)/.exec(props.match.params.ticket);
    if (matches && matches.length > 1 && matches[1]) {
      const ticket = matches[1];
      cleanTicket();
      switch (props.match.params.account_type) {
        case 'activity':
          storeTicket(PROJECT_VALIDATOR_TICKET, ticket);
          break;
        case 'absences':
          storeTicket(ABSENCE_VALIDATOR_TICKET, ticket);
          break;
        case 'resources':
          storeTicket(RESOURCE_TICKET, ticket);
          break;
        case 'expenses':
          storeTicket(EXPENSE_VALIDATOR_TICKET, ticket);
          break;
        case 'contractor':
          storeTicket(PROJECT_CONTRACTOR_TICKET, ticket);
          break;
        default:
          storeTicket(TICKET, ticket);
      }
      props.history.replace('/signup');
      setStartFetching(false);
    }
  };

  const { register } = props;
  if (!startFetching) {
    props.resetTicket();
    props.resetRegister();
    props.checkTicket();
    setStartFetching(true);
  }
  useEffect(
    () => {
      if (register.registrationSuccess) {
        props.history.replace('/login');
      }
      if (register.errorMessage === 'userexists') {
        message.destroy();
        message.error(
          <>
            Cette email existe déjà, Vous pouvez connecter pour établir un lien avec votre compte existant,
            <br />
            Ou contacter l'administration pour plus d'informations.
          </>,
          3,
          () => {
            props.resetRegister();
          }
        );
      }
      if (props.match.params.ticket) {
        setTicket();
      }
    },
    [register.registrationSuccess, register.errorMessage, props.match.params.ticket]
  );

  const handleCreate = values => {
    if (!register.loading) {
      const { ticket, ticketType } = props;
      props.handleSignup(values.email, values.firstName, values.lastName, values.password, ticket, ticketType);
    }
  };

  const handleClose = () => {
    props.history.replace('/');
  };

  const { loading, valide, errorMessage } = props;
  const accessDenied = loading || !valide || (errorMessage && errorMessage.response.status === 404);
  if (loading) {
    return <LoadingDiv />;
  } else if (accessDenied) {
    return (
      <div className="padding-3rem">
        <Alert
          message={
            <small>
              <b>Accès refusé</b>: Vous n'êtes pas autorisé à accéder à cette page. !
            </small>
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <FlexPage open onClose={handleClose}>
      <Row gutter={48} className="fullwidth">
        <Col sm={{ span: 14, offset: 5 }} md={{ span: 12, offset: 6 }} lg={{ span: 8, offset: 8 }}>
          <Card bodyStyle={{ padding: 8 }} style={{ marginBottom: 16 }}>
            <h2 style={{ textAlign: 'center' }}>Créer votre compte</h2>
            <Alert
              message={
                <small>
                  <i>
                    Si vous avez déjà un compte, vous pouvez simplement vous connecter à votre compte pour le lien avec ce nouveau rôle.
                  </i>
                </small>
              }
              type="info"
              showIcon
              banner
              style={{ marginBottom: 16 }}
            />
            <Formik
              ref={formikRef}
              initialValues={{ email: valide }}
              enableReinitialize
              validationSchema={validationSchema}
              onSubmit={handleCreate}
            >
              <Form>
                <Row>
                  <Col sm={12}>
                    <TextField name="firstName" placeholder="Prénom" autoFocus />
                  </Col>
                  <Col sm={12}>
                    <TextField name="lastName" placeholder="Nom" />
                  </Col>
                </Row>
                <TextField
                  name="email"
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="Adresse E-mail"
                  size="large"
                />
                <PasswordField name="password" placeholder="Mot de passe" size="large" strengthBar />
                <PasswordField name="confirmPassword" placeholder="Confirmation du mot de passe" size="large" />
                <Button type="primary" htmlType="submit" size="large" block className="margin-bottom-8">
                  Créer
                </Button>
                <Button type="ghost" size="large" block>
                  <Link to="/login">Se connecter</Link>
                </Button>
              </Form>
            </Formik>
          </Card>
        </Col>
      </Row>
    </FlexPage>
  );
};

const mapStateToProps = ({ application, register }: IRootState) => ({
  errorMessage: application.ticket.errorMessage,
  loading: application.ticket.loading,
  valide: application.ticket.valide,
  ticketType: application.ticket.ticketType,
  ticket: application.ticket.ticket,
  register
});

const mapDispatchToProps = {
  checkTicket,
  resetTicket,
  handleSignup,
  resetRegister: Register.reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Signup));
