import React from 'react';
import { Route } from 'react-router-dom';
import ClientsList from './client-list/clients-list';

export default function ClientsRoute() {
  return <Route path="/app/company/clients/:client_id(details/\d+)?/(add)?" component={ClientsList} />;
}
