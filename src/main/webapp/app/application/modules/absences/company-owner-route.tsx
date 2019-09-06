import React, { FunctionComponent, lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import { LoadingDiv } from 'app/application/common/config/ui-constants';

import Absences from './absence-lists/absences-list-per-company';
import AbsenceDetails from './absence-details';
import ValidatorList from './absence-validators/absence-validators-list';
import CalendarPerCompany from './absence-calendar/absence-calendar-per-company';

export default function AbsencesRoute() {
  return (
    <Suspense fallback={<LoadingDiv />}>
      <Switch>
        <Route path="/app/company/absences/calendar" component={CalendarPerCompany} />
        <Route path="/app/company/absences/validators" component={ValidatorList} />
        <Route path="/app/company/absences/details/:absence_id" component={AbsenceDetails} />
        <Route path="/app/company/absences/:absence_id?" component={Absences} />
        <Route path="/app/company/absences" component={Absences} />>
      </Switch>
    </Suspense>
  );
}
