import React, { FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import { IRootState } from 'app/shared/reducers';
import { IResource } from 'app/shared/model/resource.model';
import { ResourceMetaComponent } from './resource-meta.component';

interface IEmployeeNameProps extends StateProps, DispatchProps {
  resourceId?: number;
  resource?: IResource;
  isMeta?: boolean;
  link?: string;
  showGender?: boolean;
}

const EmployeeName: FunctionComponent<IEmployeeNameProps> = props => {
  const { resourceId, resources, loading } = props;

  useEffect(() => {
    if (!!resourceId && !resources[resourceId]) {
      props.fetchResource(resourceId);
    }
  }, []);

  useEffect(
    () => {
      if (resourceId) {
        if (!!resourceId && !resources[resourceId]) {
          props.fetchResource(resourceId);
        }
      }
    },
    [resourceId]
  );

  let resource = props.resource;
  let isLoading = false;
  if (resourceId) {
    isLoading = loading.some(l => l.id === resourceId && l.loading);
    resource = resources[resourceId];
  }
  return (
    <ResourceMetaComponent resource={resource} loading={isLoading} isMeta={props.isMeta} link={props.link} showGender={props.showGender} />
  );
};

const mapStateToProps = ({ application }: IRootState) => ({
  resources: application.resource.name.entities,
  loading: application.resource.name.loading
});

const mapDispatchToProps = {
  fetchResource: ResourceExt.getById
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(EmployeeName);
