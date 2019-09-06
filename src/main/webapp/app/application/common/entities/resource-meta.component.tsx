import React, { FunctionComponent } from 'react';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import { Badge, Icon, Skeleton } from 'antd';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { Link } from 'react-router-dom';
import { Gender, IResource } from 'app/shared/model/resource.model';

interface IResourceMetaComponentProps {
  resource?: IResource;
  isMeta?: boolean;
  link?: string;
  showGender?: boolean;
  loading?: boolean;
}

export const ResourceMetaComponent: FunctionComponent<IResourceMetaComponentProps> = props => {
  const { isMeta, link, showGender = false, resource, loading = false } = props;
  if (loading || !resource) {
    return <Skeleton paragraph={false} avatar={isMeta} active className="no-margin" />;
  }
  if (isMeta) {
    const gender = resource.gender === Gender.MALE ? 'man' : resource.gender === Gender.FEMALE ? 'woman' : undefined;
    return (
      <div className="resource-meta">
        {gender && showGender ? (
          <Badge count={<Icon type={gender} className={gender} />}>
            <Avatar name={getFullName(resource)} size={40} />
          </Badge>
        ) : (
          <Avatar name={getFullName(resource)} size={40} />
        )}
        <div className="meta-content">
          {link ? (
            <Link to={link}>
              <span className="meta-title">{getFullName(resource)}</span>
            </Link>
          ) : (
            <span className="meta-title">{getFullName(resource)}</span>
          )}
          <span className="meta-description">{resource.email}</span>
        </div>
      </div>
    );
  }
  return <>{getFullName(resource)}</>;
};
