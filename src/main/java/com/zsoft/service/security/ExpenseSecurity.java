package com.zsoft.service.security;

import com.zsoft.domain.Expense;
import com.zsoft.domain.Resource;
import com.zsoft.repository.extensions.ExpenseRepositoryExt;
import com.zsoft.repository.extensions.ExpenseValidatorRepositoryExt;
import com.zsoft.repository.extensions.ResourceConfigurationRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;

@Service
@Transactional(readOnly = true)
public class ExpenseSecurity implements EntitySecurity<Expense, Long> {

    private final ExpenseRepositoryExt expenseRepositoryExt;
    private final ResourceConfigurationRepositoryExt resourceConfigurationRepositoryExt;
    private final ExpenseValidatorRepositoryExt expenseValidatorRepositoryExt;
    private ResourceSecurity resourceSecurity;

    public ExpenseSecurity(
        ExpenseRepositoryExt expenseRepositoryExt,
        ResourceConfigurationRepositoryExt resourceConfigurationRepositoryExt,
        ExpenseValidatorRepositoryExt expenseValidatorRepositoryExt
    ) {
        this.expenseRepositoryExt = expenseRepositoryExt;
        this.resourceConfigurationRepositoryExt = resourceConfigurationRepositoryExt;
        this.expenseValidatorRepositoryExt = expenseValidatorRepositoryExt;
    }

    @Override
    public JpaRepository<Expense, Long> getRepository() {
        return expenseRepositoryExt;
    }

    @Autowired
    public void setResourceSecurity(ResourceSecurity resourceSecurity) {
        this.resourceSecurity = resourceSecurity;
    }

    @Override
    public Long getId(Expense expense) {
        return expense.getId();
    }

    public Boolean canReportExpenses(Resource resource) {
        return resourceConfigurationRepositoryExt
            .findByResourceId(resource.getId())
            .map(resourceConfiguration -> resourceConfiguration.isActive() && resourceConfiguration.isCanReportExpenses())
            .orElse(false);
    }

    @Override
    public boolean checkRead(Expense expense) {
        return this.checkCreate(expense) ||
            (
                (expense.getResource() == null || expense.getResource().getCompany() == null) ?
                    this.checkReadId(expense.getId()) :
                    (
                        this.expenseValidatorRepositoryExt
                            .findByUserIsCurrentUser()
                            .stream()
                            .anyMatch(expenseValidator -> expenseValidator.getCompany().getId().equals(expense.getResource().getCompany().getId()))
                    )
            );
    }

    @Override
    public boolean checkUpdate(Expense expense) {
        return this.checkRead(expense);
    }

    @Override
    public boolean checkCreate(Expense expense) {
        return isCurrentUserAdmin() ||
            (
                expense.getResource() == null
                ? this.checkCreateId(expense.getId())
                : (this.canReportExpenses(expense.getResource()) && this.resourceSecurity.checkUpdateId(expense.getResource().getId()))
            );
    }

}
