package com.zsoft.repository;

import com.zsoft.domain.ExpenseType;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.Optional;

/**
 * Spring Data  repository for the ExpenseType entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ExpenseTypeRepository extends JpaRepository<ExpenseType, Long> {

    @Nonnull
    @Override
    @PreAuthorize("@expenseTypeSecurity.checkWrite(#entity)")
    <S extends ExpenseType> S save(@Nonnull @P("entity") S entity);

    @Override
    @PreAuthorize("@expenseTypeSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PostAuthorize("@expenseTypeSecurity.checkReadPage(returnObject)")
    Page<ExpenseType> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@expenseTypeSecurity.checkReadOptional(returnObject)")
    Optional<ExpenseType> findById(@Nonnull Long id);
}
