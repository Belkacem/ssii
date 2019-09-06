import React, { Component } from 'react';
import { Moment } from 'moment';
import { IProjectResourceInfo } from 'app/shared/model/project-resource-info.model';
import { IProjectResource } from 'app/shared/model/project-resource.model';

export function hasProjectContract(date: Moment, projectResource: IProjectResource) {
  if (!projectResource) {
    return false;
  }
  if (!projectResource.active) {
    return false;
  }
  if (!projectResource.endDate) {
    return date.isSameOrAfter(projectResource.startDate, 'days');
  }
  return date.isBetween(projectResource.startDate, projectResource.endDate, 'days', '[]');
}

export function hasProjectContractInMonth(month: Moment, projectResourceInfos: ReadonlyArray<IProjectResourceInfo> = []) {
  return projectResourceInfos.some(projectResourceInfo => month.isSameOrAfter(projectResourceInfo.startDate, 'months'));
}
