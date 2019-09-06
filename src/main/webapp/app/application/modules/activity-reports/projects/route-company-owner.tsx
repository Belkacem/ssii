import React from 'react';
import { Route } from 'react-router-dom';

import ProjectsList from './project-lists/projects-list';

export default function ProjectsRoute() {
  return <Route path="/app/company/projects/:project_id(\d+)?/(add)?" component={ProjectsList} />;
}
