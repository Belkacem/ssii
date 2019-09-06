package com.zsoft.service.security;

import com.zsoft.domain.AbsenceBalanceAdjustment;
import com.zsoft.repository.extensions.AbsenceBalanceAdjustmentRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;
import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserSystem;

@Service
@Transactional(readOnly = true)
public class AbsenceBalanceAdjustmentSecurity implements EntitySecurity<AbsenceBalanceAdjustment, Long> {

    private final AbsenceBalanceAdjustmentRepositoryExt absenceBalanceAdjustmentRepositoryExt;
    private AbsenceBalanceSecurity absenceBalanceSecurity;

    public AbsenceBalanceAdjustmentSecurity(AbsenceBalanceAdjustmentRepositoryExt absenceBalanceAdjustmentRepositoryExt) {
        this.absenceBalanceAdjustmentRepositoryExt = absenceBalanceAdjustmentRepositoryExt;
    }

    @Override
    public JpaRepository<AbsenceBalanceAdjustment, Long> getRepository() {
        return this.absenceBalanceAdjustmentRepositoryExt;
    }

    @Autowired
    public void setAbsenceBalanceSecurity(AbsenceBalanceSecurity absenceBalanceSecurity) {
        this.absenceBalanceSecurity = absenceBalanceSecurity;
    }

    @Override
    public Long getId(AbsenceBalanceAdjustment absenceBalanceAdjustment) {
        return absenceBalanceAdjustment.getId();
    }

    @Override
    public boolean checkCreate(AbsenceBalanceAdjustment absenceBalanceAdjustment) {
        return isCurrentUserAdmin()
              ||
              isCurrentUserSystem()
              ||
              this.absenceBalanceSecurity.checkCreate(absenceBalanceAdjustment.getAbsenceBalance());
    }

}
