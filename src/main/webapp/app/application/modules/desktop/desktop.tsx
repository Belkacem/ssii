import React, { FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import { DesktopShortcut } from 'app/application/components/desktop-shortcut';
import { hasAnyAuthority } from 'app/application/common/utils/user-utils';
import { AUTHORITIES } from 'app/application/common/config/constants';
import { IRootState } from 'app/shared/reducers';

import { countNotValidated as countNotValidatedAbsences } from 'app/application/entities/absence/absence.actions';
import { countNotValidated as countNotValidatedExpenses } from 'app/application/entities/expense/expense.actions';
import { DashboardCompanyOwner } from 'app/application/modules/dashboard/company-owner';
import { DashboardResource } from 'app/application/modules/dashboard/resource';
import { ACCOUNT_TYPES } from 'app/application/common/layout/header/change-account-modal';

interface IDesktopProps extends StateProps, DispatchProps {}

const Desktop: FunctionComponent<IDesktopProps> = props => {
  const { companies, account, companySessionLoading, currentCompany, currentAccountType } = props;
  useEffect(
    () => {
      if (!!props.currentAbsenceValidator) {
        props.countNotValidatedAbsences();
      }
    },
    [props.currentAbsenceValidator]
  );

  useEffect(
    () => {
      if (!!props.currentExpenseValidator) {
        props.countNotValidatedExpenses();
      }
    },
    [props.currentExpenseValidator]
  );
  if (
    companies.length > 0 &&
    !hasAnyAuthority(props.account.authorities, [AUTHORITIES.ADMIN]) &&
    (companySessionLoading || !currentCompany)
  ) {
    return <div />;
  }

  if (currentAccountType === ACCOUNT_TYPES.COMPANY_OWNER) {
    return <DashboardCompanyOwner account={account} currentCompany={currentCompany} />;
  }
  if (currentAccountType === ACCOUNT_TYPES.RESOURCE) {
    return <DashboardResource resource={props.currentResource} currentCompany={currentCompany} />;
  }
  return (
    <div className="desktop">
      {/* Admin Quick Access */}
      {currentAccountType === ACCOUNT_TYPES.ADMIN && (
        <div className="desktop-shortcuts">
          <DesktopShortcut title="Utilisateurs" link="/app/admin/users" icon="team" />
          <DesktopShortcut title="Fériés" link="/app/admin/holidays" icon="carry-out" />
          <DesktopShortcut title="Types de congé" link="/app/admin/absence-types" icon="calendar" />
          <DesktopShortcut title="Notes de frais" link="/app/admin/expense-types" icon="euro" />
          <DesktopShortcut title="Configurations" link="/app/admin/configuration" icon="setting" />
        </div>
      )}
      {/* Absence Validator Quick Access */}
      {currentAccountType === ACCOUNT_TYPES.ABSENCE_VALIDATOR && (
        <div className="desktop-shortcuts">
          <DesktopShortcut title="Congés et Absences" link="/app/absences" icon="calendar">
            {props.notValidAbsences > 0 && props.notValidAbsences}
          </DesktopShortcut>
        </div>
      )}
      {/* Project Validator Quick Access */}
      {currentAccountType === ACCOUNT_TYPES.PROJECT_VALIDATOR && (
        <div className="desktop-shortcuts">
          <DesktopShortcut title="Rapports d'activités à valider" link="/app/activities" icon="audit" />
        </div>
      )}

      {/* Expense Validator Quick Access */}
      {currentAccountType === ACCOUNT_TYPES.EXPENSE_VALIDATOR && (
        <div className="desktop-shortcuts">
          <DesktopShortcut title="Notes de frais" link="/app/expenses" icon="euro">
            {props.notValidExpenses > 0 && props.notValidExpenses}
          </DesktopShortcut>
        </div>
      )}
      {/* Project Contractor Quick Access */}
      {currentAccountType === ACCOUNT_TYPES.PROJECT_CONTRACTOR && (
        <div className="desktop-shortcuts">
          <DesktopShortcut title="Rapports d'activités" link="/app/activities" icon="audit" />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = ({ application, authentication, company }: IRootState) => ({
  account: authentication.account,
  notValidAbsences: application.absence.pending.totalItems,
  notValidExpenses: application.expense.pending.totalItems,
  currentResource: application.resource.current.entity,
  currentAbsenceValidator: application.absenceValidator.current,
  currentExpenseValidator: application.expenseValidator.current,
  companies: company.entities,
  currentCompany: application.company.current,
  companySessionLoading: application.company.session_loading,
  currentAccountType: application.accountType.type
});

const mapDispatchToProps = {
  countNotValidatedAbsences,
  countNotValidatedExpenses
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(Desktop);
