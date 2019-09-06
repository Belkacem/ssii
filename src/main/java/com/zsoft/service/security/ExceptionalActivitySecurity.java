package com.zsoft.service.security;

import com.zsoft.domain.ExceptionalActivity;
import com.zsoft.repository.extensions.ExceptionalActivityRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ExceptionalActivitySecurity implements EntitySecurity<ExceptionalActivity, Long> {

    private final ExceptionalActivityRepositoryExt exceptionalActivityRepositoryExt;
    private ActivityReportSecurity activityReportSecurity;

    public ExceptionalActivitySecurity(ExceptionalActivityRepositoryExt exceptionalActivityRepositoryExt) {
        this.exceptionalActivityRepositoryExt = exceptionalActivityRepositoryExt;
    }

    @Override
    public JpaRepository<ExceptionalActivity, Long> getRepository() {
        return this.exceptionalActivityRepositoryExt;
    }

    @Autowired
    public void setActivityReportSecurity(ActivityReportSecurity activityReportSecurity) {
        this.activityReportSecurity = activityReportSecurity;
    }

    @Override
    public Long getId(ExceptionalActivity exceptionalActivity) {
        return exceptionalActivity.getId();
    }

    @Override
    public boolean checkUpdate(ExceptionalActivity exceptionalActivity) {
        return this.checkRead(exceptionalActivity);
    }

    @Override
    public boolean checkCreate(ExceptionalActivity exceptionalActivity) {
        return exceptionalActivity.getActivityReport() == null ?
                this.checkCreateId(exceptionalActivity.getId()) :
                this.activityReportSecurity.checkUpdate(exceptionalActivity.getActivityReport());
    }

    @Override
    public boolean checkRead(ExceptionalActivity exceptionalActivity) {
        return exceptionalActivity.getActivityReport() == null ?
                this.checkCreateId(exceptionalActivity.getId()) :
                this.activityReportSecurity.checkRead(exceptionalActivity.getActivityReport());
    }

}
