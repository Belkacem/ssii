import React, { Component, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { Button, LocaleProvider, Modal, Card, Icon, Divider } from 'antd';
/* tslint:disable:no-submodule-imports */
import langProvider from 'antd/lib/locale-provider/fr_FR';
import { defaultConfiguration } from 'app/application/common/config/config';
import { Redirect, RouteComponentProps, Switch, Route } from 'react-router-dom';
import './application.scss';
import { IRootState } from 'app/shared/reducers';
import { LoadingDiv } from 'app/application/common/config/ui-constants';
import LoadingBar from 'react-redux-loading-bar';
import AppRoutes from './routes';
import { LoginLoading } from './modules/account/login/login.loading';

import { getSession } from 'app/shared/reducers/authentication';
import { getProfile } from 'app/shared/reducers/application-profile';
import * as AbsenceValidatorsExt from 'app/application/entities/absence-validator/absence-validator.actions';
import * as ProjectValidatorExt from 'app/application/entities/project-validator/project-validator.actions';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import * as ExpenseValidatorExt from 'app/application/entities/expense-validator/expense-validator.actions';
import * as ProjectContractorExt from 'app/application/entities/project-contractor/project-contractor.actions';
import * as Company from 'app/application/entities/company/company.actions';
import { setHomeLink } from 'app/application/common/reducers/redirection/redirection.actions';
import { getCompanyByCurrentHost } from 'app/application/common/reducers/domain-name/domain-name.actions';
import { getEntities as getAllConstants } from 'app/entities/constant/constant.reducer';

import {
  ABSENCE_VALIDATOR_TICKET,
  cleanTicket,
  EXPENSE_VALIDATOR_TICKET,
  getTicket,
  PROJECT_VALIDATOR_TICKET,
  RESOURCE_TICKET,
  PROJECT_CONTRACTOR_TICKET,
  checkNewTickets,
  hasStoredTicket
} from 'app/application/common/reducers/ticket/ticket.actions';
import axios from 'axios';

import Login from './modules/account/login/login.component';
const Logout = lazy(() => import('./modules/account/logout'));
const LandingPage = lazy(() => import('./modules/landing-page/landing-page'));
const Activate = lazy(() => import('./modules/account/activate/activate'));
const PasswordResetInit = lazy(() => import('./modules/account/password-reset/init/password-reset-init'));
const PasswordResetFinish = lazy(() => import('./modules/account/password-reset/finish/password-reset-finish'));
const Signup = lazy(() => import('./modules/account/signup/signup'));

interface IHomeProps extends StateProps, DispatchProps, RouteComponentProps {}

interface IHomeStates {
  unauthorized: boolean;
}

class Home extends Component<IHomeProps, IHomeStates> {
  constructor(props) {
    super(props);
    this.state = {
      unauthorized: false
    };
  }

  componentDidMount() {
    defaultConfiguration();
    this.props.getAllConstants(0, 999, 'id,desc');
    this.props.getCompanyByCurrentHost();
    this.props.getSession();
    this.props.getProfile();
    this.setupAxiosInterceptors();
  }

  componentDidUpdate(prevProps) {
    if (
      (prevProps.sessionLoading !== this.props.sessionLoading && !this.props.sessionLoading && this.props.isAuthenticated) ||
      (prevProps.ticketLoading !== this.props.ticketLoading && !this.props.ticketLoading && this.props.isAuthenticated)
    ) {
      this.assignValidator();
    }
    if (prevProps.sessionLoading !== this.props.sessionLoading && !this.props.sessionLoading && this.props.isAuthenticated) {
      this.setRedirectionLink();
    }
    if (prevProps.isAuthenticated !== this.props.isAuthenticated && this.props.isAuthenticated) {
      if (this.props.location.pathname.indexOf('signup') === -1 && !hasStoredTicket()) {
        this.props.checkNewTickets();
      }
    }
  }

  setupAxiosInterceptors = () => {
    const onResponseSuccess = response => response;
    const onResponseError = err => {
      const status = err.status || err.response.status;
      if (status === 403) {
        return this.setState({ unauthorized: true });
      }
      return Promise.reject(err);
    };
    axios.interceptors.response.use(onResponseSuccess, onResponseError);
  };

  unauthorizedLogin = () => {
    this.setState({ unauthorized: false }, () => {
      this.props.history.replace('/login');
    });
  };

  assignAccount = (ticketKey: string, roleLabel: string, callback: Function) => {
    const ticket = getTicket(ticketKey);
    if (!!ticket) {
      Modal.confirm({
        centered: true,
        title: 'Il y a un ticket enregistré',
        content: `Souhaitez-vous associer ce compte à votre rôle de '${roleLabel}' ?`,
        onOk: () => {
          callback();
        },
        onCancel: () => {
          cleanTicket();
        }
      });
    }
  };

  assignValidator = () => {
    Modal.destroyAll();
    [
      {
        ticketKey: ABSENCE_VALIDATOR_TICKET,
        role: "validateur d'absence",
        callback: this.props.assignAbsenceValidatorAccount
      },
      {
        ticketKey: PROJECT_VALIDATOR_TICKET,
        role: "validateur des rapport d'activité",
        callback: this.props.assignProjectValidatorAccount
      },
      {
        ticketKey: RESOURCE_TICKET,
        role: 'ressource',
        callback: this.props.assignResourceAccount
      },
      {
        ticketKey: EXPENSE_VALIDATOR_TICKET,
        role: 'validateur des notes de frais',
        callback: this.props.assignExpenseAccount
      },
      {
        ticketKey: PROJECT_CONTRACTOR_TICKET,
        role: 'intermédiare',
        callback: this.props.assignProjectContractorAccount
      }
    ].map(ticket => this.assignAccount(ticket.ticketKey, ticket.role, ticket.callback));
  };

  setRedirectionLink = () => {
    this.props.getMyCompanies();
    this.props.setHomeLink('/app/home');
  };

  isSessionLoading = () => {
    const { companies, companiesLoading, companySessionLoading, currentCompany, sessionLoading, ticketLoading } = this.props;
    if (sessionLoading) {
      return 'Informations du compte utilisateur';
    }
    if (companiesLoading) {
      return 'Vos entreprises';
    }
    if (companies.length > 0 && (companySessionLoading || !currentCompany)) {
      return 'Vos rôles d\'application';
    }
    if (ticketLoading) {
      return 'Vos new rôles d\'application';
    }
    return false;
  };

  render() {
    if (this.state.unauthorized) {
      return (
        <div className="padding-3rem">
          <Card style={{ textAlign: 'center' }}>
            <h2>Accès refusé</h2>
            <Divider>
              <Icon type="close-circle" theme="filled" style={{ color: '#f5222d', fontSize: 48 }} />
            </Divider>
            <p>Vous n'êtes pas autorisé à accéder à cette page !</p>
            <br />
            <Button onClick={this.unauthorizedLogin}>Connexion</Button>
          </Card>
        </div>
      );
    }
    const { forceRedirectLink, location } = this.props;
    /*
    if (this.props.applicationProfile.inProduction && detect().name !== 'chrome') {
      return (
        <p className="browserupgrade">
          Cette application est compatible uniquement avec Google Chrome
          <a href="https://www.google.com/chrome/"> Télécharger Chrome </a>
          pour une meilleure expérience.
        </p>
      );
    }
    */
    if (location.pathname !== '/logout' && forceRedirectLink && !location.pathname.startsWith(forceRedirectLink)) {
      return <Redirect to={forceRedirectLink} />;
    }
    const sessionLoading = this.isSessionLoading();
    return (
      <LocaleProvider locale={langProvider}>
        <Suspense fallback={<LoadingDiv />}>
          <LoadingBar className="loading-bar" />
          <Route path="/" component={Login} />
          {!!sessionLoading ? (
            <LoginLoading loadingMessage={this.isSessionLoading()} />
          ) : (
            <>
              <Switch>
                <Route path="/logout">
                  <Logout />
                </Route>
                <Route path="/activate/:key?">
                  <Activate />
                </Route>
                <Route path="/password-forget">
                  <PasswordResetInit />
                </Route>
                <Route path="/reset/finish/:key?">
                  <PasswordResetFinish />
                </Route>
                <Route path="/signup/:account_type?/:ticket(ticket/\d+)?">
                  <Signup />
                </Route>
                <Route path="/app" component={AppRoutes} />
                <Route path="/">
                  <LandingPage />
                </Route>
              </Switch>
            </>
          )}
        </Suspense>
      </LocaleProvider>
    );
  }
}

const mapStateToProps = ({ application, authentication, applicationProfile, company }: IRootState) => ({
  applicationProfile,
  isAuthenticated: authentication.isAuthenticated,
  sessionLoading: authentication.loading,
  forceRedirectLink: application.redirection.forceRedirectLink,
  companies: company.entities,
  companiesLoading: company.loading,
  currentCompany: application.company.current,
  companySessionLoading: application.company.session_loading,
  ticketLoading: application.ticket.checking
});

const mapDispatchToProps = {
  getSession,
  getProfile,
  setHomeLink,
  getCompanyByCurrentHost,
  assignAbsenceValidatorAccount: AbsenceValidatorsExt.assignAccount,
  assignProjectValidatorAccount: ProjectValidatorExt.assignAccount,
  assignResourceAccount: ResourceExt.assignAccount,
  assignExpenseAccount: ExpenseValidatorExt.assignAccount,
  assignProjectContractorAccount: ProjectContractorExt.assignAccount,
  getMyCompanies: Company.getMyCompanies,
  checkNewTickets,
  getAllConstants
};

type DispatchProps = typeof mapDispatchToProps;
type StateProps = ReturnType<typeof mapStateToProps>;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
