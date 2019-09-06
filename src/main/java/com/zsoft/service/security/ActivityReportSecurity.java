package com.zsoft.service.security;

import com.zsoft.domain.ActivityReport;
import com.zsoft.domain.ProjectResource;
import com.zsoft.repository.extensions.ActivityReportRepositoryExt;
import com.zsoft.repository.extensions.ProjectResourceRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;
import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserSystem;

@Service
@Transactional(readOnly = true)
public class ActivityReportSecurity implements EntitySecurity<ActivityReport, Long> {

    private final ProjectResourceRepositoryExt projectResourceRepositoryExt;
    private final ActivityReportRepositoryExt activityReportRepositoryExt;
    private ProjectResourceSecurity projectResourceSecurity;
    private ResourceSecurity resourceSecurity;

    public ActivityReportSecurity(ProjectResourceRepositoryExt projectResourceRepositoryExt,
                                  ActivityReportRepositoryExt activityReportRepositoryExt) {
        this.projectResourceRepositoryExt = projectResourceRepositoryExt;
        this.activityReportRepositoryExt = activityReportRepositoryExt;
    }

    @Override
    public JpaRepository<ActivityReport, Long> getRepository() {
        return this.activityReportRepositoryExt;
    }

    @Autowired
    public void setProjectResourceSecurity(ProjectResourceSecurity projectResourceSecurity) {
        this.projectResourceSecurity = projectResourceSecurity;
    }

    @Autowired
    public void setResourceSecurity(ResourceSecurity resourceSecurity) {
        this.resourceSecurity = resourceSecurity;
    }

    @Override
    public Long getId(ActivityReport activityReport) {
        return activityReport.getId();
    }

    @Override
    public boolean checkCreate(ActivityReport activityReport) {
        return isCurrentUserAdmin() || isCurrentUserSystem() ||
            (
                activityReport.getProjectResource() == null ?
                    this.checkCreateId(activityReport.getId()) :
                    this.projectResourceSecurity.checkCreate(activityReport.getProjectResource())
            );
    }

    @Override
    public boolean checkRead(ActivityReport activityReport) {
        return isCurrentUserAdmin() || isCurrentUserSystem() ||
            (
                activityReport.getProjectResource() == null
                    ? this.checkReadId(activityReport.getId())
                    : this.projectResourceSecurity.checkRead(activityReport.getProjectResource())
            );
    }

    @Override
    public boolean checkUpdate(ActivityReport activityReport) {
        if (isCurrentUserAdmin() || isCurrentUserSystem()) {
            return true;
        }
        if (activityReport.getProjectResource() == null) {
            activityReport = this.activityReportRepositoryExt.findById(activityReport.getId())
                .orElseThrow(() -> new IllegalStateException("Unable to find activity report."));
        }
        ProjectResource projectResource = activityReport.getProjectResource();
        if (projectResource.getResource() == null) {
            projectResource = this.projectResourceRepositoryExt.findById(projectResource.getId())
                .orElseThrow(() -> new IllegalStateException("Unable to find project ressource."));
        }
        return this.resourceSecurity.checkUpdateId(projectResource.getResource().getId());
    }

}
