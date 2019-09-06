import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Divider, Icon } from 'antd';
import { getUrlParameter } from 'app/application/common/utils/url-utils';
import { IRootState } from 'app/shared/reducers';
import { activateAction, reset } from 'app/modules/account/activate/activate.reducer';
import { FlexPage } from 'app/application/common/layout/flex-page/flex-page';
import Brand from 'app/application/common/layout/header/brand';

interface IActivatePageProps extends StateProps, DispatchProps, RouteComponentProps<{}> {}

export const ActivatePage: FunctionComponent<IActivatePageProps> = props => {
  const activationKey = getUrlParameter('key', props.location.search);
  const { activationFailure, activationSuccess } = props;

  if (!activationFailure && !activationSuccess) {
    props.activateAction(activationKey);
  }

  const handleClose = () => {
    props.history.push('/login');
  };

  const successAlert = (
    <form className="success-message">
      <Icon type="check-circle" />
      <h3>Oui !</h3>
      <span>Vous avez activé votre compte avec succès !</span>
      <Divider />
      <Button block size="large">
        <Link to="/login">Connecter</Link>
      </Button>
    </form>
  );

  const failureAlert = (
    <form className="error-message">
      <Icon type="close-circle" />
      <p>
        <strong>Votre compte utilisateur n'a pas pu être activé.</strong> Utilisez le formulaire d'enregistrement pour en créer un nouveau.
      </p>
      <Divider />
      <Button block size="large">
        <Link to="/login">Connecter</Link>
      </Button>
    </form>
  );

  return (
    <FlexPage open onClose={handleClose}>
      <div className="login-form">
        <div className="login-header">
          <Brand theme="dark" size="medium" isLink={false} />
          <Divider>Activation du compte</Divider>
        </div>
        {activationSuccess ? successAlert : undefined}
        {activationFailure ? failureAlert : undefined}
      </div>
    </FlexPage>
  );
};

const mapStateToProps = ({ activate }: IRootState) => ({
  activationSuccess: activate.activationSuccess,
  activationFailure: activate.activationFailure
});

const mapDispatchToProps = { activateAction, reset };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ActivatePage));
