package com.zsoft.service.security;

import com.zsoft.domain.*;
import com.zsoft.repository.extensions.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.security.SecurityUtils.getCurrentUserId;
import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;
import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserCompanyOwner;

@Service
@Transactional(readOnly = true)
public class CompanySecurity implements EntitySecurity<Company, Long> {

    private final CompanyRepositoryExt companyRepositoryExt;
    private final ResourceRepositoryExt resourceRepositoryExt;
    private final AbsenceValidatorRepositoryExt absenceValidatorRepositoryExt;
    private final ProjectValidatorRepositoryExt projectValidatorRepositoryExt;
    private final ExpenseValidatorRepositoryExt expenseValidatorRepositoryExt;
    private final ProjectContractorRepositoryExt projectContractorRepositoryExt;
    private ResourceSecurity resourceSecurity;

    public CompanySecurity(
        CompanyRepositoryExt companyRepositoryExt,
        ResourceRepositoryExt resourceRepositoryExt,
        AbsenceValidatorRepositoryExt absenceValidatorRepositoryExt,
        ProjectValidatorRepositoryExt projectValidatorRepositoryExt,
        ExpenseValidatorRepositoryExt expenseValidatorRepositoryExt,
        ProjectContractorRepositoryExt projectContractorRepositoryExt
    ) {
        this.companyRepositoryExt = companyRepositoryExt;
        this.resourceRepositoryExt = resourceRepositoryExt;
        this.absenceValidatorRepositoryExt = absenceValidatorRepositoryExt;
        this.projectValidatorRepositoryExt = projectValidatorRepositoryExt;
        this.expenseValidatorRepositoryExt = expenseValidatorRepositoryExt;
        this.projectContractorRepositoryExt = projectContractorRepositoryExt;
    }

    @Override
    public JpaRepository<Company, Long> getRepository() {
        return this.companyRepositoryExt;
    }

    @Autowired
    public void setResourceSecurity(ResourceSecurity resourceSecurity) {
        this.resourceSecurity = resourceSecurity;
    }

    @Override
    public Long getId(Company company) {
        return company.getId();
    }

    @Override
    public boolean checkRead(Company company) {
        return this.checkWrite(company) ||
            this.resourceRepositoryExt
                .findByUserIsCurrentUser()
                .stream()
                .map(Resource::getCompany)
                .anyMatch(resourceCompany -> resourceCompany.getId().equals(company.getId())) ||
            this.absenceValidatorRepositoryExt
                .findByUserIsCurrentUser()
                .stream()
                .map(AbsenceValidator::getCompany)
                .anyMatch(validatorCompany -> validatorCompany.getId().equals(company.getId())) ||
            this.projectValidatorRepositoryExt
                .findByUserIsCurrentUser()
                .stream()
                .map(ProjectValidator::getProject)
                .map(Project::getCompany)
                .anyMatch(projectCompany -> projectCompany.getId().equals(company.getId())) ||
            this.expenseValidatorRepositoryExt
                .findByUserIsCurrentUser()
                .stream()
                .map(ExpenseValidator::getCompany)
                .anyMatch(validatorCompany -> validatorCompany.getId().equals(company.getId())) ||
            this.projectContractorRepositoryExt
                .findByUserIsCurrentUser()
                .stream()
                .map(ProjectContractor::getProject)
                .map(Project::getCompany)
                .anyMatch(projectCompany -> projectCompany.getId().equals(company.getId())) ||
            this.resourceRepositoryExt
                .findAllByCompanyId(company.getId())
                .stream()
                .anyMatch(resourceSecurity::checkRead);
    }

    @Override
    public boolean checkCreate(Company company) {
        return isCurrentUserAdmin() ||
            isCurrentUserCompanyOwner() &&
                getCurrentUserId()
                    .map(userId -> company.getOwner() == null ?
                        this.checkCreateId(company.getId()) :
                        userId.equals(company.getOwner().getId()))
                    .orElse(false);
    }

}
