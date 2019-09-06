package com.zsoft.repository.extensions;

import com.zsoft.domain.ProjectResource;
import com.zsoft.domain.ProjectResourceInfo;
import com.zsoft.repository.ProjectResourceInfoRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;

/**
 * Spring Data  repository for the ProjectResourceInfo entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ProjectResourceInfoRepositoryExt extends ProjectResourceInfoRepository {
    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceInfoSecurity.checkReadCollection(returnObject)")
    List<ProjectResourceInfo> findAllByProjectResource(ProjectResource projectResource);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceInfoSecurity.checkReadPage(returnObject)")
    Page<ProjectResourceInfo> findAllByProjectResource_IdIn(List<Long> projectResourceIds, Pageable pageable);
}
