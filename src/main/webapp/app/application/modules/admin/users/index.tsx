import React from 'react';
import { Switch, Route } from 'react-router-dom';

import UsersList from './users-list';
import UsersNew from './users-new';
import UsersUpdate from './users-update';
import UsersDetails from './users-details';

export default function Users() {
  return (
    <Switch>
      <Route exact path="/app/admin/users/new" component={UsersNew} />
      <Route exact path="/app/admin/users/:login/update" component={UsersUpdate} />
      <Route exact path="/app/admin/users/:login" component={UsersDetails} />
      <Route path="/app/admin/users" component={UsersList} />
    </Switch>
  );
}
