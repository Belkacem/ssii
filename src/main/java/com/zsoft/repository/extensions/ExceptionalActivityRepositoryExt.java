package com.zsoft.repository.extensions;

import com.zsoft.domain.ExceptionalActivity;
import com.zsoft.repository.ExceptionalActivityRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.time.LocalDate;
import java.util.List;

/**
 * Spring Data  repository for the StandardActivity entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ExceptionalActivityRepositoryExt extends ExceptionalActivityRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@exceptionalActivitySecurity.checkReadCollection(returnObject)")
    List<ExceptionalActivity> findAllByActivityReport_Id(Long reportId);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@exceptionalActivitySecurity.checkReadCollection(returnObject)")
    List<ExceptionalActivity> findAllByIdIn(List<Long> exceptionalActivitiesIds);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@exceptionalActivitySecurity.checkReadPage(returnObject)")
    Page<ExceptionalActivity> findAllByActivityReport_IdIn(List<Long> activityReports, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@exceptionalActivitySecurity.checkReadPage(returnObject)")
    Page<ExceptionalActivity> findAllByActivityReport_IdInAndDateBetween(List<Long> activityReports, LocalDate start, LocalDate end, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@exceptionalActivitySecurity.checkReadPage(returnObject)")
    Page<ExceptionalActivity> findAllByActivityReport_ProjectResource_Resource_IdAndDateBetween(Long resourceId, LocalDate start, LocalDate end, Pageable pageable);
}
