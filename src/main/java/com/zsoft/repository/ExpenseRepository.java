package com.zsoft.repository;

import com.zsoft.domain.Expense;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the Expense entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("select expense from Expense expense where expense.creator.login = ?#{principal.username}")
    List<Expense> findByCreatorIsCurrentUser();

    @Nonnull
    @Override
    @PreAuthorize("@expenseSecurity.checkWrite(#entity)")
    <S extends Expense> S save(@Nonnull @P("entity") S entity);

    @Override
    @PreAuthorize("@expenseSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseSecurity.checkReadPage(returnObject)")
    Page<Expense> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseSecurity.checkReadOptional(returnObject)")
    Optional<Expense> findById(@Nonnull Long id);
}
