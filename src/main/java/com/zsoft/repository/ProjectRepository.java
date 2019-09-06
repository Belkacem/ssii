package com.zsoft.repository;

import com.zsoft.domain.Project;
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
 * Spring Data  repository for the Project entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {

    @Nonnull
    @Override
    @PreAuthorize("@projectSecurity.checkWrite(#entity)")
    <S extends Project> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@projectSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectSecurity.checkReadCollection(returnObject)")
    List<Project> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectSecurity.checkReadPage(returnObject)")
    Page<Project> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectSecurity.checkReadOptional(returnObject)")
    Optional<Project> findById(@Nonnull Long id);
}
