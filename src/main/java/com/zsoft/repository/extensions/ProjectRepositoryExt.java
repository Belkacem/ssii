package com.zsoft.repository.extensions;

import com.zsoft.domain.Project;
import com.zsoft.repository.ProjectRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;

@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ProjectRepositoryExt extends ProjectRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectSecurity.checkReadPage(returnObject)")
    Page<Project> findAllByCompanyId(Long companyId, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectSecurity.checkReadPage(returnObject)")
    Page<Project> findAllByIdIn(List<Long> ids, Pageable pageable);
}
