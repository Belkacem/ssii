import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Users from './users';
import Holidays from './holidays/holidays';
import AbsenceTypes from './absence-types/absence-types';
import ExpenseTypes from './expense-types/expense-types';
import Configuration from './configuration/constants-list';
import EntityManager from './entity-manager/entity-manager';
import Administration from './administration';

export default function Admin() {
  return (
    <Switch>
      <Route path="/app/admin/users" component={Users} />
      <Route path="/app/admin/holidays" component={Holidays} />
      <Route path="/app/admin/absence-types" component={AbsenceTypes} />
      <Route path="/app/admin/expense-types" component={ExpenseTypes} />
      <Route path="/app/admin/configuration" component={Configuration} />
      <Route path="/app/admin/entity-manager" component={EntityManager} />
      <Route path="/app/admin/system-tools" component={Administration} />
    </Switch>
  );
}
