import React, { FunctionComponent } from 'react';
import { Switch, Route } from 'react-router-dom';
import ExpensesList from 'app/application/modules/expenses/expense-lists/expenses-list-per-company';
import { IRootState } from 'app/shared/reducers';
import { connect } from 'react-redux';
import { LoadingDiv } from 'app/application/common/config/ui-constants';
import { AccessDenied } from 'app/application/components/errors/access-denied.component';
import { InactiveAccount } from 'app/application/components/errors/inactive-account.component';

interface IExpenseRouteProps extends StateProps, DispatchProps {}

const ExpenseRoute: FunctionComponent<IExpenseRouteProps> = props => {
  const { current, loading, errorMessage } = props;
  if (loading || (!loading && !current && !errorMessage)) {
    return <LoadingDiv />;
  }
  if (!!current && !current.active) {
    return <InactiveAccount fullName={current.fullname} />;
  }
  if (!current) {
    return <AccessDenied />;
  }
  return (
    <Switch>
      <Route path="/app/expenses/:expense_id?" component={ExpensesList} />
    </Switch>
  );
};

const mapStateToProps = ({ application }: IRootState) => ({
  loading: application.expenseValidator.loading,
  current: application.expenseValidator.current,
  errorMessage: application.expenseValidator.errorMessage
});
const mapDispatchToProps = {};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ExpenseRoute);
