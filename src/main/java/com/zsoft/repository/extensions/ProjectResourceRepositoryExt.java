package com.zsoft.repository.extensions;

import com.zsoft.domain.ProjectResource;
import com.zsoft.repository.ProjectResourceRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
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
public interface ProjectResourceRepositoryExt extends ProjectResourceRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceSecurity.checkReadCollection(returnObject)")
    List<ProjectResource> findProjectResourcesByActiveIsTrue();

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceSecurity.checkReadCollection(returnObject)")
    List<ProjectResource> findAllByProject_Id(Long projectId);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceSecurity.checkReadOptional(returnObject)")
    Optional<ProjectResource> findByProject_IdAndResource_Id(Long projectId, Long resourceId);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceSecurity.checkReadOptional(returnObject)")
    Optional<ProjectResource> findByIdAndProject_Id(Long id, Long projectId);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceSecurity.checkReadPage(returnObject)")
    Page<ProjectResource> findAllByProject_IdIn(List<Long> projectIds, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceSecurity.checkReadPage(returnObject)")
    Page<ProjectResource> findAllByIdIn(List<Long> ids, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceSecurity.checkReadPage(returnObject)")
    Page<ProjectResource> findAllByResource_Id(Long resourceId, Pageable pageable);
}
