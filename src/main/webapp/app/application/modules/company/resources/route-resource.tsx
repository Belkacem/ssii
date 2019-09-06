import React, { FunctionComponent, lazy, Suspense, useEffect } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { LoadingDiv } from 'app/application/common/config/ui-constants';

import Absences from 'app/application/modules/absences/resource-route';
import ActivityReports from 'app/application/modules/activity-reports/route-resource';
import CompleteProfile from './complete-profile/complete-profile-resource';
import ResourceProfileUpdate from './complete-profile/profile-update';
import ResourceProfile from './resource-details/resource-profile';
import Expenses from 'app/application/modules/expenses/expense-lists/expenses-list-per-resource';
import { InactiveAccount } from 'app/application/components/errors/inactive-account.component';
import { NoContracts } from 'app/application/components/errors/no-contracts.component';
import { AccessDenied } from 'app/application/components/errors/access-denied.component';

interface IResourceRouteProps extends StateProps, DispatchProps, RouteComponentProps {}

const ResourceRoute: FunctionComponent<IResourceRouteProps> = props => {
  const { currentResource, resourceConfig, contracts } = props;
  if (!props.loadingCurrent) {
    if (!!currentResource.id) {
      if (!props.loadingConfigs && !resourceConfig.active) {
        return <InactiveAccount fullName={getFullName(currentResource)} />;
      }
      if (!props.loadingContracts && props.location.pathname.indexOf('create-profile') === -1 && contracts.length === 0) {
        return <NoContracts fullName={getFullName(currentResource)} />;
      }
    } else {
      return <AccessDenied />;
    }
  } else {
    return <LoadingDiv />;
  }
  return (
    <>
      <Switch>
        <Route path="/app/resource/create-profile" component={CompleteProfile} />
        <Route path="/app/resource/profile/update" component={ResourceProfileUpdate} />
        <Route path="/app/resource/profile" component={ResourceProfile} />
        <Route path="/app/resource/absences" component={Absences} />
        <Route path="/app/resource/my-activities" component={ActivityReports} />
        <Route path="/app/resource/expenses/:expense_id?" component={Expenses} />
      </Switch>
    </>
  );
};

const mapStateToProps = ({ application, resourceContract, resourceConfiguration, projectResource }: IRootState) => ({
  loadingCurrent: application.resource.current.loading,
  currentResource: application.resource.current.entity,
  resourceConfig: resourceConfiguration.entity,
  loadingConfigs: resourceConfiguration.loading,
  currentProjectResource: projectResource.entities,
  loadingProjectResource: projectResource.loading,
  contracts: resourceContract.entities,
  loadingContracts: resourceContract.loading
});

const mapDispatchToProps = {};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ResourceRoute);
