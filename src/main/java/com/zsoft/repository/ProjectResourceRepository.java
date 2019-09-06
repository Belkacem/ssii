package com.zsoft.repository;

import com.zsoft.domain.ProjectResource;
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
 * Spring Data  repository for the ProjectResource entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ProjectResourceRepository extends JpaRepository<ProjectResource, Long> {

    @Nonnull
    @Override
    @PreAuthorize("@projectResourceSecurity.checkWrite(#entity)")
    <S extends ProjectResource> S save(@Nonnull @P("entity") S entity);

    @Override
    @PreAuthorize("@projectResourceSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceSecurity.checkReadCollection(returnObject)")
    List<ProjectResource> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceSecurity.checkReadPage(returnObject)")
    Page<ProjectResource> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceSecurity.checkReadOptional(returnObject)")
    Optional<ProjectResource> findById(@Nonnull Long id);
}
