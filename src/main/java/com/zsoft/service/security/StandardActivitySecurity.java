package com.zsoft.service.security;

import com.zsoft.domain.StandardActivity;
import com.zsoft.repository.extensions.StandardActivityRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StandardActivitySecurity implements EntitySecurity<StandardActivity, Long> {

    private final StandardActivityRepositoryExt standardActivityRepositoryExt;
    private ActivityReportSecurity activityReportSecurity;

    public StandardActivitySecurity(StandardActivityRepositoryExt standardActivityRepositoryExt) {
        this.standardActivityRepositoryExt = standardActivityRepositoryExt;
    }

    @Override
    public JpaRepository<StandardActivity, Long> getRepository() {
        return this.standardActivityRepositoryExt;
    }

    @Autowired
    public void setActivityReportSecurity(ActivityReportSecurity activityReportSecurity) {
        this.activityReportSecurity = activityReportSecurity;
    }

    @Override
    public Long getId(StandardActivity standardActivity) {
        return standardActivity.getId();
    }

    @Override
    public boolean checkUpdate(StandardActivity standardActivity) {
        return this.checkRead(standardActivity);
    }

    @Override
    public boolean checkCreate(StandardActivity standardActivity) {
        return standardActivity.getActivityReport() == null ?
                this.checkCreateId(standardActivity.getId()) :
                this.activityReportSecurity.checkUpdate(standardActivity.getActivityReport());
    }

    @Override
    public boolean checkRead(StandardActivity standardActivity) {
        return standardActivity.getActivityReport() == null ?
                this.checkCreateId(standardActivity.getId()) :
                this.activityReportSecurity.checkRead(standardActivity.getActivityReport());
    }
}
