import React, { FunctionComponent } from 'react';
import { IResource } from 'app/shared/model/resource.model';
import { getResourceProgress } from 'app/application/common/utils/resource-utils';
import { Alert } from 'antd';

interface IResourceDetailsStatusProps {
  resource: IResource;
  loading: boolean;
}

export const ResourceDetailsStatus: FunctionComponent<IResourceDetailsStatusProps> = props => {
  const { resource, loading = false } = props;
  if (!resource.id || loading) {
    return null;
  }
  let alert = null;
  if (resource.draft) {
    alert = {
      message: 'Le profil de la ressource est incomplet !',
      type: 'warning'
    };
  } else {
    const progress = getResourceProgress(resource);
    const percent = Math.floor((progress.value * 100) / progress.max);
    if (percent !== 100) {
      alert = {
        message: `Le profil est renseigné à ${percent}% d'information !`,
        type: 'info'
      };
    }
  }

  if (!!alert) {
    return <Alert message={<small>{alert.message}</small>} type={alert.type} banner />;
  }
  return null;
};
