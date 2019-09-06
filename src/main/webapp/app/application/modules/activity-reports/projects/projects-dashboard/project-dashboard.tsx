import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Alert, Icon, Tabs } from 'antd';
import * as Project from 'app/entities/project/project.reducer';
import ProjectDetails from './project-details';
import ProjectResourcesList from 'app/application/modules/activity-reports/projects/project-resources/project-resources-list';
import ProjectResourcesDetails from 'app/application/modules/activity-reports/projects/project-resources/project-resources-details';
import ProjectValidatorsList from 'app/application/modules/activity-reports/projects/project-validators/project-validators-list';
import ProjectContractorsList from 'app/application/modules/activity-reports/projects/project-contractors/project-contractors-list';
import ActivityReportsList from 'app/application/modules/activity-reports/activity-report-lists/activity-reports-list-per-project';
import ActivityReportById from 'app/application/modules/activity-reports/activity-report-details/activity-report-by-id';
import ActivityReportsCreation from 'app/application/modules/activity-reports/activity-report-create/activity-reports-create';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import InvoicesList from '../../../invoices/invoice-lists/invoices-list-per-project';
import InvoicesDetails from 'app/application/modules/invoices/invoice-details/invoice-details';
import CreditNoteCreate from 'app/application/modules/invoices/invoice-create/credit-note-create';
import InvoicesUpdate from 'app/application/modules/invoices/invoice-update/invoices-update';
import pathToRegexp from 'path-to-regexp';

interface IProjectDashboardProps extends StateProps, DispatchProps, RouteComponentProps<{ project_id; active_tab }> {}

const ProjectDashboard: FunctionComponent<IProjectDashboardProps> = props => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { project, errorMessage } = props;

  useEffect(
    () => {
      if (!!props.match.params.project_id) {
        props.getProject(props.match.params.project_id);
      }
    },
    [props.match.params.project_id]
  );

  useEffect(
    () => {
      if (!!props.match.params.active_tab) {
        setActiveTab(props.match.params.active_tab);
      }
    },
    [props.match.params.active_tab]
  );

  const handleChangeTab = (tab: string) => {
    if (tab !== props.match.params.active_tab) {
      const toPath = pathToRegexp.compile(props.match.path);
      props.history.push(toPath({ active_tab: tab, project_id: props.match.params.project_id }));
    }
  };

  if (errorMessage && errorMessage.response.status === 404) {
    return (
      <div className="padding-3rem">
        <Alert
          message={
            <small>
              <b>Erreur: </b>
              Projet non trouvé !
            </small>
          }
          type="error"
          showIcon
        />
      </div>
    );
  }
  return (
    <div className="page-layout" style={{ height: '100%' }}>
      <PageHead title={project.nom} onBack="/app/company/projects" backOnlyMobile margin={false} />
      <div className="page-content">
        <Tabs activeKey={activeTab} onTabClick={handleChangeTab} size="small" tabBarGutter={16} animated={{ inkBar: false, tabPane: true }}>
          <Tabs.TabPane
            tab={
              <small>
                <Icon type="info-circle" /> À propos
              </small>
            }
            key="dashboard"
          >
            <Switch>
              <Route path="/app/company/projects/:project_id/dashboard" component={ProjectDetails} />
              <Route path="/app/company/projects/:project_id" component={ProjectDetails} />
            </Switch>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <small>
                <Icon type="team" /> Membres
              </small>
            }
            key="members"
          >
            <Switch>
              <Route path="/app/company/projects/:project_id/members/:project_resource_id" component={ProjectResourcesDetails} />
              <Route path="/app/company/projects/:project_id/members" component={ProjectResourcesList} />
              <Route path="/app/company/projects/:project_id" component={ProjectResourcesList} />
            </Switch>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <small>
                <Icon type="safety-certificate" /> Validateurs
              </small>
            }
            key="validators"
          >
            <Switch>
              <Route path="/app/company/projects/:project_id/validators" component={ProjectValidatorsList} />
              <Route path="/app/company/projects/:project_id" component={ProjectValidatorsList} />
            </Switch>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <small>
                <Icon type="solution" /> Intermédiaires
              </small>
            }
            key="contractors"
          >
            <Switch>
              <Route path="/app/company/projects/:project_id/contractors" component={ProjectContractorsList} />
              <Route path="/app/company/projects/:project_id" component={ProjectContractorsList} />
            </Switch>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <small>
                <Icon type="file-done" /> Rapports d'activités
              </small>
            }
            key="activity-reports"
          >
            <Switch>
              <Route path="/app/company/projects/:project_id/activity-reports/create" component={ActivityReportsCreation} />
              <Route path="/app/company/projects/:project_id/activity-reports/:report_id" component={ActivityReportById} />
              <Route path="/app/company/projects/:project_id/activity-reports" component={ActivityReportsList} />
              <Route path="/app/company/projects/:project_id" component={ActivityReportsList} />
            </Switch>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <small>
                <Icon type="file-pdf" /> Factures
              </small>
            }
            key="invoices"
          >
            <Switch>
              <Route path="/app/company/projects/:project_id/invoices/credit-note/create/:invoice_id" component={CreditNoteCreate} />
              <Route path="/app/company/projects/:project_id/invoices/update/:invoice_id" component={InvoicesUpdate} />
              <Route path="/app/company/projects/:project_id/invoices/:invoice_id" component={InvoicesDetails} />
              <Route path="/app/company/projects/:project_id/invoices" component={InvoicesList} />
              <Route path="/app/company/projects/:project_id" component={InvoicesList} />
            </Switch>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

const mapStateToProps = ({ project }: IRootState) => ({
  project: project.entity,
  errorMessage: project.errorMessage,
  loading: project.loading
});

const mapDispatchToProps = { getProject: Project.getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ProjectDashboard);
