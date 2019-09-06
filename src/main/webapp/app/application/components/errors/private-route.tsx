import React from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { ErrorBoundary } from './error-boundary';
import { AccessDenied } from './access-denied.component';
import { hasAnyAuthority } from 'app/application/common/utils/user-utils';

interface IOwnProps extends RouteProps {
  hasAnyAuthorities?: string[];
}

interface IPrivateRouteProps extends IOwnProps, StateProps {}

const PrivateRouteComponent = (props: IPrivateRouteProps) => {
  const { component: Component, account, isAuthenticated, sessionHasBeenFetched, hasAnyAuthorities = [], ...rest } = props;
  const isAuthorized = hasAnyAuthority(account.authorities, hasAnyAuthorities);

  const checkAuthorities = componentProps =>
    isAuthorized ? (
      <ErrorBoundary>
        <Component {...componentProps} />
      </ErrorBoundary>
    ) : (
      <AccessDenied />
    );

  const renderRedirect = componentProps => {
    if (!sessionHasBeenFetched) {
      return <div />;
    } else {
      return isAuthenticated ? (
        checkAuthorities(componentProps)
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            search: props.location.search,
            state: { from: props.location }
          }}
        />
      );
    }
  };

  if (!Component) throw new Error(`A component needs to be specified for private route for path ${(rest as any).path}`);

  return <Route {...rest} render={renderRedirect} />;
};

const mapStateToProps = ({ authentication }: IRootState) => ({
  account: authentication.account,
  isAuthenticated: authentication.isAuthenticated,
  sessionHasBeenFetched: authentication.sessionHasBeenFetched
});

type StateProps = ReturnType<typeof mapStateToProps>;

export default connect<StateProps, undefined, IOwnProps>(
  mapStateToProps,
  null,
  null,
  { pure: false }
)(PrivateRouteComponent);
