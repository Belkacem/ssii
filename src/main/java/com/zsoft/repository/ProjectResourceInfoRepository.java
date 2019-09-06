package com.zsoft.repository;

import com.zsoft.domain.ProjectResourceInfo;
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
 * Spring Data  repository for the ProjectResourceInfo entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ProjectResourceInfoRepository extends JpaRepository<ProjectResourceInfo, Long>, JpaSpecificationExecutor<ProjectResourceInfo> {

    @Nonnull
    @Override
    @PreAuthorize("@projectResourceInfoSecurity.checkWrite(#entity)")
    <S extends ProjectResourceInfo> S save(@Nonnull @P("entity") S entity);

    @Override
    @PreAuthorize("@projectResourceInfoSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceInfoSecurity.checkReadCollection(returnObject)")
    List<ProjectResourceInfo> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceInfoSecurity.checkReadPage(returnObject)")
    Page<ProjectResourceInfo> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectResourceInfoSecurity.checkReadOptional(returnObject)")
    Optional<ProjectResourceInfo> findById(@Nonnull Long id);
}
