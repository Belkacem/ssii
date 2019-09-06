import React from 'react';
import { Route } from 'react-router-dom';

import ActivityReportsList from './activity-report-lists/activity-reports-list-per-company';

export default function ActivityReportsRoute() {
  return (
    <Route path="/app/company/activity-reports/:resource_id(\d+)?/:month(\d\d\d\d-\d\d-\d\d)?/(create)?" component={ActivityReportsList} />
  );
}
