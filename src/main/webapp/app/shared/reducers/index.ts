import { combineReducers } from 'redux';
import { loadingBarReducer as loadingBar } from 'react-redux-loading-bar';

import authentication, { AuthenticationState } from './authentication';
import applicationProfile, { ApplicationProfileState } from './application-profile';

import administration, { AdministrationState } from 'app/modules/administration/administration.reducer';
import userManagement, { UserManagementState } from 'app/modules/administration/user-management/user-management.reducer';
import register, { RegisterState } from 'app/modules/account/register/register.reducer';
import activate, { ActivateState } from 'app/modules/account/activate/activate.reducer';
import password, { PasswordState } from 'app/modules/account/password/password.reducer';
import settings, { SettingsState } from 'app/modules/account/settings/settings.reducer';
import passwordReset, { PasswordResetState } from 'app/modules/account/password-reset/password-reset.reducer';
// prettier-ignore
import holiday, {
  HolidayState
} from 'app/entities/holiday/holiday.reducer';
// prettier-ignore
import persistedConfiguration, {
  PersistedConfigurationState
} from 'app/entities/persisted-configuration/persisted-configuration.reducer';
// prettier-ignore
import constant, {
  ConstantState
} from 'app/entities/constant/constant.reducer';
// prettier-ignore
import company, {
  CompanyState
} from 'app/entities/company/company.reducer';
// prettier-ignore
import resource, {
  ResourceState
} from 'app/entities/resource/resource.reducer';
// prettier-ignore
import resourceContract, {
  ResourceContractState
} from 'app/entities/resource-contract/resource-contract.reducer';
// prettier-ignore
import resourceConfiguration, {
  ResourceConfigurationState
} from 'app/entities/resource-configuration/resource-configuration.reducer';
// prettier-ignore
import absence, {
  AbsenceState
} from 'app/entities/absence/absence.reducer';
// prettier-ignore
import absenceType, {
  AbsenceTypeState
} from 'app/entities/absence-type/absence-type.reducer';
// prettier-ignore
import absenceValidator, {
  AbsenceValidatorState
} from 'app/entities/absence-validator/absence-validator.reducer';
// prettier-ignore
import absenceBalance, {
  AbsenceBalanceState
} from 'app/entities/absence-balance/absence-balance.reducer';
// prettier-ignore
import absenceBalanceAdjustment, {
  AbsenceBalanceAdjustmentState
} from 'app/entities/absence-balance-adjustment/absence-balance-adjustment.reducer';
// prettier-ignore
import project, {
  ProjectState
} from 'app/entities/project/project.reducer';
// prettier-ignore
import projectResource, {
  ProjectResourceState
} from 'app/entities/project-resource/project-resource.reducer';
// prettier-ignore
import projectResourceInfo, {
  ProjectResourceInfoState
} from 'app/entities/project-resource-info/project-resource-info.reducer';
// prettier-ignore
import projectValidator, {
  ProjectValidatorState
} from 'app/entities/project-validator/project-validator.reducer';
// prettier-ignore
import projectContractor, {
  ProjectContractorState
} from 'app/entities/project-contractor/project-contractor.reducer';
// prettier-ignore
import standardActivity, {
  StandardActivityState
} from 'app/entities/standard-activity/standard-activity.reducer';
// prettier-ignore
import exceptionalActivity, {
  ExceptionalActivityState
} from 'app/entities/exceptional-activity/exceptional-activity.reducer';
// prettier-ignore
import activityReport, {
  ActivityReportState
} from 'app/entities/activity-report/activity-report.reducer';
// prettier-ignore
import expense, {
  ExpenseState
} from 'app/entities/expense/expense.reducer';
// prettier-ignore
import expenseType, {
  ExpenseTypeState
} from 'app/entities/expense-type/expense-type.reducer';
// prettier-ignore
import expenseValidator, {
  ExpenseValidatorState
} from 'app/entities/expense-validator/expense-validator.reducer';
// prettier-ignore
import client, {
  ClientState
} from 'app/entities/client/client.reducer';
// prettier-ignore
import clientContact, {
  ClientContactState
} from 'app/entities/client-contact/client-contact.reducer';
// prettier-ignore
import invoice, {
  InvoiceState
} from 'app/entities/invoice/invoice.reducer';
// prettier-ignore
import invoiceItem, {
  InvoiceItemState
} from 'app/entities/invoice-item/invoice-item.reducer';
// prettier-ignore
import invoiceFile, {
  InvoiceFileState
} from 'app/entities/invoice-file/invoice-file.reducer';
// prettier-ignore
import activityReportFile, {
  ActivityReportFileState
} from 'app/entities/activity-report-file/activity-report-file.reducer';
// prettier-ignore
import absenceJustification, {
  AbsenceJustificationState
} from 'app/entities/absence-justification/absence-justification.reducer';
// prettier-ignore
import expenseJustification, {
  ExpenseJustificationState
} from 'app/entities/expense-justification/expense-justification.reducer';
/* jhipster-needle-add-reducer-import - JHipster will add reducer here */
import application, { IApplicationStates } from 'app/application/common/reducers';

