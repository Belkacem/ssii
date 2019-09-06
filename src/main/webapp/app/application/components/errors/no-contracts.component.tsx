import React, { FunctionComponent } from 'react';
import { Alert } from 'antd';

interface INoContractsProps {
  fullName?: string;
}

export const NoContracts: FunctionComponent<INoContractsProps> = props => (
  <div className="padding-3rem">
    <Alert
      message="Pas encore de contrat"
      description={
        <small>
          {!!props.fullName && `M. ${props.fullName}, `}
          il n'y a pas de contrat dans ce compte, s'il vous plaît contacter le propriétaire de cette société.
        </small>
      }
      type="error"
      showIcon
    />
  </div>
);
