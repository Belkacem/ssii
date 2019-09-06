import React, { FunctionComponent } from 'react';
import { getFullName, getResourceProgress } from 'app/application/common/utils/resource-utils';
import { IResource } from 'app/shared/model/resource.model';
import { IResourceConfiguration } from 'app/shared/model/resource-configuration.model';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { Icon, Progress } from 'antd';
import { IResourceContract } from 'app/shared/model/resource-contract.model';

interface IResourcesListItemProps {
  resource: IResource;
  configuration: IResourceConfiguration;
  contracts: IResourceContract[];
  loadingContracts: boolean;
}

interface IResourceProgressProps {
  resource: IResource;
}

const ResourceStatus = ({ resource, configuration, contracts, loadingContracts = false }: IResourcesListItemProps) => {
  if (!!configuration && !configuration.active) {
    return (
      <small style={{ color: '#f5222d', whiteSpace: 'nowrap' }} title="Inactive">
        <Icon type="stop" theme="filled" />
      </small>
    );
  } else if (resource.draft) {
    return (
      <small style={{ color: '#f48921', whiteSpace: 'nowrap' }} title="Brouillon">
        <Icon type="exclamation-circle" theme="filled" />
      </small>
    );
  } else if (contracts.length === 0 && !loadingContracts) {
    return (
      <small style={{ color: '#f5222d', whiteSpace: 'nowrap' }} title="Manquer de contrat">
        <Icon type="warning" theme="filled" />
      </small>
    );
  }
  return null;
};

const ResourceProgress = ({ resource }: IResourceProgressProps) => {
  const progress = getResourceProgress(resource);
  const percent = Math.floor((progress.value * 100) / progress.max);
  if (percent !== 100) {
    return (
      <div className="meta-status">
        <Progress type="circle" percent={percent} width={32} />
      </div>
    );
  }
  return null;
};

export const ResourcesListItem: FunctionComponent<IResourcesListItemProps> = props => {
  const { resource, configuration, contracts, loadingContracts } = props;
  const isMuted = resource.draft || (!!configuration && !configuration.active);
  return (
    <div className="resource-meta">
      <Avatar name={resource.draft ? '' : getFullName(resource)} color={isMuted ? '#b9b9b9' : undefined} size={28} />
      <div className="meta-content" style={isMuted ? { color: '#b9b9b9' } : undefined}>
        <span className="meta-title">{getFullName(resource)}</span>
        {!resource.draft && <span className="meta-description">{resource.email}</span>}
      </div>
      <div className="meta-status">
        <ResourceStatus resource={resource} configuration={configuration} contracts={contracts} loadingContracts={loadingContracts} />
      </div>
      <ResourceProgress resource={resource} />
    </div>
  );
};
