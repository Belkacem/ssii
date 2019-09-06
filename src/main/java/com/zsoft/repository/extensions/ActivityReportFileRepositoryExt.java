package com.zsoft.repository.extensions;

import com.zsoft.domain.ActivityReportFile;
import com.zsoft.repository.ActivityReportFileRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;

@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ActivityReportFileRepositoryExt extends ActivityReportFileRepository {
    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportFileSecurity.checkReadOptional(returnObject)")
    Optional<ActivityReportFile> findByActivityReport_Id(Long activityReportId);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@activityReportFileSecurity.checkReadCollection(returnObject)")
    List<ActivityReportFile> findAllByActivityReport_Id_In(List<Long> activityReportIds);
}
