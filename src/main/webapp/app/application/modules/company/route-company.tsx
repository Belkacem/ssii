import React, { FunctionComponent, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from 'app/application/components/errors/private-route';
import { AUTHORITIES } from 'app/application/common/config/constants';
import { LoadingDiv } from 'app/application/common/config/ui-constants';

const CompanyForm = lazy(() => import('./company-create/company-create'));
const CompanyProfile = lazy(() => import('./company-details/company-details'));
const CompanyUpdate = lazy(() => import('./company-update/company-update'));
const CompanyConfig = lazy(() => import('./company-configuration/company-configuration'));
const Resources = lazy(() => import('./resources/route-company-owner'));
const Absences = lazy(() => import('app/application/modules/absences/company-owner-route'));
const Projects = lazy(() => import('app/application/modules/activity-reports/projects/route-company-owner'));
const ActivityReports = lazy(() => import('app/application/modules/activity-reports/route-company-owner'));
const Clients = lazy(() => import('app/application/modules/invoices/clients/route-company-owner'));
const Invoices = lazy(() => import('../invoices/route-company-owner'));
const Expenses = lazy(() => import('app/application/modules/expenses/route-company-owner'));

const CompanyRoute: FunctionComponent<StateProps> = props => (
  <Suspense fallback={<LoadingDiv />}>
    <Switch>
      <PrivateRoute path="/app/company/fetch-by-siren/:siren?" component={CompanyForm} hasAnyAuthorities={[AUTHORITIES.COMPANY_OWNER]} />
      <Switch>
        <Route path="/app/company/invoices" children={<Invoices company={props.company} />} />
        <Route path="/app/company/clients" children={<Clients />} />
        <Route path="/app/company/projects" children={<Projects />} />
        <Route path="/app/company/resources" children={<Resources />} />
        <Route path="/app/company/absences" children={<Absences />} />
        <Route path="/app/company/expenses" children={<Expenses />} />
        <Route path="/app/company/activity-reports" children={<ActivityReports />} />
        <Route path="/app/company/profile" children={<CompanyProfile />} />
        <Route path="/app/company/update" children={<CompanyUpdate />} />
        <Route path="/app/company/update-config" children={<CompanyConfig />} />
      </Switch>
    </Switch>
  </Suspense>
);

const mapStateToProps = ({ application }: IRootState) => ({
  company: application.company.current
});

type StateProps = ReturnType<typeof mapStateToProps>;

export default connect<StateProps, null>(
  mapStateToProps,
  null
)(CompanyRoute);
