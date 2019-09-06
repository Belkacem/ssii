package com.zsoft.repository.extensions;

import com.zsoft.domain.ExpenseJustification;
import com.zsoft.repository.ExpenseJustificationRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;

@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ExpenseJustificationRepositoryExt extends ExpenseJustificationRepository {
    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseJustificationSecurity.checkReadCollection(returnObject)")
    List<ExpenseJustification> findAllByExpense_Id(Long expenseId);
}
