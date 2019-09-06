package com.zsoft.repository;

import com.zsoft.domain.ProjectContractor;
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
 * Spring Data  repository for the ProjectContractor entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ProjectContractorRepository extends JpaRepository<ProjectContractor, Long>, JpaSpecificationExecutor<ProjectContractor> {

    @PreAuthorize("isAuthenticated()")
    @Query("select project_contractor from ProjectContractor project_contractor where project_contractor.user.login = ?#{principal.username}")
    List<ProjectContractor> findByUserIsCurrentUser();

    @Nonnull
    @Override
    @PreAuthorize("@projectContractorSecurity.checkWrite(#entity)")
    <S extends ProjectContractor> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@projectContractorSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectContractorSecurity.checkReadCollection(returnObject)")
    List<ProjectContractor> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectContractorSecurity.checkReadPage(returnObject)")
    Page<ProjectContractor> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectContractorSecurity.checkReadOptional(returnObject)")
    Optional<ProjectContractor> findById(@Nonnull Long id);
}
