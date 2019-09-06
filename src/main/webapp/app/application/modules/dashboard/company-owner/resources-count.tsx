import React, { FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Spin, Statistic } from 'antd';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';

interface IResourcesCountProps extends StateProps, DispatchProps {}

export const ResourcesCount: FunctionComponent<IResourcesCountProps> = props => {
  const { resources, loading } = props;

  useEffect(() => {
    props.getAllResources();
  }, []);

  return (
    <Spin spinning={loading}>
      <Statistic title="Ressources" value={resources.length} />
    </Spin>
  );
};

const mapStateToProps = ({ resource }: IRootState) => ({
  resources: resource.entities,
  loading: resource.loading
});

const mapDispatchToProps = {
  getAllResources: ResourceExt.getAll
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ResourcesCount);