export interface IRootState {
  readonly authentication: AuthenticationState;
  readonly applicationProfile: ApplicationProfileState;
  readonly administration: AdministrationState;
  readonly userManagement: UserManagementState;
  readonly register: RegisterState;
  readonly activate: ActivateState;
  readonly passwordReset: PasswordResetState;
  readonly password: PasswordState;
  readonly settings: SettingsState;
  readonly holiday: HolidayState;
  readonly persistedConfiguration: PersistedConfigurationState;
  readonly constant: ConstantState;
  readonly company: CompanyState;
  readonly resource: ResourceState;
  readonly resourceContract: ResourceContractState;
  readonly resourceConfiguration: ResourceConfigurationState;
  readonly absence: AbsenceState;
  readonly absenceType: AbsenceTypeState;
  readonly absenceValidator: AbsenceValidatorState;
  readonly absenceBalance: AbsenceBalanceState;
  readonly absenceBalanceAdjustment: AbsenceBalanceAdjustmentState;
  readonly project: ProjectState;
  readonly projectResource: ProjectResourceState;
  readonly projectResourceInfo: ProjectResourceInfoState;
  readonly projectValidator: ProjectValidatorState;
  readonly projectContractor: ProjectContractorState;
  readonly standardActivity: StandardActivityState;
  readonly exceptionalActivity: ExceptionalActivityState;
  readonly activityReport: ActivityReportState;
  readonly expense: ExpenseState;
  readonly expenseType: ExpenseTypeState;
  readonly expenseValidator: ExpenseValidatorState;
  readonly client: ClientState;
  readonly clientContact: ClientContactState;
  readonly invoice: InvoiceState;
  readonly invoiceItem: InvoiceItemState;
  readonly invoiceFile: InvoiceFileState;
  readonly activityReportFile: ActivityReportFileState;
  readonly absenceJustification: AbsenceJustificationState;
  readonly expenseJustification: ExpenseJustificationState;
  /* jhipster-needle-add-reducer-type - JHipster will add reducer type here */
  readonly loadingBar: any;
  readonly application: IApplicationStates;
}

const rootReducer = combineReducers<IRootState>({
  authentication,
  applicationProfile,
  administration,
  userManagement,
  register,
  activate,
  passwordReset,
  password,
  settings,
  holiday,
  persistedConfiguration,
  constant,
  company,
  resource,
  resourceContract,
  resourceConfiguration,
  absence,
  absenceType,
  absenceValidator,
  absenceBalance,
  absenceBalanceAdjustment,
  project,
  projectResource,
  projectResourceInfo,
  projectValidator,
  projectContractor,
  standardActivity,
  exceptionalActivity,
  activityReport,
  expense,
  expenseType,
  expenseValidator,
  client,
  clientContact,
  invoice,
  invoiceItem,
  invoiceFile,
  activityReportFile,
  absenceJustification,
  expenseJustification,
  /* jhipster-needle-add-reducer-combine - JHipster will add reducer here */
  loadingBar,
  application
});

export default rootReducer;
