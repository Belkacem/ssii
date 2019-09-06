import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import ResourcesList from './resource-list/resources-list';

export default function Resources() {
  return (
    <>
      <Route path="/app/company/resources/:resource_id(\d+)?/(new)?" component={ResourcesList} />
    </>
  );
}
