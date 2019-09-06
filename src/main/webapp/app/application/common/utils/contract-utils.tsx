import React, { Component } from 'react';
import { Moment } from 'moment';
import { IResourceContract } from 'app/shared/model/resource-contract.model';

export function hasContract(date: Moment, contracts: ReadonlyArray<IResourceContract> = []) {
  return contracts.some(contract => {
    if (!contract.endDate) {
      return date.isSameOrAfter(contract.startDate, 'days');
    }
    return date.isBetween(contract.startDate, contract.endDate, 'days', '[]');
  });
}
