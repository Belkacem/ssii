import React, { FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { logout } from 'app/shared/reducers/authentication';
import { forceRedirect } from 'app/application/common/reducers/redirection/redirection.actions';

const Logout: FunctionComponent<DispatchProps> = props => {
  useEffect(() => {
    props.forceRedirect(null);
    props.logout();
    document.location.reload();
  }, []);

  return (
    <div>
      <h4>Logged out successfully!</h4>
      <Redirect to={{ pathname: '/' }} />
    </div>
  );
};

const mapDispatchToProps = { logout, forceRedirect };
type DispatchProps = typeof mapDispatchToProps;

export default connect<null, DispatchProps>(
  null,
  mapDispatchToProps
)(Logout);
