package com.zsoft.service.security;

import com.zsoft.domain.ExpenseJustification;
import com.zsoft.repository.extensions.ExpenseJustificationRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ExpenseJustificationSecurity implements EntitySecurity<ExpenseJustification, Long> {

    private final ExpenseJustificationRepositoryExt expenseJustificationRepositoryExt;
    private ExpenseSecurity expenseSecurity;

    public ExpenseJustificationSecurity(ExpenseJustificationRepositoryExt expenseJustificationRepositoryExt) {
        this.expenseJustificationRepositoryExt = expenseJustificationRepositoryExt;
    }

    @Override
    public JpaRepository<ExpenseJustification, Long> getRepository() {
        return expenseJustificationRepositoryExt;
    }

    @Autowired
    public void setExpenseSecurity(ExpenseSecurity expenseSecurity) {
        this.expenseSecurity = expenseSecurity;
    }

    @Override
    public Long getId(ExpenseJustification expenseJustification) {
        return expenseJustification.getId();
    }

    @Override
    public boolean checkRead(ExpenseJustification expenseJustification) {
        return expenseJustification.getExpense() == null
            ? this.checkReadId(expenseJustification.getId())
            : this.expenseSecurity.checkRead(expenseJustification.getExpense());
    }

    @Override
    public boolean checkCreate(ExpenseJustification expenseJustification) {
        return expenseJustification.getExpense() == null
            ? this.checkCreateId(expenseJustification.getId())
            : this.expenseSecurity.checkCreate(expenseJustification.getExpense());
    }

}
