package com.zsoft.service.security;

import com.zsoft.domain.AbsenceBalance;
import com.zsoft.repository.extensions.AbsenceBalanceRepositoryExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserAdmin;
import static com.zsoft.service.security.UserSecurityUtils.isCurrentUserSystem;

@Service
@Transactional(readOnly = true)
public class AbsenceBalanceSecurity implements EntitySecurity<AbsenceBalance, Long> {

    private final AbsenceBalanceRepositoryExt absenceBalanceRepositoryExt;
    private ResourceSecurity resourceSecurity;

    public AbsenceBalanceSecurity(AbsenceBalanceRepositoryExt absenceBalanceRepositoryExt) {
        this.absenceBalanceRepositoryExt = absenceBalanceRepositoryExt;
    }

    @Override
    public JpaRepository<AbsenceBalance, Long> getRepository() {
        return this.absenceBalanceRepositoryExt;
    }

    @Autowired
    public void setResourceSecurity(ResourceSecurity resourceSecurity) {
        this.resourceSecurity = resourceSecurity;
    }

    @Override
    public Long getId(AbsenceBalance absenceBalance) {
        return absenceBalance.getId();
    }

    @Override
    public boolean checkRead(AbsenceBalance absenceBalance) {
        return isCurrentUserAdmin() || isCurrentUserSystem() ||
            (
                absenceBalance.getResource() == null ?
                    this.checkCreateId(absenceBalance.getId()) :
                    this.resourceSecurity.checkRead(absenceBalance.getResource())
            );
    }

    @Override
    public boolean checkCreate(AbsenceBalance absenceBalance) {
        return isCurrentUserAdmin() || isCurrentUserSystem() ||
            (
                absenceBalance.getResource() == null ?
                    this.checkCreateId(absenceBalance.getId()) :
                    this.resourceSecurity.checkCreate(absenceBalance.getResource())
            );
    }

}
