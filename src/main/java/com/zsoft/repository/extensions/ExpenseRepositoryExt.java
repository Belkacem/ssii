package com.zsoft.repository.extensions;

import com.zsoft.domain.Expense;
import com.zsoft.repository.ExpenseRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;

/**
 * Spring Data  repository for the Expense entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ExpenseRepositoryExt extends ExpenseRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseSecurity.checkReadPage(returnObject)")
    Page<Expense> findAllByResource_IdInAndValidatorIsNotNull(@Nonnull List<Long> resourceIds, @Nonnull Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseSecurity.checkReadPage(returnObject)")
    Page<Expense> findAllByResource_IdInAndValidatorIsNull(@Nonnull List<Long> resourceIds, @Nonnull Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseSecurity.checkReadPage(returnObject)")
    Page<Expense> findDistinctByResource_Company_IdAndValidatorIsNotNullAndSubmissionDateIsNotNull(@Nonnull Long company, @Nonnull Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseSecurity.checkReadPage(returnObject)")
    Page<Expense> findDistinctByResource_Company_IdAndValidatorIsNullAndSubmissionDateIsNotNull(@Nonnull Long company, @Nonnull Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseSecurity.checkReadPage(returnObject)")
    Page<Expense> findDistinctByResource_Company_IdAndValidator_IdAndSubmissionDateIsNotNull(@Nonnull Long company, @Nonnull Long validatorId, @Nonnull Pageable pageable);
}
