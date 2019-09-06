import { combineReducers } from 'redux';
import company, { CompanyReducer } from 'app/application/entities/company/company.reducer';
import resourceCurrent, { ResourceCurrentReducer } from 'app/application/entities/resource/resource-current.reducer';
import resourceName, { ResourceNameReducer } from 'app/application/entities/resource/resource-name.reducer';
import absenceList, { AbsenceListReducer } from 'app/application/entities/absence/absence-list.reducer';
import absencePendingList, { AbsencePendingListReducer } from 'app/application/entities/absence/absence-pending-list.reducer';
import absenceDisabledList, { AbsenceDisabledListReducer } from 'app/application/entities/absence/absence-disabled-list.reducer';
import absenceCalendar, { AbsenceCalendarReducer } from 'app/application/entities/absence/absence-calendar.reducer';
import redirection, { RedirectionReducer } from './redirection/redirection.reducer';
import projectValidator, { ProjectValidatorReducer } from 'app/application/entities/project-validator/project-validator.reducer';
import exceptionalActivity, {
  ExceptionalActivityReducer
} from 'app/application/entities/exceptional-activity/exceptional-activity.reducer';
import standardActivity, { StandardActivityReducer } from 'app/application/entities/standard-activity/standard-activity.reducer';
import absenceValidator, { AbsenceValidatorReducer } from 'app/application/entities/absence-validator/absence-validator.reducer';
import resourceContract, { ResourceContractReducer } from 'app/application/entities/resource-contract/resource-contract.reducer';
import address, { AddressReducer } from 'app/application/entities/address/address.reducer';
import client, { ClientReducer } from 'app/application/entities/client/client.reducer';
import invoice, { InvoiceReducer } from 'app/application/entities/invoice/invoice.reducer';
import invoiceList, { InvoiceListReducer } from 'app/application/entities/invoice/invoice-list.reducer';
import activityReport, { ActivityReportReducer } from 'app/application/entities/activity-report/activity-report.reducer';
import activityReportList, { ActivityReportListReducer } from 'app/application/entities/activity-report/activity-report-list.reducer';
import ticket, { TicketReducer } from './ticket/ticket.reducer';
import expenseValidator, { ExpenseValidatorReducer } from 'app/application/entities/expense-validator/expense-validator.reducer';
import expenseList, { ExpenseListReducer } from 'app/application/entities/expense/expense-list.reducer';
import expensePendingList, { ExpensePendingListReducer } from 'app/application/entities/expense/expense-pending-list.reducer';
import projectContractor, { ProjectContractorReducer } from 'app/application/entities/project-contractor/project-contractor.reducer';
import domainName, { DomainNameReducer } from 'app/application/common/reducers/domain-name/domain-name.reducer';
import projectList, { ProjectListReducer } from 'app/application/entities/project/project-list.reducer';
import accountType, { AccountTypeReducer } from './account/account-type.reducer';
// form states
import activityReportTimeSheet, {
  ActivityReportTimeSheetReducer
} from 'app/application/entities/activity-report/activity-report-timesheet.reducer';
import loginForm, { LoginReducer } from './account/login.reducer';

export interface IApplicationStates {
  company: CompanyReducer;
  resource: {
    name: ResourceNameReducer;
    current: ResourceCurrentReducer;
  };
  absence: {
    list: AbsenceListReducer;
    pending: AbsencePendingListReducer;
    disabled: AbsenceDisabledListReducer;
    calendar: AbsenceCalendarReducer;
  };
  redirection: RedirectionReducer;
  projectValidator: ProjectValidatorReducer;
  activityReport: ActivityReportReducer;
  exceptionalActivity: ExceptionalActivityReducer;
  standardActivity: StandardActivityReducer;
  absenceValidator: AbsenceValidatorReducer;
  resourceContract: ResourceContractReducer;
  address: AddressReducer;
  client: ClientReducer;
  invoice: InvoiceReducer;
  invoiceList: InvoiceListReducer;
  activityReportList: ActivityReportListReducer;
  ticket: TicketReducer;
  expenseValidator: ExpenseValidatorReducer;
  expense: {
    list: ExpenseListReducer;
    pending: ExpensePendingListReducer;
  };
  projectContractor: ProjectContractorReducer;
  domainName: DomainNameReducer;
  project: {
    list: ProjectListReducer;
  };
  forms: {
    activityReport: ActivityReportTimeSheetReducer;
    login: LoginReducer;
  };
  accountType: AccountTypeReducer;
}

const applicationReducer = combineReducers<IApplicationStates>({
  resource: combineReducers({
    name: resourceName,
    current: resourceCurrent
  }),
  company,
  absence: combineReducers({
    list: absenceList,
    pending: absencePendingList,
    disabled: absenceDisabledList,
    calendar: absenceCalendar
  }),
  redirection,
  projectValidator,
  activityReport,
  exceptionalActivity,
  standardActivity,
  absenceValidator,
  resourceContract,
  address,
  client,
  invoice,
  invoiceList,
  activityReportList,
  ticket,
  expenseValidator,
  expense: combineReducers({
    list: expenseList,
    pending: expensePendingList
  }),
  projectContractor,
  domainName,
  project: combineReducers({
    list: projectList
  }),
  accountType,
  forms: combineReducers({
    activityReport: activityReportTimeSheet,
    login: loginForm
  })
});

export default applicationReducer;
