package com.zsoft.repository;

import com.zsoft.domain.StandardActivity;
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
 * Spring Data  repository for the StandardActivity entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface StandardActivityRepository extends JpaRepository<StandardActivity, Long>, JpaSpecificationExecutor<StandardActivity> {

    @Nonnull
    @Override
    @PreAuthorize("@standardActivitySecurity.checkWrite(#entity)")
    <S extends StandardActivity> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@standardActivitySecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@standardActivitySecurity.checkReadCollection(returnObject)")
    List<StandardActivity> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@standardActivitySecurity.checkReadPage(returnObject)")
    Page<StandardActivity> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@standardActivitySecurity.checkReadOptional(returnObject)")
    Optional<StandardActivity> findById(@Nonnull Long id);
}
