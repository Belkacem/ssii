package com.zsoft.repository;

import com.zsoft.domain.ExceptionalActivity;
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
 * Spring Data  repository for the ExceptionalActivity entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ExceptionalActivityRepository extends JpaRepository<ExceptionalActivity, Long>, JpaSpecificationExecutor<ExceptionalActivity> {

    @Nonnull
    @Override
    @PreAuthorize("@exceptionalActivitySecurity.checkWrite(#entity)")
    <S extends ExceptionalActivity> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@exceptionalActivitySecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@exceptionalActivitySecurity.checkReadCollection(returnObject)")
    List<ExceptionalActivity> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@exceptionalActivitySecurity.checkReadPage(returnObject)")
    Page<ExceptionalActivity> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@exceptionalActivitySecurity.checkReadOptional(returnObject)")
    Optional<ExceptionalActivity> findById(@Nonnull Long id);
}
