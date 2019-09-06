package com.zsoft.repository;

import com.zsoft.domain.ProjectValidator;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the ProjectValidator entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ProjectValidatorRepository extends JpaRepository<ProjectValidator, Long>, JpaSpecificationExecutor<ProjectValidator> {

    @PreAuthorize("isAuthenticated()")
    @Query("select project_validator from ProjectValidator project_validator where project_validator.user.login = ?#{principal.username}")
    List<ProjectValidator> findByUserIsCurrentUser();

    @PreAuthorize("isAuthenticated()")
    @Query("select project_validator from ProjectValidator project_validator " +
          "where project_validator.user.login = ?#{principal.username} " +
          "and project_validator.project.company.id = :companyId")
    List<ProjectValidator> findByUserIsCurrentUserAndCompanyId(@Param("companyId") Long companyId);

    @PreAuthorize("isAuthenticated()")
    @Query("select project_validator from ProjectValidator project_validator " +
          "where project_validator.user.login = ?#{principal.username} " +
          "and project_validator.project.id = :projectId")
    List<ProjectValidator> findByUserIsCurrentUserAndProjectId(@Param("projectId") Long projectId);

    @Nonnull
    @Override
    @PreAuthorize("@projectValidatorSecurity.checkWrite(#entity)")
    <S extends ProjectValidator> S save(@Nonnull @P("entity") S entity);

    @Nonnull
    @Override
    @PreAuthorize("@projectValidatorSecurity.checkWrite(#entity)")
    <S extends ProjectValidator> S saveAndFlush(@Nonnull @P("entity") S entity);

    @Override
    @PreAuthorize("@projectValidatorSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectValidatorSecurity.checkReadCollection(returnObject)")
    List<ProjectValidator> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectValidatorSecurity.checkReadPage(returnObject)")
    Page<ProjectValidator> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectValidatorSecurity.checkReadOptional(returnObject)")
    Optional<ProjectValidator> findById(@Nonnull Long id);
}
