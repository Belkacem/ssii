package com.zsoft.service.security;

import com.zsoft.domain.ExpenseType;
import com.zsoft.repository.extensions.ExpenseTypeRepositoryExt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;

@Service
@Transactional(readOnly = true)
public class ExpenseTypeSecurity implements EntitySecurity<ExpenseType, Long> {
    private final ExpenseTypeRepositoryExt expenseTypeRepositoryExt;

    public ExpenseTypeSecurity(ExpenseTypeRepositoryExt expenseTypeRepositoryExt) {
        this.expenseTypeRepositoryExt = expenseTypeRepositoryExt;
    }

    @Override
    public JpaRepository<ExpenseType, Long> getRepository() {
        return this.expenseTypeRepositoryExt;
    }

    @Override
    public Long getId(ExpenseType expenseType) {
        return expenseType.getId();
    }

    @Override
    public boolean checkRead(ExpenseType expenseType) {
        return true;
    }

    @Override
    public boolean checkCreate(ExpenseType expenseType) {
        return isCurrentUserAdmin();
    }

}
