import React from 'react';
import { Route } from 'react-router-dom';

import ActivityReportsList from './activity-report-lists/activity-reports-list-per-resource';

export default function ActivityReportsRoute() {
  return <Route path="/app/resource/my-activities/:month?" component={ActivityReportsList} />;
}
