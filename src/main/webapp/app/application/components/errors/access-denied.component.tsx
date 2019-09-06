import React, { FunctionComponent } from 'react';
import { Alert } from 'antd';

export const AccessDenied: FunctionComponent = () => (
  <div className="padding-3rem">
    <Alert
      message="Accès refusé"
      description={<small>Vous n'avez pas l'autorisation d'accéder à cette page</small>}
      type="error"
      showIcon
    />
  </div>
);
