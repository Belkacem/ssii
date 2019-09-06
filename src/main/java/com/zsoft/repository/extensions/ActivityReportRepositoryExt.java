package com.zsoft.repository.extensions;

import com.zsoft.domain.ActivityReport;
import com.zsoft.domain.Resource;
import com.zsoft.repository.ActivityReportRepository;
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
 * Spring Data  repository for the ActivityReport entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ActivityReportRepositoryExt extends ActivityReportRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportSecurity.checkReadPage(returnObject)")
    Page<ActivityReport> findAllByProjectResource_Project_IdAndSubmittedAndEditable(Long projectId, Boolean submitted, Boolean editable, Pageable page);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportSecurity.checkReadCollection(returnObject)")
    List<ActivityReport> findAllByProjectResource_Project_IdAndSubmittedAndEditable(Long projectId, Boolean submitted, Boolean editable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportSecurity.checkReadCollection(returnObject)")
    List<ActivityReport> findAllByIdIn(List<Long> reportsIds);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportSecurity.checkReadPage(returnObject)")
    Page<ActivityReport> findAllByIdIn(List<Long> reports, Pageable page);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportSecurity.checkReadCollection(returnObject)")
    List<ActivityReport> findByProjectResource_ResourceAndProjectResource_ActiveIsTrueAndMonthLessThanEqualAndSubmittedIsFalse(Resource resource, LocalDate month);

    @PreAuthorize("isAuthenticated()")
    boolean existsActivityReportByMonthAndProjectResource_Id(LocalDate month, Long projectResourceId);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportSecurity.checkReadCollection(returnObject)")
    List<ActivityReport> findAllByMonthLessThanEqual(LocalDate month);

    // criteria functions

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportSecurity.checkReadCollection(returnObject)")
    List<ActivityReport> findAllByProjectResource_IdInAndMonth(List<Long> projectResourceIds, LocalDate month, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportSecurity.checkReadCollection(returnObject)")
    List<ActivityReport> findAllByProjectResource_IdIn(List<Long> projectResourceIds, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportSecurity.checkReadPage(returnObject)")
    Page<ActivityReport> findAllByProjectResource_Resource_IdAndMonth(Long resourceId, LocalDate month, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportSecurity.checkReadPage(returnObject)")
    Page<ActivityReport> findAllByProjectResource_Resource_Id(Long resourceId, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportSecurity.checkReadPage(returnObject)")
    Page<ActivityReport> findAllByProjectResource_Resource_Company_IdAndMonth(Long companyId, LocalDate month, Pageable pageable);
}
