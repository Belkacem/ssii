package com.zsoft.repository;

import com.zsoft.domain.ExpenseJustification;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.Optional;


/**
 * Spring Data  repository for the ExpenseJustification entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ExpenseJustificationRepository extends JpaRepository<ExpenseJustification, Long> {
    @Nonnull
    @Override
    @PreAuthorize("@expenseJustificationSecurity.checkWrite(#entity)")
    <S extends ExpenseJustification> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@expenseJustificationSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseJustificationSecurity.checkReadPage(returnObject)")
    Page<ExpenseJustification> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseJustificationSecurity.checkReadOptional(returnObject)")
    Optional<ExpenseJustification> findById(@Nonnull Long id);
}
