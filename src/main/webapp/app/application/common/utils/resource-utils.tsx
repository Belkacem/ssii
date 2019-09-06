import { IResource } from 'app/shared/model/resource.model';
import { ContractType } from 'app/shared/model/resource-contract.model';

/**
 * Get Resource Full Name
 * @param {Resource} resource
 * @return firstName + lastName or email if is draft
 */
export function getFullName(resource: IResource): string {
  if (resource.draft || (!resource.firstName && !resource.lastName)) {
    return resource.email;
  }
  return resource.firstName + ' ' + resource.lastName;
}

export function getCurrentStep(profile: IResource) {
  let step = 0;
  if (profile && profile.firstName && profile.lastName && profile.dateOfBirth && profile.gender) {
    step++;
    if (profile.phoneNumber && profile.addressLine1 && profile.city && profile.postalCode && profile.country) {
      step++;
      if (profile.hireDate) {
        step++;
        if (profile.countryOfBirth && profile.townOfBirth && profile.citizenShip) {
          step++;
        }
      }
    }
  }
  return step;
}

export function getResourceProgress(profile: IResource) {
  let profileProgress = 0;
  if (profile) {
    if (profile.email) {
      profileProgress++;
    }
    if (profile.firstName) {
      profileProgress++;
    }
    if (profile.lastName) {
      profileProgress++;
    }
    if (profile.gender) {
      profileProgress++;
    }
    if (profile.dateOfBirth) {
      profileProgress++;
    }
    if (profile.phoneNumber) {
      profileProgress++;
    }
    if (profile.hireDate) {
      profileProgress++;
    }
    if (profile.countryOfBirth) {
      profileProgress++;
    }
    if (profile.townOfBirth) {
      profileProgress++;
    }
    if (profile.citizenShip) {
      profileProgress++;
    }
    if (profile.addressLine1) {
      profileProgress++;
    }
    if (profile.city) {
      profileProgress++;
    }
    if (profile.postalCode) {
      profileProgress++;
    }
    if (profile.country) {
      profileProgress++;
    }
  }
  return { value: profileProgress, max: 14 };
}

export function getCompensationLabel(contractType: string) {
  switch (contractType) {
    case ContractType.EMPLOYEE:
      return 'Salaire Brut';
    case ContractType.INTERN:
      return 'Gratification Mensuelle';
    case ContractType.FREELANCE:
      return 'TJM';
    default:
      return 'Compensation';
  }
}
