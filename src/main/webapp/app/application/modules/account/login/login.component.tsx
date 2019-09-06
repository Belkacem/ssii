import React, { useEffect, FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps, Redirect, withRouter } from 'react-router-dom';
import { FlexPage } from 'app/application/common/layout/flex-page/flex-page';
import { Divider, message, Spin } from 'antd';
import Brand from 'app/application/common/layout/header/brand';
import { LoginForm } from './login.form';
import { login } from 'app/shared/reducers/authentication';
import { setLoginUsername } from 'app/application/common/reducers/account/login.reducer';
import { setHomeLink } from 'app/application/common/reducers/redirection/redirection.actions';

interface ILoginProps extends StateProps, DispatchProps, RouteComponentProps<{}> {}

const ignoredUrls = ['/', '/activate', '/password-forget', '/reset/finish', '/signup'];

const Login: FunctionComponent<ILoginProps> = props => {
  const { loading, isAuthenticated, location, homeLink, showModalLogin } = props;
  const visible = location.pathname === '/login';

  const saveEntity = (username, password, rememberMe) => {
    message.destroy();
    props.login(username, password, rememberMe);
    props.setLoginUsername(username);
  };

  useEffect(
    () => {
      if (showModalLogin && !ignoredUrls.some(url => props.location.pathname === url)) {
        props.setHomeLink(null);
        props.history.push('/login');
      }
    },
    [showModalLogin]
  );

  const handleClose = () => {
    if (isAuthenticated) {
      props.history.goBack();
    } else {
      props.history.push('/');
    }
  };

  if (visible && isAuthenticated && homeLink) {
    const redirectTo = location.state && location.state.from.pathname ? location.state.from.pathname : homeLink;
    return <Redirect to={redirectTo} />;
  }

  return (
    <FlexPage open={visible} onClose={handleClose} animation="top">
      <div className="login-form">
        <Spin spinning={loading}>
          <div className="login-header">
            <Brand theme="dark" size="medium" isLink={false} />
            <Divider>Connexion</Divider>
          </div>
          <LoginForm onLogin={saveEntity} loginError={props.loginError} errorMessage={props.errorMessage} />
        </Spin>
      </div>
    </FlexPage>
  );
};

const mapStateToProps = ({ authentication, application }: IRootState) => ({
  isAuthenticated: authentication.isAuthenticated,
  showModalLogin: authentication.showModalLogin,
  authentication,
  loginError: authentication.loginError,
  loading: authentication.loading,
  errorMessage: authentication.errorMessage,
  loginSuccess: authentication.loginSuccess,
  homeLink: application.redirection.homeLink
});

const mapDispatchToProps = {
  login,
  setLoginUsername,
  setHomeLink
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Login));
