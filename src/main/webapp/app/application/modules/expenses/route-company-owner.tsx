import React, { FunctionComponent, useState } from 'react';
import { Route, Switch } from 'react-router-dom';

import ValidatorList from './expense-validators/expense-validators-list';
import Expenses from './expense-lists/expenses-list-per-company';

export default function ExpensesRoute() {
  return (
    <Switch>
      <Route path="/app/company/expenses/validators" component={ValidatorList} />
      <Route path="/app/company/expenses/:expense_id?" component={Expenses} />
    </Switch>
  );
}
