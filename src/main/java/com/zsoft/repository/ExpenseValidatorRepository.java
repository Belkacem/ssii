package com.zsoft.repository;

import com.zsoft.domain.ExpenseValidator;
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
 * Spring Data  repository for the ExpenseValidator entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ExpenseValidatorRepository extends JpaRepository<ExpenseValidator, Long> {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @Query("select expense_validator from ExpenseValidator expense_validator where expense_validator.user.login = ?#{principal.username}")
    List<ExpenseValidator> findByUserIsCurrentUser();

    @Nonnull
    @Override
    @PreAuthorize("@expenseValidatorSecurity.checkWrite(#entity)")
    <S extends ExpenseValidator> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@expenseValidatorSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseValidatorSecurity.checkReadOptional(returnObject)")
    Optional<ExpenseValidator> findById(@Nonnull Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseValidatorSecurity.checkReadPage(returnObject)")
    Page<ExpenseValidator> findAll(@Nonnull Pageable pageable);
}
