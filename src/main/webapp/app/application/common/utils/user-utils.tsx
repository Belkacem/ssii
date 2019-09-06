import { ICompany } from 'app/shared/model/company.model';
import { IProjectValidator } from 'app/shared/model/project-validator.model';
import { IProject } from 'app/shared/model/project.model';

/**
 * Check if current user is the owner of the current company
 * @param account: current user
 * @param company: current company
 * @return boolean
 */
export const isOwner = (account, company: ICompany) => !!account && !!company && company.ownerId === account.id;

export const isCurrentProjectValidator = (projectValidator: IProjectValidator, project: IProject) =>
  !!projectValidator && !!project && project.id === projectValidator.projectId;

export const hasAnyAuthority = (authorities: string[], hasAnyAuthorities: string[]) => {
  if (authorities && authorities.length !== 0) {
    if (hasAnyAuthorities.length === 0) {
      return true;
    }
    return hasAnyAuthorities.some(auth => authorities.includes(auth));
  }
  return false;
};
