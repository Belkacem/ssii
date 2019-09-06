import React, { FunctionComponent } from 'react';
import { Alert } from 'antd';

interface IInactiveAccountProps {
  fullName?: string;
}

export const InactiveAccount: FunctionComponent<IInactiveAccountProps> = props => (
  <div className="padding-3rem">
    <Alert
      message="Compte désactivé"
      description={
        <small>
          {!!props.fullName && `M. ${props.fullName}, `}
          Votre compte a été désactivé, si vous avez des questions ou des préoccupations, veuillez contacter l'administration.
        </small>
      }
      type="error"
      showIcon
    />
  </div>
);
