package com.zsoft.service.security;

import com.zsoft.domain.ExpenseValidator;
import com.zsoft.repository.extensions.CompanyRepositoryExt;
import com.zsoft.repository.extensions.ExpenseValidatorRepositoryExt;
import com.zsoft.repository.extensions.ResourceRepositoryExt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.security.SecurityUtils.getCurrentUserId;
import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserCompanyOwner;

@Service
@Transactional(readOnly = true)
public class ExpenseValidatorSecurity implements EntitySecurity<ExpenseValidator, Long> {

    private final ExpenseValidatorRepositoryExt expenseValidatorRepositoryExt;
    private final CompanyRepositoryExt companyRepositoryExt;
    private final ResourceRepositoryExt resourceRepositoryExt;

    public ExpenseValidatorSecurity(
        ExpenseValidatorRepositoryExt expenseValidatorRepositoryExt,
        CompanyRepositoryExt companyRepositoryExt,
        ResourceRepositoryExt resourceRepositoryExt
    ) {
        this.expenseValidatorRepositoryExt = expenseValidatorRepositoryExt;
        this.companyRepositoryExt = companyRepositoryExt;
        this.resourceRepositoryExt = resourceRepositoryExt;
    }

    @Override
    public JpaRepository<ExpenseValidator, Long> getRepository() {
        return this.expenseValidatorRepositoryExt;
    }

    @Override
    public Long getId(ExpenseValidator expenseValidator) {
        return expenseValidator.getId();
    }

    @Override
    public boolean checkCreate(ExpenseValidator expenseValidator) {
        return isCurrentUserCompanyOwner() &&
            (
                expenseValidator.getCompany() == null ?
                    this.checkCreateId(expenseValidator.getId()) :
                    this.companyRepositoryExt
                        .findByOwnerIsCurrentUser()
                        .stream()
                        .anyMatch(company -> company.getId().equals(expenseValidator.getCompany().getId()))
            );
    }

    @Override
    public boolean checkRead(ExpenseValidator expenseValidator) {
        return this.checkCreate(expenseValidator) || (
            getCurrentUserId()
                .map(userId -> expenseValidator.getUser() == null ?
                    this.checkReadId(expenseValidator.getId()) :
                    userId.equals(expenseValidator.getUser().getId())
                )
                .orElse(false)
        ) || (
            this.resourceRepositoryExt
                .findByUserIsCurrentUser()
                .stream()
                .anyMatch(resource -> resource.getCompany().getId().equals(expenseValidator.getCompany().getId()))
        );
    }
}
