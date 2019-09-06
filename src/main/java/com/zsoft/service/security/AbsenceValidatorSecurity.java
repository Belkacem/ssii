package com.zsoft.service.security;

import com.zsoft.domain.AbsenceValidator;
import com.zsoft.repository.extensions.AbsenceValidatorRepositoryExt;
import com.zsoft.repository.extensions.CompanyRepositoryExt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.security.SecurityUtils.getCurrentUserId;
import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;
import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserCompanyOwner;

@Service
@Transactional(readOnly = true)
public class AbsenceValidatorSecurity implements EntitySecurity<AbsenceValidator, Long> {

    private final AbsenceValidatorRepositoryExt absenceValidatorRepositoryExt;
    private final CompanyRepositoryExt companyRepositoryExt;

    public AbsenceValidatorSecurity(
        AbsenceValidatorRepositoryExt absenceValidatorRepositoryExt,
        CompanyRepositoryExt companyRepositoryExt
    ) {
        this.absenceValidatorRepositoryExt = absenceValidatorRepositoryExt;
        this.companyRepositoryExt = companyRepositoryExt;
    }

    @Override
    public JpaRepository<AbsenceValidator, Long> getRepository() {
        return this.absenceValidatorRepositoryExt;
    }

    @Override
    public Long getId(AbsenceValidator absenceValidator) {
        return absenceValidator.getId();
    }

    @Override
    public boolean checkCreate(AbsenceValidator absenceValidator) {
        return isCurrentUserAdmin() || isCurrentUserCompanyOwner() &&
            absenceValidator.getCompany() == null ?
            this.checkCreateId(absenceValidator.getId()) :
            this.companyRepositoryExt
                .findByOwnerIsCurrentUser()
                .stream()
                .anyMatch(company -> company.getId().equals(absenceValidator.getCompany().getId()));
    }

    @Override
    public boolean checkRead(AbsenceValidator absenceValidator) {
        return  // if it's the company owner
            this.checkCreate(absenceValidator)
                // is current user
                || getCurrentUserId()
                .map(userId -> absenceValidator.getUser() == null ?
                    this.checkReadId(absenceValidator.getId()) :
                    userId.equals(absenceValidator.getUser().getId())
                )
                .orElse(false)
                // if it's resource of this absence validator
                || getCurrentUserId()
                .map(userId -> absenceValidator.getResources() == null ?
                    this.checkReadId(absenceValidator.getId()) :
                    absenceValidator.getResources().stream().anyMatch(resource -> resource.getUser() != null && userId.equals(resource.getUser().getId())))
                .orElse(false);
    }
}
