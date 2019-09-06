package com.zsoft.service.security;

import com.zsoft.domain.ActivityReportFile;
import com.zsoft.repository.extensions.ActivityReportFileRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Nonnull;
import java.util.Optional;

import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;

@Service
@Transactional(readOnly = true)
public class ActivityReportFileSecurity implements EntitySecurity<ActivityReportFile, Long> {

    private final ActivityReportFileRepositoryExt activityReportFileRepositoryExt;
    private ActivityReportSecurity activityReportSecurity;

    public ActivityReportFileSecurity(ActivityReportFileRepositoryExt activityReportFileRepositoryExt) {
        this.activityReportFileRepositoryExt = activityReportFileRepositoryExt;
    }

    @Override
    public JpaRepository<ActivityReportFile, Long> getRepository() {
        return activityReportFileRepositoryExt;
    }

    @Autowired
    public void setActivityReportSecurity(ActivityReportSecurity activityReportSecurity) {
        this.activityReportSecurity = activityReportSecurity;
    }

    @Override
    public Long getId(ActivityReportFile activityReportFile) {
        return activityReportFile.getId();
    }

    @Override
    public boolean checkReadOptional(@Nonnull Optional<ActivityReportFile> optionalActivityReportFile) {
        return isCurrentUserAdmin() || optionalActivityReportFile
            .map(this::checkRead)
            .orElse(true);
    }

    @Override
    public boolean checkRead(ActivityReportFile activityReportFile) {
        return activityReportFile.getActivityReport() == null
            ? this.checkReadId(activityReportFile.getId())
            : this.activityReportSecurity.checkRead(activityReportFile.getActivityReport());
    }

    @Override
    public boolean checkCreate(ActivityReportFile activityReportFile) {
        return activityReportFile.getActivityReport() == null
            ? this.checkCreateId(activityReportFile.getId())
            : this.activityReportSecurity.checkUpdate(activityReportFile.getActivityReport());
    }

}
