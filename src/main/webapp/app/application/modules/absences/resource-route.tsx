import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Absences from './absence-lists/absences-list-per-resource';
import AbsenceDetails from './absence-details';
import AbsencesCounters from './absence-counters/absence-counters-current-resource';

export default function AbsencesRoute() {
  return (
    <>
      <Switch>
        <Route path="/app/resource/absences/counters" component={AbsencesCounters} />
        <Route path="/app/resource/absences/details/:absence_id" component={AbsenceDetails} />
        <Route path="/app/resource/absences/:absence_id?" component={Absences} />
        <Route path="/app/resource/absences" component={Absences} />
      </Switch>
    </>
  );
}
