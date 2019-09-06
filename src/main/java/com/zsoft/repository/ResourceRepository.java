package com.zsoft.repository;

import com.zsoft.domain.Resource;
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
 * Spring Data  repository for the Resource entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {

    @PreAuthorize("isAuthenticated()")
    @Query("select resource from Resource resource where resource.user.login = ?#{principal.username}")
    List<Resource> findByUserIsCurrentUser();

    @Nonnull
    @Override
    @PreAuthorize("@resourceSecurity.checkWrite(#entity)")
    <S extends Resource> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@resourceSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceSecurity.checkReadCollection(returnObject)")
    List<Resource> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceSecurity.checkReadPage(returnObject)")
    Page<Resource> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceSecurity.checkReadOptional(returnObject)")
    Optional<Resource> findById(@Nonnull Long id);
}
