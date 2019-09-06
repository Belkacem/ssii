package com.zsoft.repository;

import com.zsoft.domain.ActivityReportFile;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.Optional;


/**
 * Spring Data  repository for the ActivityReportFile entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ActivityReportFileRepository extends JpaRepository<ActivityReportFile, Long> {
    @Nonnull
    @Override
    @PreAuthorize("@activityReportFileSecurity.checkWrite(#entity)")
    <S extends ActivityReportFile> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@activityReportFileSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportFileSecurity.checkReadPage(returnObject)")
    Page<ActivityReportFile> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportFileSecurity.checkReadOptional(returnObject)")
    Optional<ActivityReportFile> findById(@Nonnull Long id);
}
