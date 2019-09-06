import React, { FunctionComponent, lazy, Suspense, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { RouteComponentProps, Switch, withRouter, Route } from 'react-router-dom';
import PrivateRoute from 'app/application/components/errors/private-route';
import { hasAnyAuthority, isOwner } from 'app/application/common/utils/user-utils';
import { AUTHORITIES } from 'app/application/common/config/constants';

import { Layout } from 'antd';
import { Header } from 'app/application/common/layout/header/header';
import AppMenu from 'app/application/common/layout/header/app-menu';
import Footer from 'app/application/common/layout/footer/footer';
import { LoadingDiv } from 'app/application/common/config/ui-constants';
import Account from 'app/application/modules/account';

const Admin = lazy(() => import('./modules/admin'));
const Company = lazy(() => import('./modules/company/route-company'));
const Resource = lazy(() => import('./modules/company/resources/route-resource'));
const Absences = lazy(() => import('./modules/absences/absence-validator-route'));
const Activities = lazy(() => import('./modules/activity-reports/route-project-validator'));
const Expenses = lazy(() => import('./modules/expenses/route-expense-validator'));
const Desktop = lazy(() => import('./modules/desktop/desktop'));

interface IAppRoutesProps extends StateProps, RouteComponentProps {}

const AppRoutes: FunctionComponent<IAppRoutesProps> = props => {
  const [size, setSize] = useState('sm');
  const { companies, isAuthenticated, account, currentCompany } = props;

  useEffect(() => {
    const mqlSmall = window.matchMedia('(max-width: 575px)');
    const mqlLarge = window.matchMedia('(min-width: 1200px)');
    mqlSmall.addListener(mqlListener);
    mqlLarge.addListener(mqlListener);
    mqlListener();
    return () => {
      mqlSmall.removeListener(mqlListener);
      mqlLarge.removeListener(mqlListener);
    };
  }, []);

  const mqlListener = () => {
    if (window.matchMedia('(max-width: 575px)').matches) {
      setSize('sm');
    } else if (window.matchMedia('(min-width: 1200px)').matches) {
      setSize('lg');
    } else {
      setSize('md');
    }
  };

  const countAccounts = () => {
    let count = 0;
    const isAdmin = hasAnyAuthority(account.authorities, [AUTHORITIES.ADMIN]);
    const isCompanyOwner: boolean = isOwner(account, currentCompany);
    if (isCompanyOwner) count++;
    if (isAdmin) count++;
    if (!!props.currentResource.id) count++;
    if (!!props.currentAbsenceValidator && !isCompanyOwner) count++;
    if (props.currentProjectValidators.length > 0 && !isCompanyOwner) count++;
    if (!!props.currentExpenseValidator && !isCompanyOwner) count++;
    if (props.currentProjectContractors.length > 0 && !isCompanyOwner) count++;
    return count;
  };

  return (
    <Layout className="main">
      <Header
        isDrawer={size === 'sm'}
        account={account}
        companies={companies}
        isAuthenticated={isAuthenticated}
        countAccounts={countAccounts()}
      />
      <div className="container">
        <div className="main-content">
          <Switch>
            {isAuthenticated && <Route path="/app/account" component={Account} />}
            <>
              <Layout>
                {size !== 'sm' && <AppMenu isMobile={false} open={size === 'lg'} />}
                <Layout.Content>
                  <Suspense fallback={<LoadingDiv />}>
                    <Switch>
                      <PrivateRoute path="/app/home" component={Desktop} hasAnyAuthorities={[AUTHORITIES.USER]} />
                      <PrivateRoute path="/app/admin" component={Admin} hasAnyAuthorities={[AUTHORITIES.ADMIN]} />
                      <PrivateRoute path="/app/company" component={Company} hasAnyAuthorities={[AUTHORITIES.COMPANY_OWNER]} />
                      <PrivateRoute path="/app/absences" component={Absences} hasAnyAuthorities={[AUTHORITIES.USER]} />
                      <PrivateRoute path="/app/expenses" component={Expenses} hasAnyAuthorities={[AUTHORITIES.USER]} />
                      <PrivateRoute path="/app/activities/p/:project_id" component={Activities} hasAnyAuthorities={[AUTHORITIES.USER]} />
                      <PrivateRoute path="/app/activities" component={Activities} hasAnyAuthorities={[AUTHORITIES.USER]} />
                      <PrivateRoute path="/app/resource" component={Resource} hasAnyAuthorities={[AUTHORITIES.USER]} />
                      <PrivateRoute path="/app" component={Desktop} hasAnyAuthorities={[AUTHORITIES.USER]} />
                    </Switch>
                  </Suspense>
                </Layout.Content>
              </Layout>
            </>
          </Switch>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

const mapStateToProps = ({ authentication, application, projectResource, company }: IRootState) => ({
  isAuthenticated: authentication.isAuthenticated,
  account: authentication.account,
  companies: company.entities,
  currentCompany: application.company.current,
  currentResource: application.resource.current.entity,
  currentAbsenceValidator: application.absenceValidator.current,
  currentProjectValidators: application.projectValidator.currents,
  currentExpenseValidator: application.expenseValidator.current,
  currentProjectContractors: application.projectContractor.currents
});

type StateProps = ReturnType<typeof mapStateToProps>;

export default connect<StateProps, null>(
  mapStateToProps,
  null
)(withRouter(AppRoutes));
