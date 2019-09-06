package com.zsoft.repository.extensions;

import com.zsoft.domain.StandardActivity;
import com.zsoft.repository.StandardActivityRepository;
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
public interface StandardActivityRepositoryExt extends StandardActivityRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@standardActivitySecurity.checkReadCollection(returnObject)")
    List<StandardActivity> findAllByActivityReport_Id(Long reportId);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@standardActivitySecurity.checkReadCollection(returnObject)")
    List<StandardActivity> findAllByIdIn(List<Long> standardActivitiesIds);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@standardActivitySecurity.checkReadPage(returnObject)")
    Page<StandardActivity> findAllByActivityReport_IdIn(List<Long> activityReports, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@standardActivitySecurity.checkReadPage(returnObject)")
    Page<StandardActivity> findAllByActivityReport_IdInAndDateBetween(List<Long> activityReports, LocalDate start, LocalDate end, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@standardActivitySecurity.checkReadPage(returnObject)")
    Page<StandardActivity> findAllByActivityReport_ProjectResource_Resource_IdAndDateBetween(Long resourceId, LocalDate start, LocalDate end, Pageable pageable);
}
